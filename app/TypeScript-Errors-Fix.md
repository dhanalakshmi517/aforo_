# Fixing TypeScript Errors in Wasp Project

This document explains how to fix the TypeScript errors in the Wasp project, particularly focused on the `useAuth.ts` type compatibility issue.

## The Problem

The errors appear when building the project:

```
Error: [  Wasp  ] auth/useAuth.ts(15,3): error TS2322: Type 'UseQueryResult<AuthUser | null, unknown>' is not assignable to type 'UseQueryResult<AuthUser | null>'.

[  Wasp  ]   Type 'QueryObserverRefetchErrorResult<AuthUser | null, unknown>' is not assignable to type 'UseQueryResult<AuthUser | null>'.

[  Wasp  ] auth/useAuth.ts(31,3): error TS2322: Type 'QueryFn<AuthUser | null, void>' is not assignable to type 'Query<void, AuthUser | null>'.

[  Wasp  ] auth/useAuth.ts(31,39): error TS2554: Expected 1 arguments, but got 2.
```

## Root Cause

These errors occur due to type incompatibilities between:

1. The Wasp-generated useAuth.ts file 
2. The @tanstack/query-core types used in your project
3. TypeScript's strict type checking

Specifically, the issue relates to:
- The `isError` property type (boolean vs true)
- Function argument counts in QueryFn
- Type mismatch in UseQueryResult

## Automated Solution

We've created an automated patching system that modifies the Wasp-generated code after build:

1. **apply-patches.js**: Script that automatically patches the generated useAuth.ts file
2. **patch-useAuth.ts**: Template file containing the fixed version of useAuth.ts

## How to Apply the Fix

1. **Build the project** first to generate the code:
   ```
   wasp build
   ```

2. **Apply the patch** using the npm script:
   ```
   npm run apply-patches
   ```

3. **Start the project**:
   ```
   wasp start
   ```

## Technical Details

The patch fixes the TypeScript errors by:

1. **Creating a compatible return type** that satisfies TypeScript's type checking:
   ```typescript
   type UseAuthQueryResult = {
     data: AuthUser | null | undefined;
     isLoading: boolean;
     error: unknown | null;
     isError: boolean;
     refetch: () => Promise<any>;
     status: 'loading' | 'error' | 'success' | 'idle';
     fetchStatus: 'fetching' | 'paused' | 'idle';
     isPending: boolean;
     isSuccess: boolean;
     isFetching: boolean;
   };
   ```

2. **Restructuring the query function** to avoid parameter count issues:
   ```typescript
   const queryFn = async (): Promise<AuthUser | null> => { ... };
   ```

3. **Using type assertion** to bridge the incompatibility:
   ```typescript
   const query = useQuery<AuthUser | null>('auth/me', queryFn) as UseAuthQueryResult;
   ```

## Testing

You can use the test-patch.js script to verify the patch was applied correctly:

```
node test-patch.js
```

## Manual Fix (If Needed)

If the automated patch doesn't work, you can manually copy the content from `patch-useAuth.ts` into the generated file at:
`.wasp/out/sdk/wasp/auth/useAuth.ts`

## Version Information

- Wasp: ^0.19.0
- TypeScript: 5.8.2
- React: ^18.2.0
