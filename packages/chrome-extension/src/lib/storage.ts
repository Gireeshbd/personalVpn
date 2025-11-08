import { STORAGE_KEYS } from '@shared/constants';
import type { ConnectionStateStorage } from '@shared/types';
import { storageLogger } from './logger';

type StorageValue = string | number | boolean | object | null;

export class StorageManager {
  async get<T = StorageValue>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      // Only return null if the key doesn't exist, preserve falsy values like false, 0, ''
      return result[key] === undefined ? null : (result[key] as T);
    } catch (error) {
      storageLogger.error('Get error:', error);
      return null;
    }
  }

  async set(key: string, value: StorageValue): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      storageLogger.error('Set error:', error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      storageLogger.error('Remove error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      storageLogger.error('Clear error:', error);
      throw error;
    }
  }

  // Specific getters and setters for typed data
  async getAuthToken(): Promise<string | null> {
    return this.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  async setAuthToken(token: string): Promise<void> {
    return this.set(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async removeAuthToken(): Promise<void> {
    return this.remove(STORAGE_KEYS.AUTH_TOKEN);
  }

  async getConnectionState(): Promise<ConnectionStateStorage> {
    const state = await this.get<ConnectionStateStorage>(STORAGE_KEYS.CONNECTION_STATE);
    return state || {
      isConnected: false,
      serverId: null,
      connectedAt: null,
    };
  }

  async setConnectionState(state: ConnectionStateStorage): Promise<void> {
    return this.set(STORAGE_KEYS.CONNECTION_STATE, state);
  }

  async getUserId(): Promise<string | null> {
    return this.get<string>(STORAGE_KEYS.USER_ID);
  }

  async setUserId(userId: string): Promise<void> {
    return this.set(STORAGE_KEYS.USER_ID, userId);
  }

  async getAnonymousId(): Promise<string | null> {
    return this.get<string>(STORAGE_KEYS.ANONYMOUS_ID);
  }

  async setAnonymousId(anonymousId: string): Promise<void> {
    return this.set(STORAGE_KEYS.ANONYMOUS_ID, anonymousId);
  }
}
