const { cloneRepository, cleanupRepository } = require('./src/lib/repo/git.js');
const fs = require('fs/promises');

async function test() {
    console.log("Testing tar extraction via HTTPS for public repo: fastapi/fastapi");
    try {
        const repoPath = await cloneRepository('https://github.com/fastapi/fastapi');
        console.log("Repository downloaded and extracted to:", repoPath);
        
        const files = await fs.readdir(repoPath);
        console.log("Files in root:", files);
        
        if (files.includes('pyproject.toml') || files.includes('requirements.txt')) {
            console.log("✅ Successfully extracted and normalized FastAPI root directory.");
        } else {
            console.error("❌ Failed to normalize FastAPI root directory. Found:", files);
        }

        console.log("Testing cleanup...");
        await cleanupRepository(repoPath);
        
        try {
            await fs.stat(repoPath);
            console.error("❌ Failed to cleanup repository.");
        } catch(e) {
            console.log("✅ Cleanup successful.");
        }
        
    } catch(e) {
        console.error("❌ Test failed:", e);
    }
}
test();
