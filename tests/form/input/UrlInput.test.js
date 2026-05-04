import { describe, it, expect, beforeEach } from 'vitest';
import UrlInput from '../../../src/form/input/UrlInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, fireChange } from '../../_helpers/dom.js';

describe('UrlInput', () => {
    beforeEach(() => clearDom());

    it('accepts a well-formed URL', () => {
        const fs = fieldset('<input type="url" name="u" value="https://example.com/path" />');
        const u = new UrlInput(fs, State.NORMAL);
        expect(u.isIllegal()).toBe(false);
    });

    it('rejects malformed URLs', () => {
        const fs = fieldset('<input type="url" name="u" value="https://example.com/path" />');
        const u = new UrlInput(fs, State.NORMAL);
        fireChange(fs.querySelector('input'), 'not a url');
        expect(u.isIllegal()).toBe(true);
    });

    it('empty + not required is legal', () => {
        const fs = fieldset('<input type="url" name="u" value="" />');
        const u = new UrlInput(fs, State.NORMAL);
        expect(u.isIllegal()).toBe(false);
    });

    it('empty + required is illegal', () => {
        const fs = fieldset('<input type="url" name="u" value="" />', 'required');
        const u = new UrlInput(fs, State.NORMAL);
        expect(u.isIllegal()).toBe(true);
    });
});
