import { ProxyManager } from './proxy-manager';
import { ApiClient } from '../api/client';
import { StorageManager } from '../lib/storage';
import { ConnectionManager } from './connection-manager';
import type { ExtensionMessage, MessageResponse } from '@shared/types';
import { CONNECTION_CONFIG } from '@shared/constants';
import { logger } from '../lib/logger';

/**
 * Background Service Worker
 * Manages VPN connections, proxy configuration, and communication with the API
 */
class BackgroundService {
  private proxyManager: ProxyManager;
  private apiClient: ApiClient;
  private storage: StorageManager;
  private connectionManager: ConnectionManager;
  private isInitialized = false;

  constructor() {
    this.storage = new StorageManager();
    this.apiClient = new ApiClient();
    this.proxyManager = new ProxyManager();
    this.connectionManager = new ConnectionManager(
      this.proxyManager,
      this.apiClient,
      this.storage
    );

    this.initialize();
  }

  /**
   * Initialize background service
   */
  private async initialize() {
    if (this.isInitialized) return;

    logger.log('🚀 Personal VPN Background Service starting...');

    try {
      // Ensure user is registered
      await this.ensureUserRegistered();

      // Restore connection state on startup
      const state = await this.storage.getConnectionState();
      if (state.isConnected && state.serverId) {
        logger.log('Restoring previous connection...');
        try {
          await this.connectionManager.connect(state.serverId);
        } catch (error) {
          logger.error('Failed to restore connection:', error);
          await this.connectionManager.disconnect();
        }
      }

      // Setup listeners
      this.setupMessageListeners();
      this.setupAlarms();

      this.isInitialized = true;
      logger.log('✅ Background service initialized');
    } catch (error) {
      logger.error('❌ Background service initialization failed:', error);
    }
  }

  /**
   * Ensure user is registered with the API
   */
  private async ensureUserRegistered(): Promise<void> {
    const token = await this.storage.getAuthToken();

    if (!token) {
      logger.log('No auth token found, registering user...');

      // Get or generate anonymous ID
      let anonymousId = await this.storage.getAnonymousId();
      if (!anonymousId) {
        anonymousId = this.generateAnonymousId();
        await this.storage.setAnonymousId(anonymousId);
      }

      // Register with API
      const response = await this.apiClient.register({ deviceId: anonymousId });

      if (response.success && response.data) {
        await this.storage.setAuthToken(response.data.token);
        await this.storage.setUserId(response.data.userId);
        await this.storage.setAnonymousId(response.data.anonymousId);
        logger.log('✅ User registered successfully');
      } else {
        throw new Error('Failed to register user');
      }
    } else {
      logger.log('✅ User already registered');
    }
  }

  /**
   * Generate anonymous user ID
   */
  private generateAnonymousId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Setup message listeners for communication with popup/content scripts
   */
  private setupMessageListeners() {
    chrome.runtime.onMessage.addListener(
      (
        message: ExtensionMessage,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response: MessageResponse) => void
      ) => {
        this.handleMessage(message, sender, sendResponse);
        return true; // Keep channel open for async response
      }
    );

    logger.log('✅ Message listeners setup');
  }

  /**
   * Handle messages from popup/content scripts
   */
  private async handleMessage(
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) {
    try {
      logger.log('📨 Received message:', message.type);

      switch (message.type) {
        case 'CONNECT': {
          if (!message.serverId) {
            sendResponse({ success: false, error: 'Server ID required' });
            return;
          }
          const connectResult = await this.connectionManager.connect(message.serverId);
          sendResponse({ success: true, data: connectResult });
          break;
        }

        case 'DISCONNECT':
          await this.connectionManager.disconnect();
          sendResponse({ success: true });
          break;

        case 'GET_STATUS': {
          const status = await this.connectionManager.getStatus();
          sendResponse({ success: true, data: status });
          break;
        }

        case 'GET_SERVERS': {
          const servers = await this.apiClient.getServers();
          sendResponse({ success: true, data: servers });
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      logger.error('Message handling error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Setup periodic alarms for health checks
   */
  private setupAlarms() {
    // Health check every 5 minutes
    chrome.alarms.create('healthCheck', {
      periodInMinutes: CONNECTION_CONFIG.HEALTH_CHECK_INTERVAL / 60000,
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'healthCheck') {
        this.connectionManager.performHealthCheck();
      }
    });

    logger.log('✅ Alarms setup');
  }
}

// Initialize background service
logger.log('🔧 Installing Personal VPN Background Service...');
new BackgroundService();
