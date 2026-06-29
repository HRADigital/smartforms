import { describe, it, expect, beforeEach } from 'vitest';
import SmartFormList from '../../src/form/SmartFormList.js';
import State from '../../src/constants/State.js';
import { html, clearDom } from '../_helpers/dom.js';

const markup = `
    <div class="smartformlist">
        <table>
            <thead><tr><th><input type="checkbox" name="checkall-toggle" /></th></tr></thead>
            <tbody>
                <tr><td><input type="checkbox" name="cid[]" value="1" /></td></tr>
                <tr><td><input type="checkbox" name="cid[]" value="2" /></td></tr>
                <tr><td><input type="checkbox" name="cid[]" value="3" /></td></tr>
            </tbody>
        </table>
    </div>
`;

describe('SmartFormList', () => {
    beforeEach(() => clearDom());

    it('counts rows and starts in NORMAL with no changes', () => {
        const wrapper = html`${markup}`;
        const list = new SmartFormList(wrapper.querySelector('.smartformlist'), State.NORMAL);
        expect(list.rowCount()).toBe(3);
        expect(list.changedCount()).toBe(0);
        expect(list.state()).toBe(State.NORMAL);
    });

    it('toggles SELECTED when one row is checked', () => {
        const wrapper = html`${markup}`;
        const list = new SmartFormList(wrapper.querySelector('.smartformlist'), State.NORMAL);
        const first = wrapper.querySelectorAll('tbody input')[0];
        first.checked = true;
        first.dispatchEvent(new Event('change', { bubbles: true }));
        expect(list.state()).toBe(State.SELECTED);
        expect(list.changedCount()).toBe(1);
    });

    it('moves to MANY when 2+ rows are checked', () => {
        const wrapper = html`${markup}`;
        const list = new SmartFormList(wrapper.querySelector('.smartformlist'), State.NORMAL);
        wrapper.querySelectorAll('tbody input').forEach((cb) => {
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
        expect(list.state()).toBe(State.MANY);
        expect(list.changedCount()).toBe(3);
    });

    it('toggle-all checks every row', () => {
        const wrapper = html`${markup}`;
        const list = new SmartFormList(wrapper.querySelector('.smartformlist'), State.NORMAL);
        const toggle = wrapper.querySelector('thead input');
        toggle.checked = true;
        toggle.dispatchEvent(new Event('change', { bubbles: true }));
        wrapper.querySelectorAll('tbody input').forEach((cb) => expect(cb.checked).toBe(true));
        expect(list.state()).toBe(State.MANY);
    });

    it('selectedIds() returns the values of checked rows', () => {
        const wrapper = html`${markup}`;
        const list = new SmartFormList(wrapper.querySelector('.smartformlist'), State.NORMAL);
        const cbs = wrapper.querySelectorAll('tbody input');
        cbs[0].checked = true;
        cbs[2].checked = true;
        cbs[0].dispatchEvent(new Event('change', { bubbles: true }));
        cbs[2].dispatchEvent(new Event('change', { bubbles: true }));
        expect(list.selectedIds().sort()).toEqual(['1', '3']);
    });

    it('id() returns the single checked id, or null otherwise', () => {
        const wrapper = html`${markup}`;
        const list = new SmartFormList(wrapper.querySelector('.smartformlist'), State.NORMAL);
        expect(list.id()).toBeNull();
        const cb = wrapper.querySelectorAll('tbody input')[1];
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        expect(list.id()).toBe('2');
        // Add a second selection — id() should drop back to null.
        const cb2 = wrapper.querySelectorAll('tbody input')[0];
        cb2.checked = true;
        cb2.dispatchEvent(new Event('change', { bubbles: true }));
        expect(list.id()).toBeNull();
    });

    it('rebaseline() clears selection and returns state to NORMAL', () => {
        const wrapper = html`${markup}`;
        const list = new SmartFormList(wrapper.querySelector('.smartformlist'), State.NORMAL);
        const cbs = wrapper.querySelectorAll('tbody input');
        cbs[0].checked = true;
        cbs[0].dispatchEvent(new Event('change', { bubbles: true }));
        expect(list.state()).toBe(State.SELECTED);
        list.rebaseline();
        expect(list.state()).toBe(State.NORMAL);
        wrapper.querySelectorAll('tbody input').forEach((cb) => expect(cb.checked).toBe(false));
        expect(wrapper.querySelector('thead input').checked).toBe(false);
    });

    it('drops a row back out of the changed set when it is unchecked', () => {
        const wrapper = html`${markup}`;
        const list = new SmartFormList(wrapper.querySelector('.smartformlist'), State.NORMAL);
        const cb = wrapper.querySelectorAll('tbody input')[0];
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        expect(list.changedCount()).toBe(1);
        cb.checked = false;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        expect(list.changedCount()).toBe(0);
        expect(list.state()).toBe(State.NORMAL);
    });

    it('resource() returns the data-resource attribute, or null when absent', () => {
        const withResource = html`<div class="smartformlist" data-resource="widgets">
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
        </div>`;
        const list = new SmartFormList(withResource.querySelector('.smartformlist'), State.NORMAL);
        expect(list.resource()).toBe('widgets');

        const without = html`${markup}`;
        const bare = new SmartFormList(without.querySelector('.smartformlist'), State.NORMAL);
        expect(bare.resource()).toBeNull();
    });
});
