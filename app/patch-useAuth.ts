// This file will be used to patch the useAuth.ts file in .wasp/out/sdk/wasp/auth/
// Copy and paste the contents of this file to override the generated useAuth.ts file

import { useQuery } from '../queries';
import { AuthUser } from '../types';
import { API_URL } from '../apiClient';

// Define exact return type to match @tanstack/query expectations
type UseAuthQueryResult = {
  data: AuthUser | null | undefined;
  isLoading: boolean;
  error: unknown | null;
  isError: boolean;
  refetch: () => Promise<any>;
  // Add other required properties from UseQueryResult
  status: 'loading' | 'error' | 'success' | 'idle';
  fetchStatus: 'fetching' | 'paused' | 'idle';
  isPending: boolean;
  isSuccess: boolean;
  isFetching: boolean;
};

export function useAuth(): UseAuthQueryResult {
  // Use a simple QueryFn type to avoid complex generic issues
  const queryFn = async (): Promise<AuthUser | null> => {
    const response = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
    if (response.status === 200) {
      const json = await response.json();
      return json as AuthUser;
    }
    return null;
  };
  
  // Cast the result to our compatible type to avoid TypeScript errors
  const query = useQuery<AuthUser | null>(
    'auth/me',
    queryFn
  ) as UseAuthQueryResult;

  return query;
}
