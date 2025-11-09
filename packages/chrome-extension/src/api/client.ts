import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@shared/constants';
import type {
  ApiResponse,
  Server,
  ServerConfig,
  AuthResponse,
  RegisterRequest,
  HealthCheckResponse,
} from '@shared/types';
import { StorageManager } from '../lib/storage';
import { ENV, isDevelopment } from '../lib/config';
import { apiLogger } from '../lib/logger';

export class ApiClient {
  private client: AxiosInstance;
  private storage: StorageManager;
  private useMockMode: boolean = false;

  constructor() {
    this.storage = new StorageManager();

    // Use environment config instead of hardcoded values
    const baseURL = ENV.API_BASE_URL || API_CONFIG.BASE_URL;

    this.client = axios.create({
      baseURL,
      timeout: ENV.API_TIMEOUT || API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Enable mock mode if API is not available and in development
    if (isDevelopment) {
      this.checkApiAvailability();
    }

    // Add request interceptor to attach auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.storage.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.storage.removeAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if API is available
   */
  private async checkApiAvailability(): Promise<void> {
    try {
      await this.client.get(API_ENDPOINTS.HEALTH, { timeout: 2000 });
      apiLogger.log('Backend is available');
      this.useMockMode = false;
    } catch (error) {
      apiLogger.warn('Backend not available, using mock mode');
      this.useMockMode = true;
    }
  }

  /**
   * Get mock servers for development
   */
  private getMockServers(): Server[] {
    return [
      {
        id: 'mock-us-1',
        name: 'US East (Mock)',
        location: 'New York',
        countryCode: 'US',
        protocol: 'socks5',
        load: 25,
      },
      {
        id: 'mock-eu-1',
        name: 'EU West (Mock)',
        location: 'Amsterdam',
        countryCode: 'NL',
        protocol: 'socks5',
        load: 45,
      },
      {
        id: 'mock-asia-1',
        name: 'Asia Pacific (Mock)',
        location: 'Singapore',
        countryCode: 'SG',
        protocol: 'socks5',
        load: 60,
      },
    ];
  }

  /**
   * Register or login user
   */
  async register(request: RegisterRequest = {}): Promise<AuthResponse> {
    // Mock mode for development
    if (this.useMockMode) {
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUserId = 'mock-user-' + Date.now();
      const mockAnonymousId = request.deviceId || 'mock-anon-' + Date.now();

      apiLogger.log('Mock: User registered:', { mockUserId, mockAnonymousId });

      return {
        success: true,
        data: {
          token: mockToken,
          userId: mockUserId,
          anonymousId: mockAnonymousId,
        },
      };
    }

    try {
      const response = await this.client.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        request
      );
      return response.data;
    } catch (error) {
      apiLogger.error('Register error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get list of available servers
   */
  async getServers(): Promise<Server[]> {
    // Mock mode for development
    if (this.useMockMode) {
      apiLogger.log('Mock: Returning mock servers');
      return this.getMockServers();
    }

    try {
      const response = await this.client.get<ApiResponse<Server[]>>(
        API_ENDPOINTS.SERVERS.LIST
      );
      return response.data.data || [];
    } catch (error) {
      apiLogger.error('Get servers error:', error);
      // Fallback to mock servers on error
      if (isDevelopment) {
        apiLogger.warn('Falling back to mock servers');
        return this.getMockServers();
      }
      return [];
    }
  }

  /**
   * Get server configuration
   */
  async getServerConfig(serverId: string): Promise<ServerConfig> {
    // Mock mode for development
    if (this.useMockMode) {
      const mockServers = this.getMockServers();
      const server = mockServers.find((s) => s.id === serverId);

      if (!server) {
        throw new Error('Mock server not found');
      }

      apiLogger.log('Mock: Returning mock server config:', server.name);

      // Return mock configuration with localhost proxy
      return {
        id: server.id,
        name: server.name,
        host: '127.0.0.1',
        port: 8080,
        protocol: 'http',
      };
    }

    try {
      const response = await this.client.post<ApiResponse<ServerConfig>>(
        API_ENDPOINTS.SERVERS.CONFIG,
        { serverId }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get server config');
      }

      return response.data.data;
    } catch (error) {
      apiLogger.error('Get server config error:', error);
      const errorResponse = this.handleError(error);
      throw new Error(errorResponse.error);
    }
  }

  /**
   * Track connection analytics
   */
  async trackConnection(serverId: string): Promise<void> {
    try {
      await this.client.post(API_ENDPOINTS.ANALYTICS.TRACK, {
        event: 'connection',
        serverId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Don't throw on analytics errors
      apiLogger.error('Track connection error:', error);
    }
  }

  /**
   * Ping server to verify connection
   */
  async ping(): Promise<ApiResponse> {
    try {
      const response = await this.client.get<HealthCheckResponse>(API_ENDPOINTS.HEALTH);
      return {
        success: response.data.status === 'healthy',
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ping failed',
      };
    }
  }

  private handleError(error: unknown): { success: false; error: string } {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || error.message;
      return {
        success: false,
        error: message,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
