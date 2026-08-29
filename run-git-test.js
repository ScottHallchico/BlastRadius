const { validateGithubUrl, extractRepoInfo } = require('./src/lib/repo/git.js');

function test() {
    let failed = false;
    const check = (desc, fn) => {
        try { fn(); console.log('✅ ' + desc); } 
        catch(e) { console.error('❌ ' + desc); console.error(e); failed = true; }
    };
    
    check('Valid urls', () => {
        if (!validateGithubUrl('https://github.com/facebook/react')) throw new Error();
        if (!validateGithubUrl('http://github.com/owner/repo')) throw new Error();
        if (!validateGithubUrl('https://github.com/fastapi/fastapi.git')) throw new Error();
    });

    check('Invalid urls', () => {
        if (validateGithubUrl('https://github.com/owner')) throw new Error();
        if (validateGithubUrl('https://github.com/owner/repo/extra/paths')) throw new Error();
        if (validateGithubUrl('git@github.com:owner/repo.git')) throw new Error();
        if (validateGithubUrl('https://gitlab.com/owner/repo')) throw new Error();
        if (validateGithubUrl('file:///etc/passwd')) throw new Error();
        if (validateGithubUrl('https://github.com/../malicious/repo')) throw new Error();
    });

    check('Extract info', () => {
        const i1 = extractRepoInfo('https://github.com/facebook/react');
        if (i1.owner !== 'facebook' || i1.repo !== 'react') throw new Error();
        
        const i2 = extractRepoInfo('https://github.com/fastapi/fastapi.git');
        if (i2.owner !== 'fastapi' || i2.repo !== 'fastapi') throw new Error();
    });

    if (failed) process.exit(1);
}
test();
