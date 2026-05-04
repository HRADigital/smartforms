import { describe, it, expect, beforeEach } from 'vitest';
import Row from '../../../src/form/list/Row.js';
import State from '../../../src/constants/State.js';
import { html, clearDom, captureEvent } from '../../_helpers/dom.js';

describe('Row', () => {
    beforeEach(() => clearDom());

    function makeRow(checked = false) {
        const wrapper = html`
            <table>
                <tbody>
                    <tr>
                        <td>
                            <input
                                type="checkbox"
                                name="cid[]"
                                value="42"
                                ${checked ? 'checked' : ''}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
        return wrapper.querySelector('tr');
    }

    it('exposes id() and order()', () => {
        const tr = makeRow();
        const row = new Row(tr, 7);
        expect(row.id()).toBe('42');
        expect(row.order()).toBe(7);
    });

    it('emits stateChange CHANGED when toggled from initial', () => {
        const tr = makeRow(false);
        const row = new Row(tr, 1);
        const events = captureEvent(tr, 'stateChange');

        const cb = tr.querySelector('input');
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));

        expect(events.length).toBe(1);
        expect(events[0].detail.state).toBe(State.CHANGED);
        expect(events[0].detail.instance).toBe(row);
    });

    it('emits NORMAL when reverting to initial', () => {
        const tr = makeRow(false);
        new Row(tr, 1);
        const events = captureEvent(tr, 'stateChange');
        const cb = tr.querySelector('input');

        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        cb.checked = false;
        cb.dispatchEvent(new Event('change', { bubbles: true }));

        expect(events.at(-1).detail.state).toBe(State.NORMAL);
    });
});
