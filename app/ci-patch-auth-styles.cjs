// app/ci-patch-auth-styles.cjs
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

const cssPath = path.join(
  projectRoot,
  '.wasp',
  'out',
  'sdk',
  'wasp',
  'dist',
  'auth',
  'forms',
  'internal',
  'auth-styles.css'
);

const dir = path.dirname(cssPath);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

if (!fs.existsSync(cssPath)) {
  fs.writeFileSync(
    cssPath,
    '/* Dummy auth styles for Wasp SDK – created by CI patch to satisfy bundler */\n'
  );
  console.log('[patch-auth-styles] Created auth-styles.css at:', cssPath);
} else {
  console.log('[patch-auth-styles] auth-styles.css already exists at:', cssPath);
}
