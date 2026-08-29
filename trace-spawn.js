const { spawn } = require('child_process');
const git = spawn('git', ['--version']);
git.on('error', (err) => console.error("Git error:", err));
git.on('close', (code) => console.log("Git exit code:", code));
