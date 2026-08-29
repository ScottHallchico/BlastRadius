import path from 'path';
import os from 'os';
import crypto from 'crypto';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import * as https from 'https';
import * as tar from 'tar';

export function validateGithubUrl(url: string): boolean {
    const regex = /^https?:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/;
    return regex.test(url);
}

export function extractRepoInfo(url: string): { owner: string; repo: string } | null {
    if (!validateGithubUrl(url)) return null;
    
    try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
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

function downloadTarball(url: string, dest: string, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(dest);
        let timeout: NodeJS.Timeout;

        const request = https.get(url, { headers: { 'User-Agent': 'BlastRadius' } }, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirect
                if (response.headers.location) {
                    file.close();
                    clearTimeout(timeout);
                    resolve(downloadTarball(response.headers.location, dest, timeoutMs));
                    return;
                }
            }

            if (response.statusCode !== 200) {
                file.close();
                clearTimeout(timeout);
                reject(new Error(`GitHub responded with status ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                clearTimeout(timeout);
                resolve();
            });

            file.on('error', (err) => {
                fs.unlink(dest).catch(() => {});
                clearTimeout(timeout);
                reject(err);
            });
        });

        request.on('error', (err) => {
            fs.unlink(dest).catch(() => {});
            clearTimeout(timeout);
            reject(err);
        });

        timeout = setTimeout(() => {
            request.destroy();
            file.close();
            fs.unlink(dest).catch(() => {});
            reject(new Error(`GitHub download timed out after ${timeoutMs}ms. Repository may be too large or network is slow.`));
        }, timeoutMs);
    });
}

export async function cloneRepository(url: string): Promise<string> {
    const repoInfo = extractRepoInfo(url);
    if (!repoInfo) {
        throw new Error('Invalid GitHub URL');
    }

    const { owner, repo } = repoInfo;
    const timeoutMs = parseInt(process.env.GITHUB_DOWNLOAD_TIMEOUT_MS || '30000', 10);
    
    const tmpDir = os.tmpdir();
    const uniqueId = crypto.randomUUID();
    const extractPath = path.join(tmpDir, `blastradius-${uniqueId}`);
    const tarballPath = path.join(tmpDir, `blastradius-${uniqueId}.tar.gz`);

    await fs.mkdir(extractPath, { recursive: true });

    try {
        // 1. Download Tarball via GitHub API
        const tarballUrl = `https://api.github.com/repos/${owner}/${repo}/tarball/HEAD`;
        await downloadTarball(tarballUrl, tarballPath, timeoutMs);

        // 2. Extract Tarball using pure JS implementation (no child_process)
        await tar.x({
            file: tarballPath,
            cwd: extractPath,
        });

        // 3. Normalize the top-level directory (GitHub tarballs extract into a root dir like owner-repo-sha)
        const extractedItems = await fs.readdir(extractPath);
        if (extractedItems.length === 1) {
            const topLevelDir = path.join(extractPath, extractedItems[0]);
            const stat = await fs.stat(topLevelDir);
            if (stat.isDirectory()) {
                return topLevelDir; // BlastRadiusEngine receives the actual root
            }
        }

        return extractPath;
    } catch (e: any) {
        throw new Error(`Failed to download and extract repository: ${e.message}`);
    } finally {
        // Clean up the downloaded tarball file
        try {
            await fs.unlink(tarballPath);
        } catch (e) {}
    }
}

export async function cleanupRepository(repoPath: string): Promise<void> {
    if (!repoPath || !repoPath.includes('blastradius-')) {
        return; // Safety check
    }
    
    try {
        // If the normalized repo path is inside the extractPath, we need to delete the parent extractPath
        const blastradiusRoot = repoPath.substring(0, repoPath.indexOf('blastradius-') + 48); // blastradius- + 36 char uuid
        await fs.rm(blastradiusRoot, { recursive: true, force: true });
    } catch (e) {
        console.error(`Failed to cleanup repository at ${repoPath}:`, e);
    }
}
