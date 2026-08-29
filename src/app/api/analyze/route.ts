import { NextResponse } from 'next/server';
import { BlastRadiusEngine } from '@/lib/mcp/engine';
import { cloneRepository, cleanupRepository, validateGithubUrl } from '@/lib/repo/git';
import path from 'path';

export async function POST(req: Request) {
    let repoPathToClean: string | null = null;
    
    try {
        const body = await req.json();
        const { changeDescription, repoUrl } = body;

        if (!changeDescription) {
            return NextResponse.json({ error: 'changeDescription is required' }, { status: 400 });
        }

        let analyzePath: string;

        // 1. Repository Acquisition
        if (repoUrl && repoUrl.trim() !== '') {
            if (repoUrl.startsWith('http://') || repoUrl.startsWith('https://')) {
                if (!validateGithubUrl(repoUrl)) {
                    return NextResponse.json({ error: 'Invalid GitHub URL provided. Example: https://github.com/owner/repo' }, { status: 400 });
                }
                
                try {
                    analyzePath = await cloneRepository(repoUrl);
                    repoPathToClean = analyzePath;
                } catch (e: any) {
                    console.error("Git clone failed:", e);
                    return NextResponse.json({ error: `Failed to acquire repository: ${e.message}` }, { status: 500 });
                }
            } else {
                // Treat as a local path
                analyzePath = path.resolve(repoUrl);
            }
        } else {
            // Point engine to local demo repo
            analyzePath = path.join(process.cwd(), 'demo-repo');
        }

        // 2. Static repository analysis via BlastRadius engine
        const engine = new BlastRadiusEngine(analyzePath);
        const result = await engine.analyze(changeDescription);
        
        return NextResponse.json(result);
    } catch (e) {
        console.error("API error:", e);
        return NextResponse.json({ error: 'Failed to analyze blast radius' }, { status: 500 });
    } finally {
        // 3. Clean up temporary files
        if (repoPathToClean) {
            await cleanupRepository(repoPathToClean);
        }
    }
}
