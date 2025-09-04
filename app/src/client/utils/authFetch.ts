import { getAuthHeaders, logout } from './auth';

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = {
    ...(init.headers || {}),
    ...getAuthHeaders(),
  } as Record<string, string>;

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    logout();
  }

  return response;
}
