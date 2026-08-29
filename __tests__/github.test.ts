import { validateGithubUrl, extractRepoInfo, cloneRepository, cleanupRepository } from '../src/lib/repo/git';
import fs from 'fs/promises';

describe('GitHub Repository Acquisition', () => {
    it('validates public github HTTPS urls', () => {
        expect(validateGithubUrl('https://github.com/facebook/react')).toBe(true);
        expect(validateGithubUrl('http://github.com/owner/repo')).toBe(true);
        expect(validateGithubUrl('https://github.com/fastapi/fastapi.git')).toBe(true);
    });

    it('rejects invalid or unsafe URLs', () => {
        expect(validateGithubUrl('https://github.com/owner')).toBe(false);
        expect(validateGithubUrl('https://github.com/owner/repo/extra/paths')).toBe(false);
        expect(validateGithubUrl('git@github.com:owner/repo.git')).toBe(false); 
        expect(validateGithubUrl('https://gitlab.com/owner/repo')).toBe(false);
        expect(validateGithubUrl('file:///etc/passwd')).toBe(false);
        expect(validateGithubUrl('https://github.com/../malicious/repo')).toBe(false);
    });

    it('extracts repo info', () => {
        expect(extractRepoInfo('https://github.com/facebook/react')).toEqual({ owner: 'facebook', repo: 'react' });
        expect(extractRepoInfo('https://github.com/fastapi/fastapi.git')).toEqual({ owner: 'fastapi', repo: 'fastapi' });
    });

    // We mock fetch for the actual clone test to avoid network calls inside Jest suite
    it('rejects invalid repos on clone', async () => {
        await expect(cloneRepository('https://github.com/invalid')).rejects.toThrow('Invalid GitHub URL');
    });
});
