import { describe, it, expect, beforeEach } from 'vitest';
import CheckBoxInput from '../../../src/form/input/CheckBoxInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, fireClick } from '../../_helpers/dom.js';

const markup = `
    <input type="checkbox" name="opt[]" value="a" checked />
    <input type="checkbox" name="opt[]" value="b" />
    <input type="checkbox" name="opt[]" value="c" />
`;

describe('CheckBoxInput', () => {
    beforeEach(() => clearDom());

    it('captures initially-checked values', () => {
        const fs = fieldset(markup);
        const c = new CheckBoxInput(fs, State.NORMAL);
        expect(c.name()).toBe('opt[]');
        expect(c._values).toEqual(['a']);
        expect(c.hasChanged()).toBe(false);
    });

    it('adds a value when a new box is checked', () => {
        const fs = fieldset(markup);
        const c = new CheckBoxInput(fs, State.NORMAL);
        const second = fs.querySelectorAll('input')[1];
        second.checked = true;
        fireClick(second);
        expect(c._values.sort()).toEqual(['a', 'b']);
        expect(c.hasChanged()).toBe(true);
        expect(fs.classList.contains('changed')).toBe(true);
    });

    it('removes a value when an existing box is unchecked', () => {
        const fs = fieldset(markup);
        const c = new CheckBoxInput(fs, State.NORMAL);
        const first = fs.querySelectorAll('input')[0];
        first.checked = false;
        fireClick(first);
        expect(c._values).toEqual([]);
        expect(c.hasChanged()).toBe(true);
    });
});
