import { describe, it, expect, beforeEach } from 'vitest';
import ColorInput from '../../../src/form/input/ColorInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, fireChange } from '../../_helpers/dom.js';

describe('ColorInput', () => {
    beforeEach(() => clearDom());

    it('starts in NORMAL with valid color', () => {
        const fs = fieldset('<input type="color" name="c" value="#ff0000" />');
        const c = new ColorInput(fs, State.NORMAL);
        expect(c.name()).toBe('c');
        expect(c.isIllegal()).toBe(false);
    });

    it('marks changed on new value', () => {
        const fs = fieldset('<input type="color" name="c" value="#ff0000" />');
        const c = new ColorInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '#00ff00');
        expect(c.hasChanged()).toBe(true);
        expect(fs.classList.contains('changed')).toBe(true);
    });

    it('marks changed while picking a colour (input event)', () => {
        const fs = fieldset('<input type="color" name="c" value="#ff0000" />');
        const c = new ColorInput(fs, State.NORMAL);
        const input = fs.querySelector('input');
        input.value = '#0000ff';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(c.hasChanged()).toBe(true);
        expect(fs.classList.contains('changed')).toBe(true);
    });
});
