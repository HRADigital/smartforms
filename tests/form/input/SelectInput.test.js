import { describe, it, expect, beforeEach } from 'vitest';
import SelectInput from '../../../src/form/input/SelectInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, fireChange } from '../../_helpers/dom.js';

const markup = `
    <select name="s">
        <option value="a" selected>A</option>
        <option value="b">B</option>
        <option value="c">C</option>
    </select>
`;

describe('SelectInput', () => {
    beforeEach(() => clearDom());

    it('reads initial value and name', () => {
        const fs = fieldset(markup);
        const s = new SelectInput(fs, State.NORMAL);
        expect(s.name()).toBe('s');
        expect(s.hasChanged()).toBe(false);
    });

    it('marks changed when selection changes', () => {
        const fs = fieldset(markup);
        const s = new SelectInput(fs, State.NORMAL);
        fireChange(fs.querySelector('select'), 'b');
        expect(s.hasChanged()).toBe(true);
        expect(fs.classList.contains('changed')).toBe(true);
    });

    it('reverts to NORMAL when value matches initial', () => {
        const fs = fieldset(markup);
        const s = new SelectInput(fs, State.NORMAL);
        const sel = fs.querySelector('select');
        fireChange(sel, 'b');
        fireChange(sel, 'a');
        expect(s.hasChanged()).toBe(false);
        expect(fs.classList.contains('changed')).toBe(false);
    });
});
