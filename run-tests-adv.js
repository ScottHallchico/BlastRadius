const { BlastRadiusEngine } = require('./src/lib/mcp/engine.js');
const path = require('path');

async function test(name, changeDesc, assertFn) {
    // Test against BlastRadius codebase itself
    const engine = new BlastRadiusEngine(path.resolve('.'));
    const result = await engine.analyze(changeDesc);
    try {
        assertFn(result);
        console.log(`✅ [BlastRadius] ${name} passed`);
    } catch(e) {
        console.error(`❌ [BlastRadius] ${name} failed:`, e.message);
        console.log(result.changeSpecification);
    }
}

async function run() {
    await test('Modify express.Router() to change its middleware behavior', "Modify express.Router() to change its middleware behavior.", (res) => {
        if (res.changeSpecification.target.name !== 'Router') throw new Error();
        if (res.changeSpecification.contextBoundary !== 'express') throw new Error();
    });

    await test('Rename express.Router to express.RequestRouter', "Rename express.Router to express.RequestRouter.", (res) => {
        if (res.changeSpecification.operation !== 'RENAME') throw new Error();
        if (res.changeSpecification.target.name !== 'Router') throw new Error();
        if (res.changeSpecification.replacement !== 'RequestRouter') throw new Error();
    });
}
run();
