import { parseChangeDescription } from '../src/lib/change-parser';
describe('ChangeParser', () => {
    it('parses MODIFY Button onClick', () => {
        const spec = parseChangeDescription("Modify the Button component's onClick handler to accept an async function.");
        expect(spec.operation).toBe('MODIFY');
        expect(spec.target.name).toBe('Button');
        expect(spec.target.type).toBe('component');
        expect(spec.property).toBe('onClick');
        expect(spec.changeSemantics).toContain('async');
    });
    it('parses REPLACE Redis with Kafka', () => {
        const spec = parseChangeDescription("Replace the Redis event publisher in OrderService with Kafka.");
        expect(spec.operation).toBe('REPLACE');
        expect(spec.target.name).toBe('Redis');
        expect(spec.target.type).toBe('infrastructure');
        expect(spec.contextBoundary).toBe('OrderService');
        expect(spec.replacement).toBe('Kafka');
    });
    it('parses RENAME calculateTotal', () => {
        const spec = parseChangeDescription("Rename the calculateTotal helper to computeInvoiceTotal.");
        expect(spec.operation).toBe('RENAME');
        expect(spec.target.name).toBe('calculateTotal');
        expect(spec.target.type).toBe('function');
        expect(spec.replacement).toBe('computeInvoiceTotal');
    });
    it('parses MODIFY Axios timeout', () => {
        const spec = parseChangeDescription("Increase the default timeout in the Axios API client to 10 seconds.");
        expect(spec.operation).toBe('MODIFY');
        expect(spec.target.name).toBe('Axios');
        expect(spec.target.type).toBe('config');
        expect(spec.property).toBe('timeout');
        expect(spec.replacement).toBe('10 seconds');
    });
    it('parses REMOVE UserAvatar', () => {
        const spec = parseChangeDescription("Remove the legacy UserAvatar component.");
        expect(spec.operation).toBe('REMOVE');
        expect(spec.target.name).toBe('UserAvatar');
        expect(spec.target.type).toBe('component');
        expect(spec.changeSemantics).toContain('legacy');
    });
    it('parses ambiguous descriptions safely', () => {
        const spec = parseChangeDescription("Refactor something completely ambiguous.");
        expect(spec.operation).toBe('MODIFY');
        expect(spec.target.name).toBe('Refactor');
        expect(spec.target.type).toBe('unknown');
    });
});
