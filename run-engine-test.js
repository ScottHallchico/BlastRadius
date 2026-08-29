const { BlastRadiusEngine } = require('./src/lib/mcp/engine.js');
async function test() {
    const engine = new BlastRadiusEngine('/home/boypablo/openui');
    const result = await engine.analyze("Modify the Button component API so that the existing Button component changes the type of its onClick prop.");
    console.log(JSON.stringify(result.changeSpecification, null, 2));
}
test().catch(console.error);
