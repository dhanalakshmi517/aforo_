# Automatic Patching for TypeScript Errors

This guide explains how to use the automatic patching system to fix TypeScript errors in the Wasp-generated files.

## What This Solves

This patching system fixes the following TypeScript errors in the Wasp-generated code:

```
Error: [  Wasp  ] auth/useAuth.ts(15,3): error TS2322: Type 'UseQueryResult<AuthUser | null, unknown>' is not assignable to type 'UseQueryResult<AuthUser | null>'.

Type 'QueryObserverRefetchErrorResult<AuthUser | null, unknown>' is not assignable to type 'UseQueryResult<AuthUser | null>'.

Types of property 'isError' are incompatible.
Type 'boolean' is not assignable to type 'true'.
```

## How to Use the Patch

### Option 1: Using Convenience Scripts

We've provided convenience scripts to run the Wasp build process and apply patches automatically:

**Windows:**
```
.\run-wasp-with-patches.bat
```

**macOS/Linux:**
```
# Make the script executable first
chmod +x run-wasp-with-patches.sh
./run-wasp-with-patches.sh
```

### Option 2: Manual Process

1. First run your Wasp build:
   ```
   wasp build
   ```

2. Then apply the patches:
   ```
   npm run apply-patches
   ```

3. Continue with your development process

## How the Patching Works

The `apply-patches.js` script automatically modifies the Wasp-generated `useAuth.ts` file after the build process. It replaces the problematic code with a compatible implementation that fixes the TypeScript errors while maintaining the same functionality.

## Troubleshooting

If you encounter issues:

1. Make sure the Wasp build has completed successfully before running the patch
2. Check if the `.wasp/out/sdk/wasp/auth/useAuth.ts` file exists
3. Check the console output for any error messages
4. Try running the patch script manually with `node apply-patches.js`

## Additional Information

This is a temporary solution until the TypeScript compatibility issues are resolved in a future version of Wasp. The patch is designed to be non-invasive and doesn't affect any of your application logic.
