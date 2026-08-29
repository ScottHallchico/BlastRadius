"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGithubUrl = validateGithubUrl;
exports.extractRepoInfo = extractRepoInfo;
exports.cloneRepository = cloneRepository;
exports.cleanupRepository = cleanupRepository;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const crypto_1 = __importDefault(require("crypto"));
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const https = __importStar(require("https"));
const tar = __importStar(require("tar"));
function validateGithubUrl(url) {
    const regex = /^https?:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/;
    return regex.test(url);
}
function extractRepoInfo(url) {
    if (!validateGithubUrl(url))
        return null;
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
    }
    catch (e) {
        return null;
    }
    return null;
}
function downloadTarball(url, dest, timeoutMs) {
    return new Promise((resolve, reject) => {
        const file = (0, fs_1.createWriteStream)(dest);
        let timeout;
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
                promises_1.default.unlink(dest).catch(() => { });
                clearTimeout(timeout);
                reject(err);
            });
        });
        request.on('error', (err) => {
            promises_1.default.unlink(dest).catch(() => { });
            clearTimeout(timeout);
            reject(err);
        });
        timeout = setTimeout(() => {
            request.destroy();
            file.close();
            promises_1.default.unlink(dest).catch(() => { });
            reject(new Error(`GitHub download timed out after ${timeoutMs}ms. Repository may be too large or network is slow.`));
        }, timeoutMs);
    });
}
async function cloneRepository(url) {
    const repoInfo = extractRepoInfo(url);
    if (!repoInfo) {
        throw new Error('Invalid GitHub URL');
    }
    const { owner, repo } = repoInfo;
    const timeoutMs = parseInt(process.env.GITHUB_DOWNLOAD_TIMEOUT_MS || '30000', 10);
    const tmpDir = os_1.default.tmpdir();
    const uniqueId = crypto_1.default.randomUUID();
    const extractPath = path_1.default.join(tmpDir, `blastradius-${uniqueId}`);
    const tarballPath = path_1.default.join(tmpDir, `blastradius-${uniqueId}.tar.gz`);
    await promises_1.default.mkdir(extractPath, { recursive: true });
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
        const extractedItems = await promises_1.default.readdir(extractPath);
        if (extractedItems.length === 1) {
            const topLevelDir = path_1.default.join(extractPath, extractedItems[0]);
            const stat = await promises_1.default.stat(topLevelDir);
            if (stat.isDirectory()) {
                return topLevelDir; // BlastRadiusEngine receives the actual root
            }
        }
        return extractPath;
    }
    catch (e) {
        throw new Error(`Failed to download and extract repository: ${e.message}`);
    }
    finally {
        // Clean up the downloaded tarball file
        try {
            await promises_1.default.unlink(tarballPath);
        }
        catch (e) { }
    }
}
async function cleanupRepository(repoPath) {
    if (!repoPath || !repoPath.includes('blastradius-')) {
        return; // Safety check
    }
    try {
        // If the normalized repo path is inside the extractPath, we need to delete the parent extractPath
        const blastradiusRoot = repoPath.substring(0, repoPath.indexOf('blastradius-') + 48); // blastradius- + 36 char uuid
        await promises_1.default.rm(blastradiusRoot, { recursive: true, force: true });
    }
    catch (e) {
        console.error(`Failed to cleanup repository at ${repoPath}:`, e);
    }
}
