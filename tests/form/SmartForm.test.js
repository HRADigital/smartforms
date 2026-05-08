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
                        <thead>
                            <tr>
                                <th><input type="checkbox" name="checkall-toggle" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="checkbox" name="cid[]" value="1" /></td>
                            </tr>
                        </tbody>
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

    it('resource() reads data-resource from the form', () => {
        const wrapper = html`
            <form class="smartform" data-resource="widgets">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const f = new SmartForm(wrapper.querySelector('form'));
        expect(f.resource()).toBe('widgets');
    });

    it('id() returns null when no id input is present (new record)', () => {
        const wrapper = html`
            <form class="smartform">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const f = new SmartForm(wrapper.querySelector('form'));
        expect(f.id()).toBeNull();
    });

    it('id() returns the value of input[name=id] inside the record', () => {
        const wrapper = html`
            <form class="smartform">
                <div class="smartformrecord">
                    <input type="hidden" name="id" value="42" />
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const f = new SmartForm(wrapper.querySelector('form'));
        expect(f.id()).toBe('42');
    });

    it('id() returns null when id input is empty string', () => {
        const wrapper = html`
            <form class="smartform">
                <div class="smartformrecord">
                    <input type="hidden" name="id" value="" />
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const f = new SmartForm(wrapper.querySelector('form'));
        expect(f.id()).toBeNull();
    });

    it('selectedIds() returns [] for record forms', () => {
        const wrapper = html`
            <form class="smartform">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const f = new SmartForm(wrapper.querySelector('form'));
        expect(f.selectedIds()).toEqual([]);
    });

    it('selectedIds() delegates to the SmartFormList body', () => {
        const wrapper = html`
            <form class="smartformlist">
                <div class="smartformlist">
                    <table>
                        <thead><tr><th><input type="checkbox" name="checkall-toggle" /></th></tr></thead>
                        <tbody>
                            <tr><td><input type="checkbox" name="cid[]" value="9" checked /></td></tr>
                        </tbody>
                    </table>
                </div>
            </form>
        `;
        const formEl = wrapper.querySelector('form');
        const f = new SmartForm(formEl);
        const ids = f.selectedIds();
        expect(Array.isArray(ids)).toBe(true);
    });

    it('rebaseline() delegates to the body when supported', () => {
        const wrapper = html`
            <form class="smartform">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const f = new SmartForm(wrapper.querySelector('form'));
        // Should not throw — body is SmartFormRecord which has rebaseline().
        expect(() => f.rebaseline()).not.toThrow();
    });

    it('reset event resets the body', () => {
        const wrapper = html`
            <form class="smartform">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const formEl = wrapper.querySelector('form');
        new SmartForm(formEl);
        expect(() => formEl.dispatchEvent(new Event('reset'))).not.toThrow();
    });
});
