import type { ProxyConfig } from '@shared/types';

export class ProxyManager {
  /**
   * Set proxy configuration
   */
  async setProxy(config: ProxyConfig): Promise<void> {
    const proxyConfig = {
      mode: 'fixed_servers' as const,
      rules: {
        singleProxy: {
          scheme: config.protocol,
          host: config.host,
          port: config.port,
        },
        bypassList: ['localhost', '127.0.0.1', '<local>'],
      },
    };

    return new Promise((resolve, reject) => {
      chrome.proxy.settings.set(
        { value: proxyConfig, scope: 'regular' },
        () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log('Proxy set:', config);
            resolve();
          }
        }
      );
    });
  }

  /**
   * Clear proxy configuration
   */
  async clearProxy(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.proxy.settings.clear({ scope: 'regular' }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('Proxy cleared');
          resolve();
        }
      });
    });
  }

  /**
   * Get current proxy configuration
   */
  async getCurrentProxy(): Promise<chrome.types.ChromeSettingGetResultDetails> {
    return new Promise((resolve) => {
      chrome.proxy.settings.get({ incognito: false }, (config) => {
        resolve(config);
      });
    });
  }

  /**
   * Check if proxy is currently set
   */
  async isProxySet(): Promise<boolean> {
    const config = await this.getCurrentProxy();
    return config.value && (config.value as any).mode === 'fixed_servers';
  }
}
