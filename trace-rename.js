const { BlastRadiusEngine } = require('./src/lib/mcp/engine.js');
async function test() {
    const engine = new BlastRadiusEngine('/home/boypablo/openui');
    const result = await engine.analyze("Rename Button to CompletelyDifferentButton.");
    console.log("Risk:", result.riskLevel);
    console.log("Affected:", result.componentsAffected);
    console.log("Hidden:", result.implicitCouplings);
    console.log("Operation:", result.changeSpecification.operation);
}
test();
