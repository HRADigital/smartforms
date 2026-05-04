import { describe, it, expect, beforeEach } from 'vitest';
import RadioInput from '../../../src/form/input/RadioInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, captureEvent } from '../../_helpers/dom.js';

const markup = `
    <input type="radio" name="r" value="a" checked />
    <input type="radio" name="r" value="b" />
    <input type="radio" name="r" value="c" />
`;

describe('RadioInput', () => {
    beforeEach(() => clearDom());

    it('reads initial checked option', () => {
        const fs = fieldset(markup);
        const r = new RadioInput(fs, State.NORMAL);
        expect(r.name()).toBe('r');
        expect(r._initial).toBe('a');
    });

    it('emits stateChange with CHANGED when a different radio is selected', () => {
        const fs = fieldset(markup);
        new RadioInput(fs, State.NORMAL);
        const events = captureEvent(fs, 'stateChange');

        const second = fs.querySelectorAll('input')[1];
        second.checked = true;
        second.dispatchEvent(new Event('change', { bubbles: true }));

        expect(events.at(-1).detail.state).toBe(State.CHANGED);
    });

    it('emits stateChange with NORMAL when reverting to initial', () => {
        const fs = fieldset(markup);
        new RadioInput(fs, State.NORMAL);
        const events = captureEvent(fs, 'stateChange');

        const second = fs.querySelectorAll('input')[1];
        second.checked = true;
        second.dispatchEvent(new Event('change', { bubbles: true }));

        const first = fs.querySelectorAll('input')[0];
        first.checked = true;
        first.dispatchEvent(new Event('change', { bubbles: true }));

        expect(events.at(-1).detail.state).toBe(State.NORMAL);
    });
});
