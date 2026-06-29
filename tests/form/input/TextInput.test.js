import { describe, it, expect, beforeEach } from 'vitest';
import TextInput from '../../../src/form/input/TextInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, fireKeyup, fireChange } from '../../_helpers/dom.js';

describe('TextInput', () => {
    beforeEach(() => clearDom());

    it('reads initial value, name and starts in NORMAL', () => {
        const fs = fieldset('<input name="title" value="hello" />');
        const t = new TextInput(fs, State.NORMAL);
        expect(t.name()).toBe('title');
        expect(t.hasChanged()).toBe(false);
    });

    it('marks changed on keyup with new value', () => {
        const fs = fieldset('<input name="x" value="a" />');
        const t = new TextInput(fs, State.NORMAL);
        fireKeyup(fs.querySelector('input'), 'b');
        expect(fs.classList.contains('changed')).toBe(true);
        expect(t.hasChanged()).toBe(true);
    });

    it('reverts to NORMAL when value matches initial', () => {
        const fs = fieldset('<input name="x" value="a" />');
        const t = new TextInput(fs, State.NORMAL);
        fireKeyup(fs.querySelector('input'), 'b');
        fireKeyup(fs.querySelector('input'), 'a');
        expect(fs.classList.contains('changed')).toBe(false);
        expect(t.hasChanged()).toBe(false);
    });

    it('marks invalid when required and empty', () => {
        const fs = fieldset('<input name="x" value="hi" />', 'required');
        const t = new TextInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), '');
        expect(t.isIllegal()).toBe(true);
        expect(fs.classList.contains('invalid')).toBe(true);
    });

    it('regex rule rejects non-matching values', () => {
        const fs = fieldset('<input name="x" value="abc" data-rule="^[0-9]+$" />');
        const t = new TextInput(fs, State.NORMAL);
        expect(t.isIllegal()).toBe(true);
        fireChange(fs.querySelector('input'), '123');
        expect(t.isIllegal()).toBe(false);
    });

    it('renders character guide when data-guide is set', () => {
        const fs = fieldset('<input name="x" value="ab" data-limit="10" data-guide="1" />');
        new TextInput(fs, State.NORMAL);
        expect(fs.querySelector('.smartguide')).not.toBeNull();
    });

    it('processGuide marks warning when nearing the limit', () => {
        const fs = fieldset('<input name="x" value="" data-limit="10" data-guide="1" />');
        const t = new TextInput(fs, State.NORMAL);
        const inp = fs.querySelector('input');
        fireKeyup(inp, '1234567890');
        expect(t._guide.className).toBe('warning');
    });

    it('processGuide clears the warning class below the threshold', () => {
        const fs = fieldset('<input name="x" value="" data-limit="10" data-guide="1" />');
        const t = new TextInput(fs, State.NORMAL);
        const inp = fs.querySelector('input');
        fireKeyup(inp, '1234567890');
        expect(t._guide.className).toBe('warning');
        fireKeyup(inp, '12');
        expect(t._guide.className).toBe('');
    });

    it('onKeyPress blocks further input once the limit is reached', () => {
        const fs = fieldset('<input name="x" value="1234567890" data-limit="10" />');
        new TextInput(fs, State.NORMAL);
        const ev = new KeyboardEvent('keypress', { bubbles: true, cancelable: true });
        fs.querySelector('input').dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
    });

    it('onKeyPress allows input below the limit', () => {
        const fs = fieldset('<input name="x" value="12" data-limit="10" />');
        new TextInput(fs, State.NORMAL);
        const ev = new KeyboardEvent('keypress', { bubbles: true, cancelable: true });
        fs.querySelector('input').dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(false);
    });
});
