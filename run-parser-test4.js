const { parseChangeDescription } = require('./src/lib/change-parser.js');

function test(name, input, expectedFn) {
    const res = parseChangeDescription(input);
    try {
        expectedFn(res);
        console.log(`✅ ${name} passed`);
    } catch (e) {
        console.error(`❌ ${name} failed`);
        console.error(e);
        console.error("Result:", JSON.stringify(res, null, 2));
    }
}

test('Modify router.js', "Modify router.js to change its middleware behavior.", (res) => {
    if (res.operation !== 'MODIFY') throw new Error('Op mismatch');
    if (res.target.name !== 'router.js') throw new Error('Target name mismatch');
    if (res.contextBoundary) throw new Error('Context boundary mismatch - should not treat .js as a boundary');
});

test('Modify foo-bar', "Modify foo-bar to change its behavior.", (res) => {
    if (res.target.name !== 'foo-bar') throw new Error('Target name mismatch');
});

test('Modify foo.bar-baz()', "Modify foo.bar-baz() to change its behavior.", (res) => {
    if (res.target.name !== 'bar-baz') throw new Error('Target name mismatch');
    if (res.contextBoundary !== 'foo') throw new Error('Context Boundary mismatch');
});

test('Modify foo.bar.baz()', "Modify foo.bar.baz() to change its behavior.", (res) => {
    if (res.target.name !== 'baz') throw new Error('Target name mismatch');
    if (res.contextBoundary !== 'bar') throw new Error('Context Boundary mismatch');
});

test('Modify a.b.c.d()', "Modify a.b.c.d() to change its behavior.", (res) => {
    if (res.target.name !== 'd') throw new Error('Target name mismatch');
    if (res.contextBoundary !== 'c') throw new Error('Context Boundary mismatch');
});

test('Modify express.Router() and Redis cache behavior', "Modify express.Router() and Redis cache behavior.", (res) => {
    if (res.target.name !== 'Router') throw new Error('Target name mismatch');
});

test('Rename foo.bar() to baz.qux()', "Rename foo.bar() to baz.qux().", (res) => {
    if (res.operation !== 'RENAME') throw new Error('Op mismatch');
    if (res.target.name !== 'bar') throw new Error('Target name mismatch');
    if (res.contextBoundary !== 'foo') throw new Error('Context Boundary mismatch');
    // replacement shouldn't strip the full member if we're not using applyTarget on it
});

