const fs = require('fs');

console.log("Checking if .opencode is a file or named pipe or what.");
const stats = fs.statSync('/home/boypablo/Documents/.opencode');
console.log(stats);
