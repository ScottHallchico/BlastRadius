const { BlastRadiusEngine } = require('./src/lib/mcp/engine.js');
async function test() {
    const engine = new BlastRadiusEngine('/home/boypablo/openui');
    const result = await engine.analyze("Modify the Button component's color to blue.");
    console.log("Risk:", result.riskLevel);
    console.log("Affected:", result.componentsAffected);
    console.log("Hidden:", result.implicitCouplings);
    console.log("Semantics:", result.changeSpecification.changeSemantics);
}
test();
