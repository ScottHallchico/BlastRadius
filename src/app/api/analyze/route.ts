import { NextResponse } from 'next/server';
import { BlastRadiusEngine } from '@/lib/mcp/engine';
import path from 'path';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { changeDescription } = body;

        if (!changeDescription) {
            return NextResponse.json({ error: 'changeDescription is required' }, { status: 400 });
        }

        // Point engine to local demo repo
        const demoRepoPath = path.join(process.cwd(), 'demo-repo');
        const engine = new BlastRadiusEngine(demoRepoPath);
        
        const result = await engine.analyze(changeDescription);
        return NextResponse.json(result);
    } catch (e) {
        console.error("API error:", e);
        return NextResponse.json({ error: 'Failed to analyze blast radius' }, { status: 500 });
    }
}
