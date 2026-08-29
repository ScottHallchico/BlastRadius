import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import fs from 'fs/promises';
export function validateGithubUrl(url) {
    const regex = /^https?:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/;
    return regex.test(url);
}
export function extractRepoInfo(url) {
    if (!validateGithubUrl(url))
        return null;
    try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length === 2) {
            let repo = parts[1];
            if (repo.endsWith('.git')) {
                repo = repo.slice(0, -4);
            }
            return { owner: parts[0], repo };
        }
    }
    catch (e) {
        return null;
    }
    return null;
}
export async function cloneRepository(url) {
    if (!validateGithubUrl(url)) {
        throw new Error('Invalid GitHub URL');
    }
    const tmpDir = os.tmpdir();
    const uniqueId = crypto.randomUUID();
    const targetPath = path.join(tmpDir, `blastradius-${uniqueId}`);
    return new Promise((resolve, reject) => {
        // Use spawn to prevent command injection
        const git = spawn('git', ['clone', '--depth', '1', url, targetPath]);
        git.on('close', (code) => {
            if (code === 0) {
                resolve(targetPath);
            }
            else {
                reject(new Error(`Git clone failed with code ${code}`));
            }
        });
        git.on('error', (err) => {
            reject(err);
        });
    });
}
export async function cleanupRepository(repoPath) {
    if (!repoPath || !repoPath.includes('blastradius-')) {
        return; // Safety check
    }
    try {
        await fs.rm(repoPath, { recursive: true, force: true });
    }
    catch (e) {
        console.error(`Failed to cleanup repository at ${repoPath}:`, e);
    }
}
