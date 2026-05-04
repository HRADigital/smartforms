import { describe, it, expect } from 'vitest';
import Roles from '../../src/constants/Roles.js';

describe('Roles enum', () => {
    const expected = [
        'CREATE', 'UPDATE', 'UPDATEALL', 'DELETE',
        'DELETEALL', 'CANCEL', 'LINK', 'REORDER',
    ];

    it.each(expected)('exposes %s', (key) => {
        expect(Roles[key]).toBeTypeOf('string');
    });

    it('values are unique', () => {
        const values = Object.values(Roles);
        expect(new Set(values).size).toBe(values.length);
    });

    it('is frozen', () => {
        expect(Object.isFrozen(Roles)).toBe(true);
        expect(() => { Roles.CREATE = 'mutated'; }).toThrow();
    });
});
