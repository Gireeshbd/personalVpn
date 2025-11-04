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

export class ApiClient {
  private client: AxiosInstance;
  private storage: StorageManager;

  constructor() {
    this.storage = new StorageManager();
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
   * Register or login user
   */
  async register(request: RegisterRequest = {}): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        request
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get list of available servers
   */
  async getServers(): Promise<Server[]> {
    try {
      const response = await this.client.get<ApiResponse<Server[]>>(
        API_ENDPOINTS.SERVERS.LIST
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Get servers error:', error);
      return [];
    }
  }

  /**
   * Get server configuration
   */
  async getServerConfig(serverId: string): Promise<ServerConfig> {
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
      throw this.handleError(error);
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
      console.error('Track connection error:', error);
    }
  }

  /**
   * Ping server to verify connection
   */
  async ping(): Promise<ApiResponse> {
    try {
      const response = await this.client.get<HealthCheckResponse>(
        API_ENDPOINTS.HEALTH
      );
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

  private handleError(error: unknown): any {
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
