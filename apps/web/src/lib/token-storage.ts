/**
 * Token persistence. The API returns tokens in the JSON response body (not
 * Set-Cookie), so the SPA is responsible for storing them. localStorage keeps
 * the session alive across tabs/reloads; the access token is short-lived
 * (15 min) and every request failure triggers a refresh via the refresh token.
 */
const ACCESS_TOKEN_KEY = 'pp.accessToken';
const REFRESH_TOKEN_KEY = 'pp.refreshToken';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
