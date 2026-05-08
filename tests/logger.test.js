import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { log, warn, toggleDebug } from '../src/logger.js';

describe('logger', () => {
    let logSpy;
    let warnSpy;

    beforeEach(() => {
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        // Reset to disabled regardless of state.
        toggleDebug(false);
        logSpy.mockRestore();
        warnSpy.mockRestore();
    });

    it('log/warn are no-ops while debug is disabled', () => {
        toggleDebug(false);
        logSpy.mockClear();
        warnSpy.mockClear();
        log('hello');
        warn('world');
        expect(logSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('toggleDebug(true) enables log + warn forwarding', () => {
        toggleDebug(true);
        logSpy.mockClear();
        warnSpy.mockClear();
        log('hello');
        warn('world');
        expect(logSpy).toHaveBeenCalledWith('hello');
        expect(warnSpy).toHaveBeenCalledWith('world');
    });

    it('toggleDebug() flips the current value and returns it', () => {
        toggleDebug(false);
        const after = toggleDebug();
        expect(after).toBe(true);
        const back = toggleDebug();
        expect(back).toBe(false);
    });

    it('toggleDebug coerces truthy/falsy values', () => {
        expect(toggleDebug(1)).toBe(true);
        expect(toggleDebug(0)).toBe(false);
        expect(toggleDebug('yes')).toBe(true);
    });
});
