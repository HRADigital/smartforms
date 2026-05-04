import { describe, it, expect, beforeEach } from 'vitest';
import TextAreaInput from '../../../src/form/input/TextAreaInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, fireChange, fireKeyup } from '../../_helpers/dom.js';

describe('TextAreaInput', () => {
    beforeEach(() => clearDom());

    it('reads name from element and starts in NORMAL', () => {
        const fs = fieldset('<textarea name="bio">hello</textarea>');
        const t = new TextAreaInput(fs, State.NORMAL);
        expect(t.name()).toBe('bio');
        expect(t.hasChanged()).toBe(false);
    });

    it('trims whitespace before comparing', () => {
        const fs = fieldset('<textarea name="bio">hello</textarea>');
        const t = new TextAreaInput(fs, State.NORMAL);
        fireChange(fs.querySelector('textarea'), '  hello  ');
        expect(t.hasChanged()).toBe(false);
    });

    it('marks changed on keyup with new value', () => {
        const fs = fieldset('<textarea name="bio">a</textarea>');
        const t = new TextAreaInput(fs, State.NORMAL);
        fireKeyup(fs.querySelector('textarea'), 'b');
        expect(t.hasChanged()).toBe(true);
        expect(fs.classList.contains('changed')).toBe(true);
    });

    it('required + empty = illegal', () => {
        const fs = fieldset('<textarea name="bio">a</textarea>', 'required');
        const t = new TextAreaInput(fs, State.NORMAL);
        fireChange(fs.querySelector('textarea'), '');
        expect(t.isIllegal()).toBe(true);
        expect(fs.classList.contains('invalid')).toBe(true);
    });
});
