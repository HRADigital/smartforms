import { describe, it, expect, beforeEach } from 'vitest';
import EmailInput from '../../../src/form/input/EmailInput.js';
import State from '../../../src/constants/State.js';
import { html, clearDom } from '../../_helpers/dom.js';

function makeFs(value = '', { required = false } = {}) {
    const req = required ? 'required' : '';
    const wrapper = html`
        <fieldset ${req}>
            <input type="email" name="e" value="${value}" />
        </fieldset>
    `;
    return wrapper.querySelector('fieldset');
}

describe('EmailInput.isIllegal', () => {
    beforeEach(() => clearDom());

    it('valid email is not illegal', () => {
        const e = new EmailInput(makeFs('user@example.com'), State.NORMAL);
        expect(e.isIllegal()).toBe(false);
    });

    it('empty optional is not illegal', () => {
        const e = new EmailInput(makeFs(''), State.NORMAL);
        expect(e.isIllegal()).toBe(false);
    });

    it('empty required is illegal', () => {
        const e = new EmailInput(makeFs('', { required: true }), State.NORMAL);
        expect(e.isIllegal()).toBe(true);
    });

    it('malformed email is illegal', () => {
        for (const bad of ['plain', 'no@dot', '@nodot.com', 'spaces in@x.com']) {
            const e = new EmailInput(makeFs(bad), State.NORMAL);
            expect(e.isIllegal(), `expected ${bad} to be illegal`).toBe(true);
        }
    });
});
