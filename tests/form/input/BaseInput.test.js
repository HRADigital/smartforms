import { describe, it, expect, beforeEach } from 'vitest';
import BaseInput from '../../../src/form/input/BaseInput.js';
import State from '../../../src/constants/State.js';
import { fieldset, clearDom, captureEvent } from '../../_helpers/dom.js';

describe('BaseInput', () => {
    beforeEach(() => clearDom());

    it('starts unchanged, not illegal', () => {
        const fs = fieldset('<input name="x" />');
        const input = new BaseInput(fs, State.NORMAL);
        expect(input.hasChanged()).toBe(false);
        expect(input.isIllegal()).toBe(false);
        expect(input.isRequired()).toBe(false);
        expect(input.isRecommended()).toBe(false);
    });

    it('detects required attribute', () => {
        const fs = fieldset('<input name="x" />', 'required');
        const input = new BaseInput(fs, State.NORMAL);
        expect(input.isRequired()).toBe(true);
        expect(input.isIllegal()).toBe(true);
    });

    it('detects recommended attribute', () => {
        const fs = fieldset('<input name="x" />', 'recommended');
        const input = new BaseInput(fs, State.NORMAL);
        expect(input.isRecommended()).toBe(true);
    });

    it('processChange transitions through illegal/changed/normal', () => {
        const fs = fieldset('<input name="x" />', 'required');
        const input = new BaseInput(fs, State.NORMAL);
        input._initial = 'initial';

        input.processChange('');
        expect(fs.classList.contains('invalid')).toBe(true);

        input.processChange('something');
        expect(fs.classList.contains('changed')).toBe(true);
        expect(fs.classList.contains('invalid')).toBe(false);

        input.processChange('initial');
        expect(fs.classList.contains('changed')).toBe(false);
        expect(fs.classList.contains('invalid')).toBe(false);
    });

    it('emits stateChange CustomEvent when state transitions', () => {
        const fs = fieldset('<input name="x" />');
        const input = new BaseInput(fs, State.NORMAL);
        input._initial = 'a';

        const events = captureEvent(fs, 'stateChange');
        input.processChange('b');
        expect(events.length).toBe(1);
        expect(events[0].detail.state).toBe(State.CHANGED);
        expect(events[0].detail.instance).toBe(input);
    });

    it('does not emit stateChange when state is unchanged', () => {
        const fs = fieldset('<input name="x" />');
        const input = new BaseInput(fs, State.NORMAL);
        input._initial = 'a';

        const events = captureEvent(fs, 'stateChange');
        input.processChange('a');
        expect(events.length).toBe(0);
    });

    it('name() returns the underlying name', () => {
        const fs = fieldset('<input name="x" />');
        const input = new BaseInput(fs, State.NORMAL);
        input._name = 'foo';
        expect(input.name()).toBe('foo');
    });
});
