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

test('MODIFY Button onClick', "Modify the Button component's onClick handler to accept an async function.", (res) => {
    if (res.operation !== 'MODIFY') throw new Error('Op mismatch');
    if (res.target.name !== 'Button') throw new Error('Target name mismatch');
    if (res.target.type !== 'component') throw new Error('Target type mismatch');
    if (res.property !== 'onClick') throw new Error('Property mismatch');
    if (!res.changeSemantics.includes('async')) throw new Error('Semantics missing async');
});

test('REPLACE Redis with Kafka', "Replace the Redis event publisher in OrderService with Kafka.", (res) => {
    if (res.operation !== 'REPLACE') throw new Error('Op mismatch');
    if (res.target.name !== 'Redis') throw new Error('Target name mismatch');
    if (res.target.type !== 'infrastructure') throw new Error('Target type mismatch');
    if (res.contextBoundary !== 'OrderService') throw new Error('Context mismatch');
    if (res.replacement !== 'Kafka') throw new Error('Replacement mismatch');
});

test('RENAME calculateTotal', "Rename the calculateTotal helper to computeInvoiceTotal.", (res) => {
    if (res.operation !== 'RENAME') throw new Error('Op mismatch');
    if (res.target.name !== 'calculateTotal') throw new Error('Target name mismatch');
    if (res.target.type !== 'function') throw new Error('Target type mismatch');
    if (res.replacement !== 'computeInvoiceTotal') throw new Error('Replacement mismatch');
});

test('MODIFY Axios timeout', "Increase the default timeout in the Axios API client to 10 seconds.", (res) => {
    if (res.operation !== 'MODIFY') throw new Error('Op mismatch');
    if (res.target.name !== 'Axios') throw new Error('Target name mismatch');
    if (res.target.type !== 'config') throw new Error('Target type mismatch');
    if (res.property !== 'timeout') throw new Error('Property mismatch');
    if (res.replacement !== '10 seconds') throw new Error('Replacement mismatch');
});

test('REMOVE UserAvatar', "Remove the legacy UserAvatar component.", (res) => {
    if (res.operation !== 'REMOVE') throw new Error('Op mismatch');
    if (res.target.name !== 'UserAvatar') throw new Error('Target name mismatch');
    if (res.target.type !== 'component') throw new Error('Target type mismatch');
});

test('Adversarial Redis Cache', "Modify the Button component to use a Redis cache.", (res) => {
    if (res.operation !== 'MODIFY') throw new Error('Op mismatch');
    if (res.target.name !== 'Button') throw new Error('Target name mismatch');
    // Ensure target type didn't flip to infrastructure just because 'Redis' is in the sentence
    if (res.target.type !== 'component') throw new Error('Target type mismatch');
});
