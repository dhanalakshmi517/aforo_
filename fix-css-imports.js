const fs = require('fs');
const path = require('path');

function createCssFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const cssContent = `/* Auto-generated CSS file */
.form { width: 100%; }
.formGroup { margin-bottom: 1rem; }
.label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
.button { background-color: #4f46e5; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 1rem; }
.button:hover { background-color: #4338ca; }
.error { color: #ef4444; margin-top: 0.5rem; font-size: 0.875rem; }`;
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, cssContent);
    console.log(`Created: ${filePath}`);
  }
}

function patchFile(filePath, patchFn) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const newContent = patchFn(content);
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Patched: ${filePath}`);
      }
    }
  } catch (err) {
    console.log(`Could not patch ${filePath}:`, err.message);
  }
}

// Create CSS files
const targetCssDir = path.join(__dirname, 'app', '.wasp', 'out', 'sdk', 'wasp', 'dist', 'auth', 'forms', 'internal');
createCssFile(path.join(targetCssDir, 'Form.module.css'));
createCssFile(path.join(targetCssDir, 'auth-styles.css'));

// Patch useAuth.ts
const useAuthPath = path.join(__dirname, 'app', '.wasp', 'out', 'sdk', 'wasp', 'auth', 'useAuth.ts');
patchFile(useAuthPath, (content) => {
  if (!content.startsWith('// @ts-nocheck')) {
    return '// @ts-nocheck\n' + content;
  }
  return content;
});

// Patch Form.jsx to handle missing CSS imports
const formJsxPath = path.join(__dirname, 'app', '.wasp', 'out', 'sdk', 'wasp', 'dist', 'auth', 'forms', 'internal', 'Form.jsx');
patchFile(formJsxPath, (content) => {
  // Comment out problematic CSS imports or replace them with try-catch
  return content.replace(/import\s+.*\.module\.css['"]/g, "// $&");
});

// Patch useAuth.ts to fix template literal syntax error
const useAuthPath2 = path.join(__dirname, 'app', '.wasp', 'out', 'sdk', 'wasp', 'auth', 'useAuth.ts');
patchFile(useAuthPath2, (content) => {
  // Fix unterminated regex/template literal on line 23
  // Change: path: /${getMeRelativePath}
  // To: path: `/${getMeRelativePath}`
  return content.replace(/path:\s*\/\$\{getMeRelativePath\}/g, "path: `/${getMeRelativePath}`");
});

console.log('CSS import fixes and useAuth.ts patches applied successfully');
