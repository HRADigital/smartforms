import { describe, it, expect, beforeEach } from 'vitest';
import NumberInput from '../../../src/form/input/NumberInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, fireChange, fireKeyup, fireClick } from '../../_helpers/dom.js';

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

    // Asserted through validateScope rather than isIllegal: happy-dom's own
    // stepMismatch carries the same floating point flaw this test covers, so
    // checkValidity rejects a value the browsers accept.
    it('accepts a decimal value the step cannot represent in binary', () => {
        const fs = fieldset(
            '<input type="number" name="n" value="0" step="0.0000001" min="-90" max="90" />',
        );
        const n = new NumberInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '41.7015');
        expect(n.validateScope()).toBe(true);
    });

    it('measures the step from the minimum, not from zero', () => {
        const fs = fieldset('<input type="number" name="n" value="-9" step="2" min="-9" />');
        const n = new NumberInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '-7');
        expect(n.validateScope()).toBe(true);
        fireChange(fs.querySelector('input'), '-6');
        expect(n.validateScope()).toBe(false);
    });

    it('flags illegal when a negative value violates step', () => {
        const fs = fieldset('<input type="number" name="n" value="-2" step="2" min="-10" />');
        const n = new NumberInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '-3');
        expect(n.isIllegal()).toBe(true);
    });

    it('places no step constraint when step is "any"', () => {
        const fs = fieldset('<input type="number" name="n" value="1" step="any" />');
        const n = new NumberInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '1.337');
        expect(n.isIllegal()).toBe(false);
    });

    it('places no step constraint on a non numeric value', () => {
        const fs = fieldset('<input type="number" name="n" value="2" step="2" />');
        const n = new NumberInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '');
        expect(n.validateStep()).toBe(true);
    });

    it('required + empty = illegal', () => {
        const fs = fieldset('<input type="number" name="n" value="1" />', 'required');
        const n = new NumberInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '');
        expect(n.isIllegal()).toBe(true);
    });

    it('responds to keyup, click, and oninput events', () => {
        const fs = fieldset('<input type="number" name="n" value="1" min="0" max="10" />');
        const n = new NumberInput(fs, State.NORMAL);
        const input = fs.querySelector('input');
        fireKeyup(input, '99');
        expect(n.isIllegal()).toBe(true);
        fireChange(input, '5');
        expect(n.isIllegal()).toBe(false);
        fireClick(input);
        expect(n.isIllegal()).toBe(false);
        // oninput passthrough — dispatched manually since helpers don't cover it
        input.dispatchEvent(new Event('oninput', { bubbles: true }));
        expect(n.isIllegal()).toBe(false);
    });
});
