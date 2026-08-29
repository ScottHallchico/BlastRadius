const { cloneRepository } = require('./src/lib/repo/git.js');
const { BlastRadiusEngine } = require('./src/lib/mcp/engine.js');
const fs = require('fs/promises');

async function trace() {
    console.log("1. Cloning Express...");
    const path = await cloneRepository('https://github.com/expressjs/express');
    console.log("Cloned to:", path);
    
    console.log("\n2. Checking if files exist in clone:");
    const files = await fs.readdir(path);
    console.log(files.slice(0, 10));

    console.log("\n3. Constructing Engine with path:", path);
    const engine = new BlastRadiusEngine(path);
    
    // Instrument engine to log files it scans
    const originalReadDir = engine.readDirRecursively.bind(engine);
    let totalScanned = 0;
    engine.readDirRecursively = async (dir, maxFiles) => {
        console.log(`-> readDirRecursively called on: ${dir}`);
        const result = await originalReadDir(dir, maxFiles);
        totalScanned += result.length;
        return result;
    };

    console.log("\n4. Running Analysis...");
    const result = await engine.analyze('modify the Request type');
    
    console.log(`\n5. Total Files Discovered: ${totalScanned}`);
    console.log("\nResult Summary:", {
        target: result.graph.nodes.find(n => n.id === 'target')?.label,
        componentsAffected: result.componentsAffected,
        evidenceLength: result.evidence.length
    });
}
trace().catch(console.error);
