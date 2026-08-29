import { BlastRadiusEngine } from '../src/lib/mcp/engine';
import path from 'path';

describe('BlastRadiusEngine', () => {
  it('should detect Redis runtime couplings and invariants', async () => {
    const demoRepoPath = path.join(__dirname, '../demo-repo');
    const engine = new BlastRadiusEngine(demoRepoPath);
    const result = await engine.analyze('Replace Redis with Kafka');

    expect(result.status).toBe('complete');
    expect(result.riskLevel).toBe('HIGH');
    expect(result.componentsAffected).toBeGreaterThan(0);
    expect(result.implicitCouplings).toBe(1);
    expect(result.invariantsViolated).toBe(1);
  });
});
