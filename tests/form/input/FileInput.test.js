import { describe, it, expect, beforeEach } from 'vitest';
import FileInput from '../../../src/form/input/FileInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, fireChange, fireKeyup } from '../../_helpers/dom.js';

describe('FileInput', () => {
    beforeEach(() => clearDom());

    it('starts in NORMAL', () => {
        const fs = fieldset('<input type="file" name="f" />');
        const f = new FileInput(fs, State.NORMAL);
        expect(f.name()).toBe('f');
        expect(f.isIllegal()).toBe(false);
    });

    it('hasChanged when value is non-null (post-upload semantics)', () => {
        const fs = fieldset('<input type="file" name="f" value="x.png" />');
        const f = new FileInput(fs, State.NORMAL);
        expect(f.hasChanged()).toBe(true);
    });

    it('hasChanged is false when value is null', () => {
        const fs = fieldset('<input type="file" name="f" />');
        const f = new FileInput(fs, State.NORMAL);
        expect(f.hasChanged()).toBe(false);
    });

    it('change/keyup handlers run without throwing', () => {
        const fs = fieldset('<input type="file" name="f" />');
        new FileInput(fs, State.NORMAL);
        const input = fs.querySelector('input');
        // happy-dom forbids writing non-empty strings to file inputs, so dispatch
        // events without changing value to exercise the handler bodies.
        expect(() => fireChange(input)).not.toThrow();
        expect(() => fireKeyup(input)).not.toThrow();
    });
});
