const fs = require('fs/promises');
const path = require('path');
const { BlastRadiusEngine } = require('./src/lib/mcp/engine.js');

const origReaddir = fs.readdir;
const origStat = fs.stat;
const origReadFile = fs.readFile;

let stats = {
    dirsScanned: new Set(),
    filesStated: 0,
    filesRead: 0,
    bytesRead: 0,
    timeTraversing: 0,
    timeParsing: 0
};

fs.readdir = async function(...args) {
    stats.dirsScanned.add(args[0].toString());
    return origReaddir.apply(this, args);
};

fs.stat = async function(...args) {
    stats.filesStated++;
    return origStat.apply(this, args);
};

fs.readFile = async function(...args) {
    stats.filesRead++;
    const t0 = performance.now();
    const content = await origReadFile.apply(this, args);
    stats.timeParsing += (performance.now() - t0);
    if (content) {
        stats.bytesRead += Buffer.byteLength(content, 'utf8');
    }
    return content;
};

async function main() {
    const engine = new BlastRadiusEngine('/home/boypablo/openui');

    // Proxy readDirRecursively
    const origReadDirRec = engine.readDirRecursively.bind(engine);
    engine.readDirRecursively = async (dir, max) => {
        const t0 = performance.now();
        const res = await origReadDirRec(dir, max);
        stats.timeTraversing += (performance.now() - t0);
        return res;
    };

    let maxMem = 0;
    const memInterval = setInterval(() => {
        const mem = process.memoryUsage().heapUsed;
        if (mem > maxMem) maxMem = mem;
    }, 5);

    console.log("Starting analysis on /home/boypablo/openui ...");
    const t0 = performance.now();
    const result = await engine.analyze("modify the component Button");
    const t1 = performance.now();
    clearInterval(memInterval);

    console.log("\n--- DIAGNOSTICS ---");
    console.log(`1. Number of files discovered (stats): ${stats.filesStated}`);
    console.log(`2. Total source files actually analyzed (reads): ${stats.filesRead}`);
    console.log(`3. Total bytes read: ${stats.bytesRead} bytes (${(stats.bytesRead / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`4. Directories scanned: ${stats.dirsScanned.size}`);
    
    const scannedArray = Array.from(stats.dirsScanned);
    const hasNodeModules = scannedArray.some(d => d.includes('node_modules'));
    const hasNext = scannedArray.some(d => d.includes('.next'));
    const hasGit = scannedArray.some(d => d.includes('.git'));
    
    console.log(`5. Were excluded dirs scanned? node_modules: ${hasNodeModules}, .next: ${hasNext}, .git: ${hasGit}`);
    
    console.log(`7. Time spent traversing (I/O stats): ${stats.timeTraversing.toFixed(2)} ms`);
    console.log(`8. Time spent I/O reading files: ${stats.timeParsing.toFixed(2)} ms`);
    
    const analysisTime = (t1 - t0) - stats.timeTraversing - stats.timeParsing;
    console.log(`9. Time spent building graph / regex matching: ${analysisTime.toFixed(2)} ms`);
    
    console.log(`10. Time spent in LLM/API calls: 0 ms`);
    console.log(`11. Peak Memory Usage: ${(maxMem / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total time: ${(t1 - t0).toFixed(2)} ms`);
    console.log("\nResult target:", result.graph.nodes.find(n => n.id === 'target')?.label);
}

main().catch(console.error);
