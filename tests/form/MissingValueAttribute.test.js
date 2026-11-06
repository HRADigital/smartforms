import { describe, it, expect, beforeEach } from 'vitest';
import SmartForm from '../../src/form/SmartForm.js';
import State from '../../src/constants/State.js';
import { html, clearDom, fireKeyup } from '../_helpers/dom.js';

// An input with no `value` attribute (e.g. a password field) used to make
// getAttribute('value') return null, and `null.trim()` threw from inside the
// SmartForm constructor - so autoInit() never wired the page.
const cases = [
    { type: 'text', typed: 'Ada' },
    { type: 'password', typed: 'secret' },
    { type: 'email', typed: 'ada@example.com' },
    { type: 'url', typed: 'https://example.com' },
    { type: 'number', typed: '5' },
];

function build(type, fieldsetAttrs = '', inputAttrs = '') {
    const root = html`
        <form class="smartform">
            <div class="smartformrecord">
                <fieldset ${fieldsetAttrs}>
                    <input type="${type}" name="field" ${inputAttrs} />
                </fieldset>
            </div>
        </form>
    `;
    return { form: root.querySelector('form'), input: root.querySelector('input') };
}

describe('input with no value attribute', () => {
    beforeEach(() => clearDom());

    for (const { type, typed } of cases) {
        describe(`type="${type}"`, () => {
            it('initialises without an exception and starts NORMAL', () => {
                const { form } = build(type);
                let smartForm = null;
                expect(() => (smartForm = new SmartForm(form))).not.toThrow();
                expect(smartForm.state()).toBe(State.NORMAL);
            });

            it('goes to CHANGED after the user types', () => {
                const { form, input } = build(type);
                const smartForm = new SmartForm(form);
                fireKeyup(input, typed);
                expect(smartForm.state()).toBe(State.CHANGED);
            });

            it('goes back to NORMAL after the user clears the field', () => {
                const { form, input } = build(type);
                const smartForm = new SmartForm(form);
                fireKeyup(input, typed);
                fireKeyup(input, '');
                expect(smartForm.state()).toBe(State.NORMAL);
            });

            it('initialises without an exception when required, and starts ILLEGAL', () => {
                const { form } = build(type, 'required');
                let smartForm = null;
                expect(() => (smartForm = new SmartForm(form))).not.toThrow();
                expect(smartForm.state()).toBe(State.ILLEGAL);
            });
        });
    }

    it('initialises a required datetime picker without an exception', () => {
        const datetime = build('text', 'required', 'class="datetimepicker"');
        expect(new SmartForm(datetime.form).state()).toBe(State.ILLEGAL);
    });

    it('renders the character guide with a zero count', () => {
        const { form } = build('text', '', 'data-limit="10" data-guide="1"');
        expect(() => new SmartForm(form)).not.toThrow();
        expect(form.querySelector('.smartguide').textContent).toBe('0/10');
    });
});
