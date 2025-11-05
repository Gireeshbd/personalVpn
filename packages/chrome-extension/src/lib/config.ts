// Environment variable configuration with validation and defaults

interface EnvConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  ENVIRONMENT: 'development' | 'production' | 'test';
  ANALYTICS_ENABLED: boolean;
  SENTRY_DSN: string;
}

function getEnvVar(key: string, defaultValue: string): string {
  // In Vite, env variables are accessed via import.meta.env
  const value = (import.meta.env as any)[`VITE_${key}`];
  return value !== undefined ? value : defaultValue;
}

function validateAndGetConfig(): EnvConfig {
  const apiBaseUrl = getEnvVar('API_BASE_URL', 'http://localhost:3000');
  const environment = getEnvVar('ENVIRONMENT', 'development') as EnvConfig['ENVIRONMENT'];

  // Validate API URL format
  try {
    new URL(apiBaseUrl);
  } catch (error) {
    console.warn('Invalid API_BASE_URL, using default');
  }

  const config: EnvConfig = {
    API_BASE_URL: apiBaseUrl,
    API_TIMEOUT: parseInt(getEnvVar('API_TIMEOUT', '10000'), 10),
    ENVIRONMENT: environment,
    ANALYTICS_ENABLED: getEnvVar('ANALYTICS_ENABLED', 'false') === 'true',
    SENTRY_DSN: getEnvVar('SENTRY_DSN', ''),
  };

  // Log configuration in development
  if (config.ENVIRONMENT === 'development') {
    console.log('[Config] Environment configuration loaded:', {
      ...config,
      SENTRY_DSN: config.SENTRY_DSN ? '***' : '(not set)',
    });
  }

  return config;
}

export const ENV = validateAndGetConfig();

// Export helper to check if we're in development mode
export const isDevelopment = ENV.ENVIRONMENT === 'development';
export const isProduction = ENV.ENVIRONMENT === 'production';
