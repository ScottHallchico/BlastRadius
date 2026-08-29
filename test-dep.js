console.log("Checking if the npm install worked despite the timeout...");
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(Object.keys(pkg.dependencies).filter(k => k.includes('xyflow') || k.includes('cmdk')));
