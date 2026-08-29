import { validateGithubUrl, extractRepoInfo } from '../src/lib/repo/git';

describe('Repository Utilities', () => {
    it('validates github URLs', () => {
        expect(validateGithubUrl('https://github.com/facebook/react')).toBe(true);
        expect(validateGithubUrl('https://github.com/facebook/react.git')).toBe(true);
        expect(validateGithubUrl('http://github.com/owner/repo')).toBe(true);
        expect(validateGithubUrl('github.com/owner/repo')).toBe(false);
        expect(validateGithubUrl('https://google.com')).toBe(false);
        expect(validateGithubUrl('https://github.com/owner')).toBe(false);
        expect(validateGithubUrl('https://github.com/owner/repo/extra')).toBe(false);
    });

    it('extracts repo info', () => {
        expect(extractRepoInfo('https://github.com/facebook/react')).toEqual({ owner: 'facebook', repo: 'react' });
        expect(extractRepoInfo('https://github.com/facebook/react.git')).toEqual({ owner: 'facebook', repo: 'react' });
    });
});
