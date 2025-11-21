// Script to test the patching process
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔍 Testing Wasp TypeScript patch application...');

try {
  // Run the apply-patches script
  console.log('⚙️ Running apply-patches.js...');
  execSync('node apply-patches.js', { stdio: 'inherit' });
  
  console.log('✅ Patch application completed.');
  
  // Try to verify the patch by checking if the file exists at either location
  const locations = [
    path.join(__dirname, '.wasp', 'out', 'sdk', 'wasp', 'auth', 'useAuth.ts'),
    path.join(__dirname, '..', '.wasp', 'out', 'sdk', 'wasp', 'auth', 'useAuth.ts')
  ];
  
  let found = false;
  for (const loc of locations) {
    if (fs.existsSync(loc)) {
      console.log(`✓ Verified patched file exists at: ${loc}`);
      found = true;
      
      // Optionally read and display the first few lines to verify content
      const content = fs.readFileSync(loc, 'utf8').split('\n').slice(0, 5).join('\n');
      console.log('\nFirst 5 lines of patched file:');
      console.log(content);
      console.log('...');
      break;
    }
  }
  
  if (!found) {
    console.log('⚠️ Warning: Could not verify patched file. Make sure to run wasp build first.');
  }
  
  console.log('\n🔄 To apply these changes to your Wasp project:');
  console.log('1. Run: wasp build');
  console.log('2. Run: npm run apply-patches');
  console.log('3. Run: wasp start');
  
} catch (error) {
  console.error('❌ Error testing patch:', error);
}
