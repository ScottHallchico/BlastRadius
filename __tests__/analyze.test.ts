import { BlastRadiusEngine } from '../src/lib/mcp/engine';
import path from 'path';

describe('BlastRadiusEngine', () => {
  it('should detect Redis runtime couplings and invariants in demo repo', async () => {
    const demoRepoPath = path.join(__dirname, '../demo-repo');
    const engine = new BlastRadiusEngine(demoRepoPath);
    const result = await engine.analyze('Replace Redis with Kafka');

    expect(result.status).toBe('complete');
    expect(result.riskLevel).toBe('HIGH');
    expect(result.componentsAffected).toBeGreaterThan(0);
    expect(result.implicitCouplings).toBe(1);
    expect(result.invariantsViolated).toBe(1);
  });
  
  it('should analyze arbitrary text and extract components safely without demo mode', async () => {
      const demoRepoPath = path.join(__dirname, '../demo-repo');
      const engine = new BlastRadiusEngine(demoRepoPath);
      // Even in demo repo, if keyword doesn't trigger demo mode or if path doesn't end in demo-repo, it runs standard analyzer
      const result = await engine.analyze('Modify the AuthenticationModule');
      
      expect(result.status).toBe('complete');
      expect(result.riskLevel).toBe('LOW'); // because AuthModule isn't in demo repo
  });
});
