/**
 * API base URL for backend requests.
 * - Set VITE_API_URL in .env when building (e.g. for separate frontend/backend deployment).
 * - In dev (Vite dev server), defaults to http://localhost:5001.
 * - In production build with no VITE_API_URL, uses same origin so the app works when
 *   served from the same server as the API (e.g. Express serving client/dist + /api).
 */
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5001' : '');
