console.log("Checking if there are any specific sockets configured");
const fs = require('fs');
console.log(fs.readdirSync('/run'));
