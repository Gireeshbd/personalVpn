/**
 * Logger utility with environment-aware logging
 * Only logs in development mode, silent in production
 */

import { isDevelopment } from './config';

class Logger {
  private prefix: string;

  constructor(prefix: string = '[App]') {
    this.prefix = prefix;
  }

  log(...args: any[]): void {
    if (isDevelopment) {
      console.log(this.prefix, ...args);
    }
  }

  warn(...args: any[]): void {
    if (isDevelopment) {
      console.warn(this.prefix, ...args);
    }
  }

  error(...args: any[]): void {
    // Always log errors, even in production
    console.error(this.prefix, ...args);
  }

  info(...args: any[]): void {
    if (isDevelopment) {
      console.info(this.prefix, ...args);
    }
  }

  debug(...args: any[]): void {
    if (isDevelopment) {
      console.debug(this.prefix, ...args);
    }
  }
}

// Create logger instances for different modules
export const logger = new Logger('[App]');
export const apiLogger = new Logger('[API]');
export const storageLogger = new Logger('[Storage]');
export const connectionLogger = new Logger('[Connection]');

export default logger;
