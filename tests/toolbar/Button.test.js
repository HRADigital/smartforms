import { describe, it, expect, beforeEach } from 'vitest';
import Button from '../../src/toolbar/Button.js';
import State from '../../src/constants/State.js';
import Roles from '../../src/constants/Roles.js';
import { html, clearDom, captureEvent } from '../_helpers/dom.js';

function makeBtn(role, task = 'do') {
    return html`<a href="#" data-role="${role}" data-task="${task}">btn</a>`.querySelector('a');
}

describe('Button', () => {
    beforeEach(() => clearDom());

    it('NORMAL state: CREATE/BACK/DESTROY → enabled visible', () => {
        for (const role of [Roles.CREATE, Roles.BACK, Roles.DESTROY]) {
            const el = makeBtn(role);
            const b = new Button(el);
            b.setState(State.NORMAL);
            expect(el.hasAttribute('disabled')).toBe(false);
            expect(el.classList.contains('hidden')).toBe(false);
        }
    });

    it('NORMAL state: UPDATE → disabled but visible', () => {
        const el = makeBtn(Roles.UPDATE);
        const b = new Button(el);
        b.setState(State.NORMAL);
        expect(el.hasAttribute('disabled')).toBe(true);
        expect(el.classList.contains('hidden')).toBe(false);
    });

    it('CHANGED state: UPDATE/DELETE/CANCEL → enabled', () => {
        for (const role of [Roles.UPDATE, Roles.DELETE, Roles.CANCEL]) {
            const el = makeBtn(role);
            const b = new Button(el);
            b.setState(State.CHANGED);
            expect(el.hasAttribute('disabled')).toBe(false);
        }
    });

    it('SELECTED state: UPDATE/DELETE/CANCEL/EDIT/TOGGLE → enabled', () => {
        for (const role of [Roles.UPDATE, Roles.DELETE, Roles.CANCEL, Roles.EDIT, Roles.TOGGLE]) {
            const el = makeBtn(role);
            new Button(el).setState(State.SELECTED);
            expect(el.hasAttribute('disabled')).toBe(false);
        }
    });

    it('MANY state: UPDATEALL/DELETEALL → enabled', () => {
        for (const role of [Roles.UPDATEALL, Roles.DELETEALL]) {
            const el = makeBtn(role);
            const b = new Button(el);
            b.setState(State.MANY);
            expect(el.hasAttribute('disabled')).toBe(false);
        }
    });

    it('ILLEGAL state: only CANCEL stays enabled', () => {
        const cancelEl = makeBtn(Roles.CANCEL);
        const updateEl = makeBtn(Roles.UPDATE);
        new Button(cancelEl).setState(State.ILLEGAL);
        new Button(updateEl).setState(State.ILLEGAL);
        expect(cancelEl.hasAttribute('disabled')).toBe(false);
        expect(updateEl.hasAttribute('disabled')).toBe(true);
    });

    it('SUBMITTED state disables every button', () => {
        const el = makeBtn(Roles.UPDATE);
        const b = new Button(el);
        b.setState(State.SUBMITTED);
        expect(el.hasAttribute('disabled')).toBe(true);
    });

    it('DEACTIVATED state disables every button', () => {
        const el = makeBtn(Roles.UPDATE);
        new Button(el).setState(State.DEACTIVATED);
        expect(el.hasAttribute('disabled')).toBe(true);
    });

    it('emits taskRequest with role + dataTaskAttr on click when enabled', () => {
        const el = makeBtn(Roles.UPDATE, 'save');
        new Button(el);
        const events = captureEvent(el, 'taskRequest');
        el.click();
        expect(events.length).toBe(1);
        expect(events[0].detail.role).toBe(Roles.UPDATE);
        expect(events[0].detail.dataTaskAttr).toBe('save');
        expect(events[0].detail.button).toBeDefined();
    });

    it('does NOT emit taskRequest when disabled', () => {
        const el = makeBtn(Roles.UPDATE, 'save');
        const b = new Button(el);
        b.setState(State.SUBMITTED);
        const events = captureEvent(el, 'taskRequest');
        el.click();
        expect(events.length).toBe(0);
    });

    it('does NOT emit taskRequest for CREATE anchor (passthrough navigation)', () => {
        const el = makeBtn(Roles.CREATE, 'navigate');
        new Button(el);
        const events = captureEvent(el, 'taskRequest');
        el.click();
        expect(events.length).toBe(0);
    });

    it('does NOT emit taskRequest for BACK anchor (passthrough navigation)', () => {
        const el = makeBtn(Roles.BACK, 'navigate');
        new Button(el);
        const events = captureEvent(el, 'taskRequest');
        el.click();
        expect(events.length).toBe(0);
    });

    it('CANCEL click resets the closest form', () => {
        const wrapper = html`
            <form>
                <input type="text" name="x" value="" />
                <a href="#" data-role="${Roles.CANCEL}" data-task="cancel">x</a>
            </form>
        `;
        const form = wrapper.querySelector('form');
        const input = wrapper.querySelector('input');
        const link = wrapper.querySelector('a');
        input.value = 'changed';
        new Button(link);
        let resetCalled = false;
        form.addEventListener('reset', () => { resetCalled = true; });
        link.click();
        expect(resetCalled).toBe(true);
    });

    it('element() returns the underlying DOM node', () => {
        const el = makeBtn(Roles.UPDATE);
        const b = new Button(el);
        expect(b.element()).toBe(el);
    });

    it('TOGGLE role is deactivated in NORMAL/CHANGED/MANY/ILLEGAL/DEACTIVATED/SUBMITTED states', () => {
        for (const state of [State.NORMAL, State.CHANGED, State.MANY, State.ILLEGAL, State.DEACTIVATED, State.SUBMITTED]) {
            const el = makeBtn(Roles.TOGGLE);
            new Button(el).setState(state);
            expect(el.hasAttribute('disabled')).toBe(true);
            expect(el.classList.contains('hidden')).toBe(false);
        }
    });

    it('TOGGLE role is activated in SELECTED state', () => {
        const el = makeBtn(Roles.TOGGLE);
        new Button(el).setState(State.SELECTED);
        expect(el.hasAttribute('disabled')).toBe(false);
    });

    it('CHANGED state: EDIT/UPDATEALL/DELETEALL activate; CREATE deactivates', () => {
        for (const role of [Roles.EDIT, Roles.UPDATEALL, Roles.DELETEALL]) {
            const el = makeBtn(role);
            new Button(el).setState(State.CHANGED);
            expect(el.hasAttribute('disabled')).toBe(false);
        }
        const create = makeBtn(Roles.CREATE);
        new Button(create).setState(State.CHANGED);
        expect(create.hasAttribute('disabled')).toBe(true);
    });

    it('SELECTED state: CREATE/UPDATEALL/DELETEALL deactivate', () => {
        for (const role of [Roles.CREATE, Roles.UPDATEALL, Roles.DELETEALL]) {
            const el = makeBtn(role);
            new Button(el).setState(State.SELECTED);
            expect(el.hasAttribute('disabled')).toBe(true);
        }
    });

    it('SELECTED state: unknown role hits default branch (deactivated visible)', () => {
        const el = html`<a href="#" data-role="unknown" data-task="x">x</a>`.querySelector('a');
        new Button(el).setState(State.SELECTED);
        expect(el.hasAttribute('disabled')).toBe(true);
        expect(el.classList.contains('hidden')).toBe(false);
    });

    it('disabled CREATE anchor click is prevented (no navigation)', () => {
        const el = makeBtn(Roles.CREATE, 'navigate');
        const b = new Button(el);
        b.setState(State.CHANGED); // CREATE is deactivated in CHANGED
        let defaultPrevented = false;
        el.addEventListener('click', (e) => { defaultPrevented = e.defaultPrevented; });
        el.click();
        expect(defaultPrevented).toBe(true);
    });

    it('hidden() adds the hidden class', () => {
        const el = makeBtn(Roles.UPDATE);
        const b = new Button(el);
        b.hidden();
        expect(el.classList.contains('hidden')).toBe(true);
    });

    it('visible() removes the hidden class', () => {
        const el = makeBtn(Roles.UPDATE);
        el.classList.add('hidden');
        const b = new Button(el);
        b.visible();
        expect(el.classList.contains('hidden')).toBe(false);
    });
});
