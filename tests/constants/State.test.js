import { describe, it, expect } from 'vitest';
import State from '../../src/constants/State.js';

describe('State enum', () => {
    const expected = [
        'NORMAL',
        'CHANGED',
        'SELECTED',
        'MANY',
        'SUBMITTED',
        'DEACTIVATED',
        'ILLEGAL',
        'REORDERED',
    ];

    it.each(expected)('exposes %s', (key) => {
        expect(State[key]).toBeTypeOf('string');
    });

    it('values are unique', () => {
        const values = Object.values(State);
        expect(new Set(values).size).toBe(values.length);
    });

    it('is frozen', () => {
        expect(Object.isFrozen(State)).toBe(true);
        expect(() => {
            State.NORMAL = 'mutated';
        }).toThrow();
    });
});
