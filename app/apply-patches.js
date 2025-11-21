// Script to automatically apply patches to Wasp-generated files
const fs = require('fs');
const path = require('path');

// Try different possible paths to the generated useAuth.ts file
let useAuthPath = path.join(__dirname, '.wasp', 'out', 'sdk', 'wasp', 'auth', 'useAuth.ts');

// Check if the file exists at the first path, if not try the second path
if (!fs.existsSync(useAuthPath)) {
  useAuthPath = path.join(__dirname, '..', '.wasp', 'out', 'sdk', 'wasp', 'auth', 'useAuth.ts');
}

// Check if the generated file exists
if (fs.existsSync(useAuthPath)) {
  console.log('Found useAuth.ts file to patch at:', useAuthPath);
  
  // Create the patched content with improved type compatibility
  const patchedContent = `// Auto-patched by apply-patches.js to fix TypeScript errors
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
  // Add any other required properties from UseQueryResult
  status: 'loading' | 'error' | 'success' | 'idle';
  fetchStatus: 'fetching' | 'paused' | 'idle';
  isPending: boolean;
  isSuccess: boolean;
  isFetching: boolean;
};

export function useAuth(): UseAuthQueryResult {
  // Use a simple QueryFn type to avoid complex generic issues
  const queryFn = async (): Promise<AuthUser | null> => {
    const response = await fetch(\`\${API_URL}/auth/me\`, { credentials: 'include' });
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
}`;
  
  // Apply the patch
  fs.writeFileSync(useAuthPath, patchedContent);
  console.log('✅ Successfully patched useAuth.ts');
} else {
  console.error('❌ Could not find useAuth.ts at path:', useAuthPath);
  console.log('Make sure to run wasp build first, then run this script.');
}
