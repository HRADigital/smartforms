import { describe, it, expect, beforeEach } from 'vitest';
import DateTimeInput from '../../../src/form/input/DateTimeInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom } from '../../_helpers/dom.js';

describe('DateTimeInput', () => {
    beforeEach(() => clearDom());

    it('uses pattern as the validation rule', () => {
        const fs = fieldset(
            '<input type="text" name="d" value="2026-05-04" pattern="^\\d{4}-\\d{2}-\\d{2}$" />',
        );
        const d = new DateTimeInput(fs, State.NORMAL);
        expect(d.isIllegal()).toBe(false);
    });

    it('rejects values not matching the pattern', () => {
        const fs = fieldset(
            '<input type="text" name="d" value="not-a-date" pattern="^\\d{4}-\\d{2}-\\d{2}$" />',
        );
        const d = new DateTimeInput(fs, State.NORMAL);
        expect(d.isIllegal()).toBe(true);
    });

    it('required + empty = illegal', () => {
        const fs = fieldset('<input type="text" name="d" value="" />', 'required');
        const d = new DateTimeInput(fs, State.NORMAL);
        expect(d.isIllegal()).toBe(true);
    });
});
