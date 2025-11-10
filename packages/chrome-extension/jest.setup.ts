import '@testing-library/jest-dom';

// Mock Chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    getManifest: jest.fn(() => ({ version: '1.0.0' })),
    id: 'test-extension-id',
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
  proxy: {
    settings: {
      set: jest.fn(),
      get: jest.fn(),
      clear: jest.fn(),
    },
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  },
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn(),
    },
  },
} as any;

// Mock import.meta.env
(global as any).import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000',
      VITE_ENVIRONMENT: 'test',
      VITE_API_TIMEOUT: '10000',
    },
  },
};
