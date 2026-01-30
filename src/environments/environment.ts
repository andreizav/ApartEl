/**
 * Application environment configuration.
 * Data is always loaded from the API (no localStorage). Set apiUrl to your backend.
 */
export const environment = {
  /** Backend API base URL (required). */
  apiUrl: 'http://localhost:4000',
  /** Hint shown on login error (e.g. demo user). */
  demoLoginHint: 'alice@demo.com',
} as const;
