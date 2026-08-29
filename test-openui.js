const { BlastRadiusEngine } = require('./src/lib/mcp/engine.js');
const path = require('path');

async function run() {
  const engine = new BlastRadiusEngine('/home/boypablo/openui');
  // Fake a change related to "Button" component to see what it traces
  const result = await engine.analyze('Change Button component styling');
  console.log(JSON.stringify(result, null, 2));
}

run();
