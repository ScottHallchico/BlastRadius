import { validateGithubUrl, extractRepoInfo } from '../src/lib/repo/git';

describe('Git Repo Validation', () => {
    it('validates public github HTTPS urls', () => {
        expect(validateGithubUrl('https://github.com/facebook/react')).toBe(true);
        expect(validateGithubUrl('http://github.com/owner/repo')).toBe(true);
        expect(validateGithubUrl('https://github.com/fastapi/fastapi.git')).toBe(true);
    });

    it('rejects invalid or unsafe URLs', () => {
        expect(validateGithubUrl('https://github.com/owner')).toBe(false);
        expect(validateGithubUrl('https://github.com/owner/repo/extra/paths')).toBe(false);
        expect(validateGithubUrl('git@github.com:owner/repo.git')).toBe(false); // only https supported
        expect(validateGithubUrl('https://gitlab.com/owner/repo')).toBe(false);
        expect(validateGithubUrl('file:///etc/passwd')).toBe(false);
        expect(validateGithubUrl('https://github.com/../malicious/repo')).toBe(false);
    });

    it('extracts repo info', () => {
        expect(extractRepoInfo('https://github.com/facebook/react')).toEqual({ owner: 'facebook', repo: 'react' });
        expect(extractRepoInfo('https://github.com/fastapi/fastapi.git')).toEqual({ owner: 'fastapi', repo: 'fastapi' });
    });
});
