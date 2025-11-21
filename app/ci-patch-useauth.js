// CI-specific script to patch useAuth.ts TypeScript errors in GitHub Actions
// This is a simpler version that doesn't rely on path.join for better CI compatibility
const fs = require('fs');

console.log('🔧 CI Patch: Starting patch for useAuth.ts TypeScript errors');

// Path to the generated useAuth.ts file in CI environment
const useAuthPath = '.wasp/out/sdk/wasp/auth/useAuth.ts';

// Check if the file exists before attempting to patch
try {
  if (fs.existsSync(useAuthPath)) {
    console.log(`✅ Found useAuth.ts file to patch at: ${useAuthPath}`);
    
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
    console.log('✅ Successfully patched useAuth.ts for CI build');
  } else {
    console.error(`❌ Could not find useAuth.ts at path: ${useAuthPath}`);
    console.log('Build directory structure:');
    try {
      const waspDir = '.wasp';
      if (fs.existsSync(waspDir)) {
        const outDir = `${waspDir}/out`;
        if (fs.existsSync(outDir)) {
          const sdkDir = `${outDir}/sdk`;
          if (fs.existsSync(sdkDir)) {
            const waspSdkDir = `${sdkDir}/wasp`;
            if (fs.existsSync(waspSdkDir)) {
              const authDir = `${waspSdkDir}/auth`;
              if (fs.existsSync(authDir)) {
                console.log(`Auth directory exists, contents: ${fs.readdirSync(authDir).join(', ')}`);
              } else {
                console.log('Auth directory not found');
              }
            } else {
              console.log('Wasp SDK directory not found');
            }
          } else {
            console.log('SDK directory not found');
          }
        } else {
          console.log('Out directory not found');
        }
      } else {
        console.log('.wasp directory not found');
      }
    } catch (e) {
      console.error('Error listing directory structure:', e);
    }
  }
} catch (error) {
  console.error('❌ Error during patching:', error);
  process.exit(1);
}
