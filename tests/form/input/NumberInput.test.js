import { describe, it, expect, beforeEach } from 'vitest';
import NumberInput from '../../../src/form/input/NumberInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, fireChange } from '../../_helpers/dom.js';

describe('NumberInput', () => {
    beforeEach(() => clearDom());

    it('starts in NORMAL with valid value', () => {
        const fs = fieldset('<input type="number" name="n" value="5" min="0" max="10" />');
        const n = new NumberInput(fs, State.NORMAL);
        expect(n.isIllegal()).toBe(false);
    });

    it('flags illegal when above max', () => {
        const fs = fieldset('<input type="number" name="n" value="5" min="0" max="10" />');
        const n = new NumberInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '99');
        expect(n.isIllegal()).toBe(true);
    });

    it('flags illegal when below min', () => {
        const fs = fieldset('<input type="number" name="n" value="5" min="0" max="10" />');
        const n = new NumberInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '-1');
        expect(n.isIllegal()).toBe(true);
    });

    it('flags illegal when value violates step', () => {
        const fs = fieldset('<input type="number" name="n" value="2" step="2" />');
        const n = new NumberInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '3');
        expect(n.isIllegal()).toBe(true);
    });

    it('required + empty = illegal', () => {
        const fs = fieldset('<input type="number" name="n" value="1" />', 'required');
        const n = new NumberInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '');
        expect(n.isIllegal()).toBe(true);
    });
});
