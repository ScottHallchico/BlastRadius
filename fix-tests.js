const { parseChangeDescription } = require('./src/lib/change-parser.js');
console.log(parseChangeDescription("Modify the Button component API so that the existing Button component changes the type of its onClick prop."));
