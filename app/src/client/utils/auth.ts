// Authentication utility for multi-tenant architecture
export interface AuthData {
  token: string;
  organizationId: number;
  status: string;
  businessEmail: string;
}

export interface LoginResponse {
  success: boolean;
  organizationId: number;
  status: string;
  message: string;
  token: string;
}

const AUTH_TOKEN_KEY = 'aforo_auth_token';
const AUTH_DATA_KEY = 'aforo_auth_data';

/**
 * Store authentication data in localStorage
 */
export function setAuthData(loginResponse: LoginResponse, businessEmail: string): void {
  const authData: AuthData = {
    token: loginResponse.token,
    organizationId: loginResponse.organizationId,
    status: loginResponse.status,
    businessEmail
  };

  localStorage.setItem(AUTH_TOKEN_KEY, loginResponse.token);
  localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(authData));
}

/**
 * Get authentication data from localStorage
 */
export function getAuthData(): AuthData | null {
  try {
    const authDataStr = localStorage.getItem(AUTH_DATA_KEY);
    if (!authDataStr) return null;
    const authData = JSON.parse(authDataStr) as AuthData;
    return authData;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    clearAuthData();
    return null;
  }
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Get organization ID from stored auth data
 */
export function getOrganizationId(): number | null {
  const authData = getAuthData();
  return authData?.organizationId ?? null;
}

/**
 * Decode JWT token to get payload (basic decoding, no verification)
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token?: string): boolean {
  const tokenToCheck = token || getAuthToken();
  if (!tokenToCheck) return true;

  const decoded = decodeToken(tokenToCheck);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/** Check if user is authenticated (and token not expired) */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_DATA_KEY);
}

/**
 * Get authorization headers for API requests.
 * - For JSON requests, use getAuthHeadersJSON()
 * - For multipart/FormData, use getAuthHeaders() (do NOT set Content-Type)
 */
export function getAuthHeaders(opts?: { contentType?: 'json' | null }): Record<string, string> {
  const token = getAuthToken();
  const organizationId = getOrganizationId();
  const { contentType = null } = opts || {};

  const headers: Record<string, string> = {};

  // IMPORTANT: do NOT set Content-Type for multipart/FormData; axios will set it with boundary
  if (contentType === 'json') {
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (organizationId != null) headers['X-Organization-Id'] = String(organizationId);

  return headers;
}

/** Convenience for JSON requests */
export function getAuthHeadersJSON(): Record<string, string> {
  return getAuthHeaders({ contentType: 'json' });
}

/**
 * Logout user by clearing auth data
 */
export function logout(): void {
  clearAuthData();
  window.location.href = '/signin';
}
