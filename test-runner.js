import { BlastRadiusEngine } from './src/lib/mcp/engine.js';
import path from 'path';
async function runTest() {
    console.log("Running integration test...");
    try {
        const demoRepoPath = path.join(process.cwd(), 'demo-repo');
        const engine = new BlastRadiusEngine(demoRepoPath);
        const result = await engine.analyze('Replace Redis with Kafka');
        let passed = true;
        if (result.status !== 'complete')
            passed = false;
        if (result.riskLevel !== 'HIGH')
            passed = false;
        if (result.componentsAffected <= 0)
            passed = false;
        if (result.implicitCouplings !== 1)
            passed = false;
        if (result.invariantsViolated !== 1)
            passed = false;
        if (passed) {
            console.log("✅ Test passed! All expected conditions met.");
        }
        else {
            console.error("❌ Test failed!");
            console.error(JSON.stringify(result, null, 2));
            process.exit(1);
        }
    }
    catch (e) {
        console.error("❌ Test error:", e);
        process.exit(1);
    }
}
runTest();
