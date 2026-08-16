import { describe, it, expect, beforeEach } from 'vitest';
import SmartFormRecord from '../../src/form/SmartFormRecord.js';
import State from '../../src/constants/State.js';
import { html, clearDom } from '../_helpers/dom.js';

describe('SmartFormRecord', () => {
    beforeEach(() => clearDom());

    it('starts in NORMAL with valid initial state', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset><input type="text" name="title" value="hello" /></fieldset>
                <fieldset><textarea name="bio">x</textarea></fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        expect(r.state()).toBe(State.NORMAL);
    });

    it('flips to CHANGED when a child input changes', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset><input type="text" name="title" value="hello" /></fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        const inp = wrapper.querySelector('input');
        inp.value = 'world';
        inp.dispatchEvent(new Event('keyup', { bubbles: true }));
        expect(r.state()).toBe(State.CHANGED);
    });

    it('flips to ILLEGAL when a required child becomes empty', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset required><input type="text" name="title" value="hello" /></fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        const inp = wrapper.querySelector('input');
        inp.value = '';
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        expect(r.state()).toBe(State.ILLEGAL);
    });

    it('reverts to NORMAL when all child fields go back to initial', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset><input type="text" name="title" value="hello" /></fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        const inp = wrapper.querySelector('input');
        inp.value = 'world';
        inp.dispatchEvent(new Event('keyup', { bubbles: true }));
        inp.value = 'hello';
        inp.dispatchEvent(new Event('keyup', { bubbles: true }));
        expect(r.state()).toBe(State.NORMAL);
    });

    it('reset() restores inputs and clears state back to NORMAL', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset><input type="text" name="title" value="hello" /></fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        const inp = wrapper.querySelector('input');
        inp.value = 'world';
        inp.dispatchEvent(new Event('keyup', { bubbles: true }));
        expect(r.state()).toBe(State.CHANGED);
        r.reset();
        expect(r.state()).toBe(State.NORMAL);
        expect(inp.value).toBe('hello');
    });

    it('rebaseline() captures current values as the new baseline', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset><input type="text" name="title" value="hello" /></fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        const inp = wrapper.querySelector('input');
        inp.value = 'world';
        inp.dispatchEvent(new Event('keyup', { bubbles: true }));
        r.rebaseline();
        expect(r.state()).toBe(State.NORMAL);
    });

    it('clears the illegal flag when a required child becomes valid again', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset required><input type="text" name="title" value="hello" /></fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        const inp = wrapper.querySelector('input');
        inp.value = '';
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        expect(r.state()).toBe(State.ILLEGAL);
        inp.value = 'hello';
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        expect(r.state()).toBe(State.NORMAL);
    });

    it('tracks each checkbox group only once', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset>
                    <input type="checkbox" name="tags" value="a" checked />
                    <input type="checkbox" name="tags" value="b" />
                </fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        expect(r._inputs.length).toBe(1);
    });

    it('tracks a radio group spread over sibling wrappers only once', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset>
                    <div><input type="radio" name="pick" value="a" checked /></div>
                    <div><input type="radio" name="pick" value="b" /></div>
                </fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        expect(r._inputs.length).toBe(1);
    });

    it('loads datetimepicker inputs as DateTimeInput', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset>
                    <input
                        type="text"
                        class="datetimepicker"
                        name="when"
                        value="2026-08-17 10:00"
                    />
                </fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        expect(r._inputs.length).toBe(1);
        expect(r._inputs[0].constructor.name).toBe('DateTimeInput');
    });

    it('loads dynamic tables as DynamicTableInput', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset>
                    <select name="picker">
                        <option value="x">x</option>
                    </select>
                </fieldset>
                <table class="smartdynamictable">
                    <tbody>
                        <tr>
                            <td><input type="hidden" name="rows[]" value="1" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        expect(r._inputs.some((i) => i.constructor.name === 'DynamicTableInput')).toBe(true);
    });

    it('reset() clears the state even for inputs that cannot restore themselves', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset>
                    <select name="picker">
                        <option value="x">x</option>
                    </select>
                </fieldset>
                <table class="smartdynamictable">
                    <tbody>
                        <tr>
                            <td><input type="hidden" name="rows[]" value="1" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        const record = wrapper.querySelector('.smartformrecord');
        const r = new SmartFormRecord(record, State.NORMAL);
        const tbody = wrapper.querySelector('tbody');

        const tr = document.createElement('tr');
        tr.innerHTML = '<td><input type="hidden" name="rows[]" value="2" /></td>';
        tbody.appendChild(tr);
        tbody.dispatchEvent(new Event('DOMSubtreeModified'));
        expect(r.state()).toBe(State.CHANGED);

        const events = [];
        record.addEventListener('formStateChange', (e) => events.push(e));
        r.reset();

        expect(r.state()).toBe(State.NORMAL);
        expect(events.length).toBe(1);
    });

    it('initializeWebControls does nothing without selectors', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset><input type="text" name="title" value="hello" /></fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        const before = r._inputs.length;
        r.initializeWebControls(State.NORMAL, []);
        expect(r._inputs.length).toBe(before);
    });

    it('skips inputs whose type has no registered handler', () => {
        const wrapper = html`
            <div class="smartformrecord">
                <fieldset><input type="hidden" name="weird" value="x" /></fieldset>
                <fieldset><input type="text" name="title" value="hello" /></fieldset>
            </div>
        `;
        const r = new SmartFormRecord(wrapper.querySelector('.smartformrecord'), State.NORMAL);
        expect(r.state()).toBe(State.NORMAL);
    });
});
