import { describe, it, expect, beforeEach } from 'vitest';
import SmartForm from '../../src/form/SmartForm.js';
import State from '../../src/constants/State.js';
import { html, clearDom } from '../_helpers/dom.js';

describe('SmartForm', () => {
    beforeEach(() => clearDom());

    it('builds a SmartFormList body when .smartformlist is present', () => {
        const wrapper = html`
            <form class="smartform">
                <div class="smartformlist">
                    <table>
                        <thead><tr><th><input type="checkbox" name="checkall-toggle" /></th></tr></thead>
                        <tbody><tr><td><input type="checkbox" name="cid[]" value="1" /></td></tr></tbody>
                    </table>
                </div>
            </form>
        `;
        const form = new SmartForm(wrapper.querySelector('form'));
        expect(form.state()).toBe(State.NORMAL);
    });

    it('builds a SmartFormRecord body when .smartformrecord is present', () => {
        const wrapper = html`
            <form class="smartform">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const form = new SmartForm(wrapper.querySelector('form'));
        expect(form.state()).toBe(State.NORMAL);
    });

    it('throws when neither body type is found', () => {
        const wrapper = html`<form class="smartform"></form>`;
        expect(() => new SmartForm(wrapper.querySelector('form'))).toThrow(/body not found/);
    });
});
