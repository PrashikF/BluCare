// src/utils/logger.js
// Centralized logging utility for BluCare+ frontend

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * General informational log (development only).
   */
  log: (...args) => {
    if (isDev) {
      console.log('[BluCare]', ...args);
    }
  },

  /**
   * Warning log (development only).
   */
  warn: (...args) => {
    if (isDev) {
      console.warn('[BluCare Warning]', ...args);
    }
  },

  /**
   * Centralized error log (active in all environments for diagnosis).
   */
  error: (...args) => {
    console.error('[BluCare Error]', ...args);
  },
};
