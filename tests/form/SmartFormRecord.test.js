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
});
