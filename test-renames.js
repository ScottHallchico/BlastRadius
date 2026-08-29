const { BlastRadiusEngine } = require('./src/lib/mcp/engine.js');
async function test() {
    const engine = new BlastRadiusEngine('/home/boypablo/openui');
    const r1 = await engine.analyze("Rename a private helper function which is only used within its defining file.");
    console.log(r1.changeSpecification);
    const r2 = await engine.analyze("Modify the BlastRadiusEngine class.");
    console.log(r2.changeSpecification);
}
test().catch(console.error);
