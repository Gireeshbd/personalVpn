import type { ConnectionState, ServerConfig } from '@shared/types';
import { BADGE_COLORS, BADGE_TEXT } from '@shared/constants';
import { ProxyManager } from './proxy-manager';
import { ApiClient } from '../api/client';
import { StorageManager } from '../lib/storage';

export class ConnectionManager {
  private currentServer: ServerConfig | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(
    private proxyManager: ProxyManager,
    private apiClient: ApiClient,
    private storage: StorageManager
  ) {}

  /**
   * Connect to a VPN server
   */
  async connect(serverId: string): Promise<ConnectionState> {
    try {
      this.connectionState = 'connecting';
      this.notifyStateChange();

      console.log('Connecting to server:', serverId);

      // Get server configuration from API
      const serverConfig = await this.apiClient.getServerConfig(serverId);

      // Set proxy
      await this.proxyManager.setProxy({
        protocol: serverConfig.protocol,
        host: serverConfig.host,
        port: serverConfig.port,
      });

      // Verify connection
      const isConnected = await this.verifyConnection();

      if (isConnected) {
        this.currentServer = serverConfig;
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;

        await this.storage.setConnectionState({
          isConnected: true,
          serverId: serverId,
          connectedAt: Date.now(),
        });

        // Track connection analytics
        await this.apiClient.trackConnection(serverId);

        console.log('Connected successfully');
      } else {
        throw new Error('Connection verification failed');
      }

      this.notifyStateChange();
      return this.connectionState;
    } catch (error) {
      console.error('Connection error:', error);
      // Clear proxy on connection failure
      try {
        await this.proxyManager.clearProxy();
      } catch (clearError) {
        console.error('Failed to clear proxy after connection error:', clearError);
      }
      this.connectionState = 'error';
      this.notifyStateChange();
      throw error;
    }
  }

  /**
   * Disconnect from VPN
   */
  async disconnect(): Promise<void> {
    try {
      console.log('Disconnecting...');

      // Try to clear proxy, but don't fail if it errors
      try {
        await this.proxyManager.clearProxy();
      } catch (proxyError) {
        console.warn('Failed to clear proxy (may already be cleared):', proxyError);
      }

      this.currentServer = null;
      this.connectionState = 'disconnected';
      this.reconnectAttempts = 0;

      await this.storage.setConnectionState({
        isConnected: false,
        serverId: null,
        connectedAt: null,
      });

      this.notifyStateChange();
      console.log('Disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      // Still update state even if there was an error
      this.connectionState = 'disconnected';
      this.notifyStateChange();
    }
  }

  /**
   * Reconnect to last server
   */
  async reconnect(): Promise<void> {
    const state = await this.storage.getConnectionState();

    if (state.serverId && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );

      try {
        await this.connect(state.serverId);
      } catch (error) {
        console.error('Reconnect failed:', error);

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnect attempts reached');
          await this.disconnect();
        }
      }
    }
  }

  /**
   * Get current connection status
   */
  async getStatus(): Promise<{
    state: ConnectionState;
    server: ServerConfig | null;
    timestamp: number;
  }> {
    return {
      state: this.connectionState,
      server: this.currentServer,
      timestamp: Date.now(),
    };
  }

  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<void> {
    if (this.connectionState === 'connected') {
      console.log('Performing health check...');
      const isHealthy = await this.verifyConnection();

      if (!isHealthy) {
        console.warn('Health check failed, attempting reconnect...');
        await this.reconnect();
      } else {
        console.log('Health check passed');
      }
    }
  }

  /**
   * Verify connection is working
   */
  private async verifyConnection(): Promise<boolean> {
    try {
      const response = await this.apiClient.ping();
      return response.success;
    } catch (error) {
      console.error('Connection verification failed:', error);
      return false;
    }
  }

  /**
   * Notify state change to listeners
   */
  private notifyStateChange(): void {
    // Send message to popup and other listeners
    chrome.runtime
      .sendMessage({
        type: 'CONNECTION_STATE_CHANGED',
        state: this.connectionState,
        server: this.currentServer,
      })
      .catch(() => {
        // Ignore errors if no listeners
      });

    // Update badge
    this.updateBadge();
  }

  /**
   * Update extension badge
   */
  private updateBadge(): void {
    const text = BADGE_TEXT[this.connectionState];
    const color = BADGE_COLORS[this.connectionState];

    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get current server
   */
  getCurrentServer(): ServerConfig | null {
    return this.currentServer;
  }
}
