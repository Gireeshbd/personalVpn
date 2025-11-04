// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_BASE_URL || 'https://api.personalvpn.dev',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CONNECTION_STATE: 'connection_state',
  SELECTED_SERVER: 'selected_server',
  USER_ID: 'user_id',
  ANONYMOUS_ID: 'anonymous_id',
} as const;

// Connection configuration
export const CONNECTION_CONFIG = {
  HEALTH_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
  RECONNECT_DELAY: 2000,
  MAX_RECONNECT_ATTEMPTS: 3,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_HOUR: 300,
} as const;

// Server configuration
export const SERVER_CONFIG = {
  MIN_HEALTH_SCORE: 50,
  MAX_LOAD_PERCENTAGE: 90,
} as const;

// Badge colors
export const BADGE_COLORS = {
  disconnected: '#808080',
  connecting: '#FFA500',
  connected: '#00AA00',
  error: '#FF0000',
} as const;

// Badge text
export const BADGE_TEXT = {
  disconnected: '',
  connecting: '...',
  connected: '✓',
  error: '!',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
  },
  SERVERS: {
    LIST: '/api/servers/list',
    CONFIG: '/api/servers/config',
  },
  ANALYTICS: {
    TRACK: '/api/analytics/track',
  },
  HEALTH: '/api/health',
} as const;
