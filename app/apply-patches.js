// Script to automatically apply patches to Wasp-generated files
const fs = require('fs');
const path = require('path');

// Path to the generated useAuth.ts file
const useAuthPath = path.join(__dirname, '..', '.wasp', 'out', 'sdk', 'wasp', 'auth', 'useAuth.ts');

// Check if the generated file exists
if (fs.existsSync(useAuthPath)) {
  console.log('Found useAuth.ts file to patch at:', useAuthPath);
  
  // Create the patched content
  const patchedContent = `import { useQuery } from '../queries';
import { AuthUser } from '../types';
import { API_URL } from '../apiClient';

// Create a compatible type
type CompatibleQueryResult<TData> = {
  data: TData | undefined;
  isLoading: boolean;
  error: unknown | null;
  isError: boolean;
  refetch: () => Promise<any>;
  [key: string]: any;
};

export function useAuth(): CompatibleQueryResult<AuthUser | null> {
  const query = useQuery<AuthUser | null>(
    'auth/me',
    async () => {
      const response = await fetch(\`\${API_URL}/auth/me\`, { credentials: 'include' });
      if (response.status === 200) {
        const json = await response.json();
        return json as AuthUser;
      }
      return null;
    }
  ) as any;

  return query;
}`;
  
  // Apply the patch
  fs.writeFileSync(useAuthPath, patchedContent);
  console.log('✅ Successfully patched useAuth.ts');
} else {
  console.error('❌ Could not find useAuth.ts at path:', useAuthPath);
  console.log('Make sure to run wasp build first, then run this script.');
}
