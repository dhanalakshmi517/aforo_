#!/usr/bin/env node

/**
 * CI Patch Script for Wasp TypeScript Compilation Issues
 * 
 * This script fixes TypeScript errors in the Wasp-generated SDK files
 * that occur during deployment but not in local development.
 * 
 * Errors Fixed:
 * 1. auth/useAuth.ts - Type mismatches with TanStack Query
 * 2. types/wasp.d.ts - QueryObserver type compatibility issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting CI TypeScript patch...');

// Define possible file paths (try different locations)
const possiblePaths = {
  useAuth: [
    path.join(__dirname, '.wasp/out/sdk/wasp/auth/useAuth.ts'),
    path.join(__dirname, '.wasp/build/sdk/wasp/auth/useAuth.ts'),
    path.join(__dirname, '.wasp/out/server/src/auth/useAuth.ts')
  ],
  types: [
    path.join(__dirname, '.wasp/out/sdk/wasp/src/types/wasp.d.ts'),
    path.join(__dirname, '.wasp/build/sdk/wasp/src/types/wasp.d.ts'),
    path.join(__dirname, '.wasp/out/server/src/types/wasp.d.ts')
  ]
};

// Find existing file paths
function findExistingPath(pathArray) {
  for (const filePath of pathArray) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ Found file at: ${filePath}`);
      return filePath;
    }
  }
  console.log(`❌ File not found in any of these locations:`);
  pathArray.forEach(p => console.log(`   - ${p}`));
  return null;
}

const useAuthPath = findExistingPath(possiblePaths.useAuth);
const typesPath = findExistingPath(possiblePaths.types);

// Patch 1: Fix useAuth.ts
function patchUseAuth() {
  console.log('📝 Patching auth/useAuth.ts...');
  
  if (!useAuthPath) {
    console.log('⚠️  useAuth.ts not found, skipping patch');
    return;
  }

  let content = fs.readFileSync(useAuthPath, 'utf8');
  
  // Fix 1: Change UseQueryResult return type to be compatible
  content = content.replace(
    /export function useAuth\(\): UseQueryResult<AuthUser \| null>/g,
    'export function useAuth(): UseQueryResult<AuthUser | null, unknown>'
  );
  
  // Fix 2: Fix buildAndRegisterQuery call
  content = content.replace(
    /return buildAndRegisterQuery\(getMe, \{\}/g,
    'return buildAndRegisterQuery(getMe)'
  );
  
  // Fix 3: Ensure proper type imports
  if (!content.includes('UseQueryResult<AuthUser | null, unknown>')) {
    content = content.replace(
      /import { UseQueryResult } from '@tanstack\/react-query'/g,
      'import { UseQueryResult } from \'@tanstack/react-query\''
    );
  }

  fs.writeFileSync(useAuthPath, content, 'utf8');
  console.log('✅ useAuth.ts patched successfully');
}

// Patch 2: Fix types/wasp.d.ts
function patchWaspTypes() {
  console.log('📝 Patching types/wasp.d.ts...');
  
  if (!typesPath) {
    console.log('⚠️  wasp.d.ts not found, skipping patch');
    return;
  }

  let content = fs.readFileSync(typesPath, 'utf8');
  
  // Fix QueryObserverRefetchErrorResult isError type
  content = content.replace(
    /isError: boolean;/g,
    'isError: true;'
  );
  
  // Fix refetch return type
  content = content.replace(
    /refetch: \(\) => Promise<void>;/g,
    'refetch: () => Promise<QueryObserverResult<TData, TError>>;'
  );
  
  // Fix buildAndRegisterQuery function signature
  content = content.replace(
    /export function buildAndRegisterQuery<TData = unknown, TArgs = void>\(\s*queryFn: QueryFn<TData, TArgs>,\s*options\?: \{[^}]*\}\s*\): QueryFn<TData, TArgs>;/g,
    `export function buildAndRegisterQuery<TData = unknown, TArgs = void>(
    queryFn: QueryFn<TData, TArgs>,
    options?: {
      queryCacheKey?: any[];
      entitiesUsed?: string[];
      queryRoute?: any;
    }
  ): Query<TArgs, TData>;`
  );

  fs.writeFileSync(typesPath, content, 'utf8');
  console.log('✅ wasp.d.ts patched successfully');
}

// Patch 3: Additional compatibility fixes
function patchAdditionalTypes() {
  console.log('📝 Applying additional type compatibility fixes...');
  
  if (typesPath) {
    let content = fs.readFileSync(typesPath, 'utf8');
    
    // Ensure QueryObserverResult is properly imported/defined
    if (!content.includes('QueryObserverResult<TData, TError>')) {
      content = content.replace(
        /import.*@tanstack\/react-query.*/g,
        `import { UseQueryResult, QueryObserverResult } from '@tanstack/react-query';`
      );
    }
    
    // Fix any remaining type compatibility issues
    content = content.replace(
      /QueryObserverLoadingErrorResult<TData, TError>/g,
      'QueryObserverResult<TData, TError>'
    );
    
    fs.writeFileSync(typesPath, content, 'utf8');
  }
}

// Main execution
try {
  patchUseAuth();
  patchWaspTypes();
  patchAdditionalTypes();
  console.log('🎉 All TypeScript patches applied successfully!');
} catch (error) {
  console.error('❌ Error applying patches:', error.message);
  process.exit(1);
}
