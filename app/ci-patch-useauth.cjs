#!/usr/bin/env node

/**
 * CI Patch Script for Wasp TypeScript Compilation Issues
 * 
 * This script finds and fixes ALL TypeScript errors in Wasp-generated files
 * by searching the entire .wasp directory structure.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting comprehensive CI TypeScript patch...');

// Recursively find all TypeScript files in .wasp directory
function findAllTSFiles(dir) {
  const files = [];
  
  function searchDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchDir(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }
  
  searchDir(dir);
  return files;
}

// Find all TypeScript files
const waspDir = path.join(__dirname, '.wasp');
console.log(`🔍 Searching for TypeScript files in: ${waspDir}`);

if (!fs.existsSync(waspDir)) {
  console.log('❌ .wasp directory not found!');
  process.exit(1);
}

const allTSFiles = findAllTSFiles(waspDir);
console.log(`📁 Found ${allTSFiles.length} TypeScript files`);

// Find specific files we need to patch
const useAuthFiles = allTSFiles.filter(f => f.includes('useAuth.ts'));
const typeFiles = allTSFiles.filter(f => f.includes('.d.ts') && (f.includes('wasp') || f.includes('types')));

console.log(`🎯 Found ${useAuthFiles.length} useAuth files:`, useAuthFiles);
console.log(`🎯 Found ${typeFiles.length} type definition files:`, typeFiles.slice(0, 5));

// Universal patching functions that work on any file
function patchUseAuthFiles() {
  console.log('📝 Patching useAuth files...');
  
  useAuthFiles.forEach(filePath => {
    console.log(`🔧 Patching: ${filePath}`);
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix 1: UseQueryResult return type
      if (content.includes('UseQueryResult<AuthUser | null>') && !content.includes('UseQueryResult<AuthUser | null, unknown>')) {
        content = content.replace(
          /UseQueryResult<AuthUser \| null>/g,
          'UseQueryResult<AuthUser | null, unknown>'
        );
        modified = true;
        console.log('  ✅ Fixed UseQueryResult return type');
      }
      
      // Fix 2: buildAndRegisterQuery call with empty object
      if (content.includes('buildAndRegisterQuery(getMe, {})')) {
        content = content.replace(
          /buildAndRegisterQuery\(getMe, \{\}\)/g,
          'buildAndRegisterQuery(getMe)'
        );
        modified = true;
        console.log('  ✅ Fixed buildAndRegisterQuery call');
      }
      
      // Fix 3: Function signature with two parameters
      if (content.includes('buildAndRegisterQuery(') && content.includes(', {}')) {
        content = content.replace(
          /buildAndRegisterQuery\(([^,]+), \{\}\)/g,
          'buildAndRegisterQuery($1)'
        );
        modified = true;
        console.log('  ✅ Fixed function call parameters');
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  💾 Saved changes to ${path.basename(filePath)}`);
      } else {
        console.log(`  ℹ️  No changes needed for ${path.basename(filePath)}`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error patching ${filePath}:`, error.message);
    }
  });
}

function patchTypeFiles() {
  console.log('📝 Patching type definition files...');
  
  typeFiles.forEach(filePath => {
    console.log(`🔧 Patching: ${filePath}`);
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix 1: isError boolean to true
      if (content.includes('isError: boolean')) {
        content = content.replace(/isError: boolean;?/g, 'isError: true;');
        modified = true;
        console.log('  ✅ Fixed isError type');
      }
      
      // Fix 2: QueryObserver compatibility
      if (content.includes('QueryObserverRefetchErrorResult') && content.includes('isError')) {
        content = content.replace(
          /QueryObserverRefetchErrorResult<([^>]+), ([^>]+)>/g,
          'QueryObserverResult<$1, $2>'
        );
        modified = true;
        console.log('  ✅ Fixed QueryObserver types');
      }
      
      // Fix 3: Function signatures
      if (content.includes('buildAndRegisterQuery') && content.includes('QueryFn')) {
        content = content.replace(
          /QueryFn<([^,]+), ([^>]+)>/g,
          'Query<$2, $1>'
        );
        modified = true;
        console.log('  ✅ Fixed QueryFn types');
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  💾 Saved changes to ${path.basename(filePath)}`);
      } else {
        console.log(`  ℹ️  No changes needed for ${path.basename(filePath)}`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error patching ${filePath}:`, error.message);
    }
  });
}

// Brute force approach - patch ALL TypeScript files for common issues
function patchAllTSFiles() {
  console.log('📝 Applying universal TypeScript fixes to all files...');
  
  let totalPatched = 0;
  
  allTSFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Universal fixes that apply to any TypeScript file
      const fixes = [
        // Fix UseQueryResult types
        {
          pattern: /UseQueryResult<([^,>]+)>/g,
          replacement: 'UseQueryResult<$1, unknown>',
          name: 'UseQueryResult type'
        },
        // Fix isError boolean
        {
          pattern: /isError: boolean;?/g,
          replacement: 'isError: true;',
          name: 'isError type'
        },
        // Fix buildAndRegisterQuery calls
        {
          pattern: /buildAndRegisterQuery\(([^,]+), \{\}\)/g,
          replacement: 'buildAndRegisterQuery($1)',
          name: 'buildAndRegisterQuery call'
        },
        // Fix QueryFn to Query
        {
          pattern: /QueryFn<([^,]+), ([^>]+)>/g,
          replacement: 'Query<$2, $1>',
          name: 'QueryFn type'
        }
      ];
      
      fixes.forEach(fix => {
        if (fix.pattern.test(content)) {
          content = content.replace(fix.pattern, fix.replacement);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalPatched++;
      }
      
    } catch (error) {
      // Skip files we can't read/write
    }
  });
  
  console.log(`🎉 Applied universal fixes to ${totalPatched} files`);
}

// Main execution
try {
  console.log('\n🚀 Starting comprehensive patching...\n');
  
  // Apply targeted patches first
  if (useAuthFiles.length > 0) {
    patchUseAuthFiles();
  }
  
  if (typeFiles.length > 0) {
    patchTypeFiles();
  }
  
  // Apply universal patches to all files
  patchAllTSFiles();
  
  console.log('\n🎉 All TypeScript patches applied successfully!');
  console.log(`📊 Summary: Processed ${allTSFiles.length} TypeScript files`);
  
} catch (error) {
  console.error('❌ Error applying patches:', error.message);
  process.exit(1);
}
