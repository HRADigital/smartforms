import { describe, it, expect, beforeEach } from 'vitest';
import DynamicTableInput from '../../../src/form/input/DynamicTableInput.js';
import State from '../../../src/constants/State.js';
import { html, clearDom } from '../../_helpers/dom.js';

const markup = `
    <div>
        <fieldset>
            <select name="picker"><option value="x">x</option></select>
        </fieldset>
        <table>
            <tbody>
                <tr><td><input type="hidden" name="rows[]" value="1" /></td></tr>
                <tr><td><input type="hidden" name="rows[]" value="2" /></td></tr>
            </tbody>
        </table>
    </div>
`;

describe('DynamicTableInput', () => {
    beforeEach(() => clearDom());

    it('reads name and initial values', () => {
        const wrapper = html`${markup}`;
        const table = wrapper.querySelector('table');
        const dt = new DynamicTableInput(table, State.NORMAL);
        expect(dt.name()).toBe('rows[]');
        expect(dt._initial).toEqual(['1', '2']);
        expect(dt.hasChanged()).toBe(false);
        expect(dt.isIllegal()).toBe(false);
    });

    it('hasChanged reflects different value sets', () => {
        const wrapper = html`${markup}`;
        const dt = new DynamicTableInput(wrapper.querySelector('table'), State.NORMAL);
        dt._values = ['1', '3'];
        expect(dt.hasChanged()).toBe(true);
    });

    it('hasChanged reflects different lengths', () => {
        const wrapper = html`${markup}`;
        const dt = new DynamicTableInput(wrapper.querySelector('table'), State.NORMAL);
        dt._values = ['1'];
        expect(dt.hasChanged()).toBe(true);
    });

    it('isRequired and isRecommended reflect fieldset attributes', () => {
        const wrapper = html`
            <div>
                <fieldset required recommended>
                    <select name="picker"><option value="x">x</option></select>
                </fieldset>
                <table>
                    <tbody>
                        <tr><td><input type="hidden" name="rows[]" value="1" /></td></tr>
                    </tbody>
                </table>
            </div>
        `;
        const dt = new DynamicTableInput(wrapper.querySelector('table'), State.NORMAL);
        expect(dt.isRequired()).toBe(true);
        expect(dt.isRecommended()).toBe(true);
    });

    it('reflects unchanged fieldset has no marker classes', () => {
        const wrapper = html`${markup}`;
        const dt = new DynamicTableInput(wrapper.querySelector('table'), State.NORMAL);
        expect(dt._fieldset.classList.contains('invalid')).toBe(false);
        expect(dt._fieldset.classList.contains('changed')).toBe(false);
    });

    it('emits stateChange and adds "changed" class when DOM mutates', () => {
        const wrapper = html`${markup}`;
        const table = wrapper.querySelector('table');
        const dt = new DynamicTableInput(table, State.NORMAL);
        const events = [];
        table.addEventListener('stateChange', (e) => events.push(e));

        // Add a row, then trigger the deprecated mutation event the source listens for.
        const tbody = table.querySelector('tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = '<td><input type="hidden" name="rows[]" value="3" /></td>';
        tbody.appendChild(tr);
        tbody.dispatchEvent(new Event('DOMSubtreeModified'));

        expect(events.length).toBe(1);
        expect(events[0].detail.state).toBe(State.CHANGED);
        expect(dt._fieldset.classList.contains('changed')).toBe(true);
    });

    it('isIllegal when required and empty', () => {
        const empty = html`
            <div>
                <fieldset required>
                    <select name="picker">
                        <option value="x">x</option>
                    </select>
                </fieldset>
                <table>
                    <tbody>
                        <tr>
                            <td><input type="hidden" name="rows[]" value="" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        const dt = new DynamicTableInput(empty.querySelector('table'), State.NORMAL);
        dt._values = [];
        expect(dt.isIllegal()).toBe(true);
    });
});
