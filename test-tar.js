const tar = require('tar');
async function test() {
    await tar.x({ file: '/tmp/test.tar.gz', cwd: '/tmp/test-extract' });
    console.log(require('fs').readdirSync('/tmp/test-extract'));
}
test();
