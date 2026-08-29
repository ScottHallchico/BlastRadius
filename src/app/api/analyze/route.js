import { NextResponse } from 'next/server';
import { BlastRadiusEngine } from '../../../lib/mcp/engine';
import { cloneRepository, cleanupRepository, validateGithubUrl } from '../../../lib/repo/git';
import path from 'path';
// CORS configuration for production cross-domain setups
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}
export async function POST(req) {
    let repoPathToClean = null;
    try {
        const body = await req.json();
        const { changeDescription, repoUrl } = body;
        if (!changeDescription) {
            return NextResponse.json({ error: 'changeDescription is required' }, { status: 400, headers: corsHeaders });
        }
        let analyzePath;
        // Configuration Limits
        const MAX_ANALYSIS_TIMEOUT_MS = parseInt(process.env.MAX_ANALYSIS_TIMEOUT_MS || '60000', 10);
        // 1. Repository Acquisition
        if (repoUrl && repoUrl.trim() !== '') {
            if (repoUrl.startsWith('http://') || repoUrl.startsWith('https://')) {
                if (!validateGithubUrl(repoUrl)) {
                    return NextResponse.json({ error: 'Invalid GitHub URL provided. Example: https://github.com/owner/repo' }, { status: 400, headers: corsHeaders });
                }
                try {
                    analyzePath = await cloneRepository(repoUrl);
                    repoPathToClean = analyzePath;
                }
                catch (e) {
                    console.error("Git clone failed:", e);
                    // Hide server temp paths in error messages
                    const safeMessage = e.message.replace(/\/tmp\/[a-zA-Z0-9_-]+/g, '[TEMP_DIR]');
                    return NextResponse.json({ error: `Failed to acquire repository: ${safeMessage}` }, { status: 500, headers: corsHeaders });
                }
            }
            else {
                // Ensure local paths are ONLY allowed if explicitly enabled (e.g. dev mode)
                if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LOCAL_REPOS !== 'true') {
                    return NextResponse.json({ error: 'Local absolute paths are not permitted in production for security reasons. Please provide a public GitHub URL.' }, { status: 403, headers: corsHeaders });
                }
                analyzePath = path.resolve(repoUrl);
                // Prevent path traversal
                if (!analyzePath.startsWith('/')) {
                    return NextResponse.json({ error: 'Invalid local path' }, { status: 400, headers: corsHeaders });
                }
            }
        }
        else {
            // Point engine to local demo repo
            analyzePath = path.join(process.cwd(), 'demo-repo');
        }
        // 2. Static repository analysis via BlastRadius engine
        const engine = new BlastRadiusEngine(analyzePath);
        // Add timeout wrapper
        const analysisPromise = engine.analyze(changeDescription);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Analysis timed out. Repository may be too large.')), MAX_ANALYSIS_TIMEOUT_MS));
        const result = await Promise.race([analysisPromise, timeoutPromise]);
        return NextResponse.json(result, { headers: corsHeaders });
    }
    catch (e) {
        console.error("API error:", e);
        return NextResponse.json({ error: e.message || 'Failed to analyze blast radius' }, { status: 500, headers: corsHeaders });
    }
    finally {
        // 3. Clean up temporary files
        if (repoPathToClean) {
            await cleanupRepository(repoPathToClean);
        }
    }
}
