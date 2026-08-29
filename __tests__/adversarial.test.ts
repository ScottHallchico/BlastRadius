import { BlastRadiusEngine } from '../src/lib/mcp/engine';
import { parseChangeDescription } from '../src/lib/change-parser';
import path from 'path';

describe('Adversarial & Precision Tests', () => {
    const repoPath = path.join(__dirname, '../demo-repo');

    it('Button + onClick', async () => {
        const engine = new BlastRadiusEngine(repoPath);
        const result = await engine.analyze("Modify the Button component's onClick handler to accept an async function.");
        
        // Demo repo doesn't actually have a Button, so it should find 0 components safely without hallucinating
        expect(result.componentsAffected).toBe(1); // 1 = fallback (just the target itself)
        expect(result.implicitCouplings).toBe(0);
        expect(result.riskLevel).toBe('LOW');
    });

    it('Button + color (Style change)', async () => {
        const engine = new BlastRadiusEngine(repoPath);
        const result = await engine.analyze("Modify the Button component's color to blue.");
        expect(result.changeSpecification.changeSemantics).toContain('style');
        expect(result.implicitCouplings).toBe(0); // Should not treat arbitrary useContext hits as coupling for style changes
    });

    it('Button + documentation', async () => {
        const engine = new BlastRadiusEngine(repoPath);
        const result = await engine.analyze("Modify the Button component's documentation.");
        expect(result.changeSpecification.changeSemantics).toContain('documentation');
        expect(result.invariantsViolated).toBe(0); // Doc change shouldn't flag docs as broken invariants
    });

    it('Rename Button', async () => {
        const engine = new BlastRadiusEngine(repoPath);
        const result = await engine.analyze("Rename Button to CompletelyDifferentButton.");
        expect(result.changeSpecification.operation).toBe('RENAME');
        expect(result.changeSpecification.target.name).toBe('Button');
        expect(result.changeSpecification.replacement).toBe('CompletelyDifferentButton');
    });

    it('Adversarial Redis Cache', async () => {
        const engine = new BlastRadiusEngine(repoPath);
        // Word Redis is in there, but target is Button. Should not trigger demo scenario!
        const result = await engine.analyze("Modify the Button component to use a Redis cache.");
        expect(result.changeSpecification.target.name).toBe('Button');
        expect(result.changeSpecification.target.type).toBe('component');
        
        // Since the demo scenario ONLY runs if the target is Redis, publisher, or kafka, it should bypass it
        // Note: the demo fallback logic in engine.ts checks `lowerDesc.includes('redis')` which is unsafe!
        // We need to fix the engine fallback logic to check spec.target.name!
    });
});
