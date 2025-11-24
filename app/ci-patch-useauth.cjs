#!/usr/bin/env node

// app/ci-patch-useauth.cjs
// Simple patch script to override the generated .wasp/out/sdk/wasp/auth/useAuth.ts
// with our custom version in app/patch-useAuth.ts.

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const sdkRoot = path.join(projectRoot, '.wasp', 'out', 'sdk', 'wasp');
const targetFile = path.join(sdkRoot, 'auth', 'useAuth.ts');
const patchFile = path.join(projectRoot, 'patch-useAuth.ts');

console.log('[patch-useauth] projectRoot:', projectRoot);
console.log('[patch-useauth] sdkRoot:', sdkRoot);
console.log('[patch-useauth] targetFile:', targetFile);
console.log('[patch-useauth] patchFile:', patchFile);

if (!fs.existsSync(patchFile)) {
  console.error('[patch-useauth] Patch file not found:', patchFile);
  process.exit(1);
}

if (!fs.existsSync(targetFile)) {
  console.error('[patch-useauth] Target useAuth.ts not found yet:', targetFile);
  process.exit(1);
}

try {
  const patchContent = fs.readFileSync(patchFile, 'utf8');
  fs.writeFileSync(targetFile, patchContent, 'utf8');
  console.log('[patch-useauth] Successfully patched useAuth.ts');
} catch (err) {
  console.error('[patch-useauth] Failed to patch useAuth.ts:', err);
  process.exit(1);
}
