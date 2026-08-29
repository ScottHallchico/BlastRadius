import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import fs from 'fs/promises';

export function validateGithubUrl(url: string): boolean {
    const regex = /^https?:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/;
    return regex.test(url);
}

export function extractRepoInfo(url: string): { owner: string; repo: string } | null {
    if (!validateGithubUrl(url)) return null;
    
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
    } catch (e) {
        return null;
    }
    return null;
}

export async function cloneRepository(url: string): Promise<string> {
    if (!validateGithubUrl(url)) {
        throw new Error('Invalid GitHub URL');
    }

    const tmpDir = os.tmpdir();
    const uniqueId = crypto.randomUUID();
    const targetPath = path.join(tmpDir, `blastradius-${uniqueId}`);

    return new Promise((resolve, reject) => {
        // Use spawn to prevent command injection
        const git = spawn('git', ['clone', '--depth', '1', url, targetPath]);

        git.on('close', (code: number | null) => {
            if (code === 0) {
                resolve(targetPath);
            } else {
                reject(new Error(`Git clone failed with code ${code}. (Note: Network or subprocesses may be restricted in this sandbox)`));
            }
        });
        
        git.on('error', (err: Error) => {
            reject(new Error(`Sandbox restricted process spawn (${err.message}). Please use a local repository path instead.`));
        });
    });
}

export async function cleanupRepository(repoPath: string): Promise<void> {
    if (!repoPath || !repoPath.includes('blastradius-')) {
        return; // Safety check
    }
    
    try {
        await fs.rm(repoPath, { recursive: true, force: true });
    } catch (e) {
        console.error(`Failed to cleanup repository at ${repoPath}:`, e);
    }
}
