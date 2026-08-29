const fs = require('fs');

function runTest() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const devScript = pkg.scripts.dev;
  
  if (!devScript.includes('-H 0.0.0.0') && !devScript.includes('--hostname 0.0.0.0')) {
    console.error('❌ Regression Test Failed: dev script does not bind to 0.0.0.0 to expose the server to the host');
    console.error(`Current dev script: "${devScript}"`);
    process.exit(1);
  }
  
  console.log('✅ Regression Test Passed: dev script binds to 0.0.0.0');
}

runTest();
