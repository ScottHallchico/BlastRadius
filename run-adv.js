const { BlastRadiusEngine } = require('./src/lib/mcp/engine.js');
const path = require('path');

async function test() {
    const repoPath = path.join(__dirname, 'demo-repo');
    const engine = new BlastRadiusEngine(repoPath);
    
    // Adversarial: Word Redis is in there, but target is Button. Should not trigger demo scenario!
    const result = await engine.analyze("Modify the Button component to use a Redis cache.");
    
    if (result.implicitCouplings > 0) {
        console.error("❌ FAILED: Engine hallucinated Redis couplings for Button target!");
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.log("✅ Adversarial test passed. No fake couplings.");
    }
}
test();
