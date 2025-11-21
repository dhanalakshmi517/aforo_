// This file will be used to patch the useAuth.ts file in .wasp/out/sdk/wasp/auth/
// Copy and paste the contents of this file to override the generated useAuth.ts file

import { useQuery } from '../queries';
import { AuthUser } from '../types';
import { API_URL } from '../apiClient';

export function useAuth() {
  // Cast the result to any to avoid type errors with UseQueryResult
  const query = useQuery<AuthUser | null>(
    'auth/me',
    async () => {
      const response = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
      if (response.status === 200) {
        const json = await response.json();
        return json as AuthUser;
      }
      return null;
    }
  ) as any;

  return query;
}
