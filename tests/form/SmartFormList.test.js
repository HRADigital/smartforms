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
});
