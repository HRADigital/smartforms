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

    it('does not render the guide when data-guide is absent', () => {
        const fs = fieldset('<textarea name="bio" data-limit="10">a</textarea>');
        new TextAreaInput(fs, State.NORMAL);
        expect(fs.querySelector('.smartguide')).toBe(null);
    });

    it('renders the guide counter with current length and limit', () => {
        const fs = fieldset('<textarea name="bio" data-limit="10" data-guide>abc</textarea>');
        new TextAreaInput(fs, State.NORMAL);
        const guide = fs.querySelector('.smartguide');
        expect(guide).not.toBe(null);
        expect(guide.textContent).toBe('3/10');
    });

    it('updates the guide counter on keyup', () => {
        const fs = fieldset('<textarea name="bio" data-limit="10" data-guide>abc</textarea>');
        new TextAreaInput(fs, State.NORMAL);
        fireKeyup(fs.querySelector('textarea'), 'abcd');
        expect(fs.querySelector('.smartguide').textContent).toBe('4/10');
    });

    it('updates the guide counter on change', () => {
        const fs = fieldset('<textarea name="bio" data-limit="10" data-guide>abc</textarea>');
        new TextAreaInput(fs, State.NORMAL);
        fireChange(fs.querySelector('textarea'), 'ab');
        expect(fs.querySelector('.smartguide').textContent).toBe('2/10');
    });

    it('flags the counter as warning past 90% of the limit, and clears it after', () => {
        const fs = fieldset('<textarea name="bio" data-limit="10" data-guide>abc</textarea>');
        new TextAreaInput(fs, State.NORMAL);
        const area = fs.querySelector('textarea');
        const counter = fs.querySelector('.smartguide').firstChild;

        fireKeyup(area, '0123456789');
        expect(counter.className).toBe('warning');

        fireKeyup(area, '01234');
        expect(counter.className).toBe('');
    });

    it('blocks keypresses once the character limit is reached', () => {
        const fs = fieldset('<textarea name="bio" data-limit="3">abc</textarea>');
        new TextAreaInput(fs, State.NORMAL);
        const area = fs.querySelector('textarea');

        const blocked = new KeyboardEvent('keypress', { bubbles: true, cancelable: true });
        area.dispatchEvent(blocked);
        expect(blocked.defaultPrevented).toBe(true);
    });

    it('allows keypresses below the character limit', () => {
        const fs = fieldset('<textarea name="bio" data-limit="3">a</textarea>');
        new TextAreaInput(fs, State.NORMAL);
        const area = fs.querySelector('textarea');

        const allowed = new KeyboardEvent('keypress', { bubbles: true, cancelable: true });
        area.dispatchEvent(allowed);
        expect(allowed.defaultPrevented).toBe(false);
    });
});
