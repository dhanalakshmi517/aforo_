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
  return authData?.organizationId || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  const authData = getAuthData();
  return !!(token && authData && authData.organizationId);
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_DATA_KEY);
}

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const organizationId = getOrganizationId();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (organizationId) {
    headers['X-Organization-Id'] = organizationId.toString();
  }
  
  return headers;
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

/**
 * Logout user by clearing auth data
 */
export function logout(): void {
  clearAuthData();
  // Redirect to login page
  window.location.href = '/signin';
}
