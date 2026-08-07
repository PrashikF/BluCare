// src/utils/auth.js
// Utility helpers for backend API authorization with Clerk JWTs
import { logger } from './logger';

/**
 * Retrieves the current user's Clerk JWT token for authenticated backend API requests.
 * @param {Function} getToken - Clerk's getToken function from useAuth()
 * @returns {Promise<string|null>} The JWT token or null if unauthenticated
 */
export const getClerkApiToken = async (getToken) => {
  try {
    if (!getToken) return null;
    return await getToken();
  } catch (err) {
    logger.error('Failed to retrieve Clerk JWT token:', err);
    return null;
  }
};

/**
 * Creates authorized fetch headers ready for backend JWT verification.
 * @param {Function} getToken - Clerk's getToken function from useAuth()
 * @returns {Promise<HeadersInit>} Header object with Authorization Bearer header
 */
export const getAuthorizedHeaders = async (getToken) => {
  const token = await getClerkApiToken(getToken);
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
