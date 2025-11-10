import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;

  beforeEach(() => {
    storage = new StorageManager();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should retrieve stored value', async () => {
      const mockValue = 'test-value';
      (chrome.storage.local.get as jest.Mock).mockImplementation((key, callback) => {
        if (callback) callback({ [key as string]: mockValue });
        return Promise.resolve({ [key as string]: mockValue });
      });

      const result = await storage.get('test-key');
      expect(result).toBe(mockValue);
    });

    it('should return null for non-existent key', async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

      const result = await storage.get('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store a value', async () => {
      (chrome.storage.local.set as jest.Mock).mockResolvedValue(undefined);

      await storage.set('test-key', 'test-value');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        'test-key': 'test-value',
      });
    });
  });

  describe('getAuthToken', () => {
    it('should retrieve auth token', async () => {
      const mockToken = 'mock-token-123';
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        auth_token: mockToken,
      });

      const token = await storage.getAuthToken();
      expect(token).toBe(mockToken);
    });
  });

  describe('getConnectionState', () => {
    it('should return default state when no state stored', async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

      const state = await storage.getConnectionState();
      expect(state).toEqual({
        isConnected: false,
        serverId: null,
        connectedAt: null,
      });
    });

    it('should return stored connection state', async () => {
      const mockState = {
        isConnected: true,
        serverId: 'server-123',
        connectedAt: Date.now(),
      };
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        connection_state: mockState,
      });

      const state = await storage.getConnectionState();
      expect(state).toEqual(mockState);
    });
  });
});
