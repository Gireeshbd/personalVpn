// Connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// Server types
export interface Server {
  id: string;
  name: string;
  location: string;
  countryCode: string;
  protocol: 'socks5' | 'http' | 'https';
  load: number;
  host?: string;
  port?: number;
}

export interface ServerConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: 'socks5' | 'http' | 'https';
}

// Proxy configuration
export interface ProxyConfig {
  protocol: 'socks5' | 'http' | 'https';
  host: string;
  port: number;
}

// User types
export interface User {
  id: string;
  anonymousId: string;
  createdAt: string;
  lastSeenAt: string;
  isActive: boolean;
}

// Authentication types
export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    userId: string;
    anonymousId: string;
  };
  error?: string;
}

export interface RegisterRequest {
  deviceId?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Connection state storage
export interface ConnectionStateStorage {
  isConnected: boolean;
  serverId: string | null;
  connectedAt: number | null;
}

// Usage analytics
export interface UsageStats {
  totalBytes: number;
  connectionCount: number;
  connectionDuration: number;
  date: string;
}

// Message types for extension communication
export type MessageType =
  | 'CONNECT'
  | 'DISCONNECT'
  | 'GET_STATUS'
  | 'GET_SERVERS'
  | 'CONNECTION_STATE_CHANGED';

export interface ExtensionMessage {
  type: MessageType;
  serverId?: string;
  state?: ConnectionState;
  server?: ServerConfig;
}

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: 'ok' | 'error';
    api: 'ok' | 'error';
  };
}
