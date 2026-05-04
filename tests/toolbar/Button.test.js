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

    it('NORMAL state: CREATE/LINK/CANCEL → enabled visible', () => {
        for (const role of [Roles.CREATE, Roles.LINK, Roles.CANCEL]) {
            const el = makeBtn(role);
            const b = new Button(el);
            b.setState(State.NORMAL);
            expect(el.hasAttribute('disabled')).toBe(false);
            expect(el.classList.contains('hidden')).toBe(false);
        }
    });

    it('NORMAL state: REORDER → hidden', () => {
        const el = makeBtn(Roles.REORDER);
        const b = new Button(el);
        b.setState(State.NORMAL);
        expect(el.classList.contains('hidden')).toBe(true);
    });

    it('CHANGED state: UPDATE/DELETE/CANCEL → enabled', () => {
        for (const role of [Roles.UPDATE, Roles.DELETE, Roles.CANCEL]) {
            const el = makeBtn(role);
            const b = new Button(el);
            b.setState(State.CHANGED);
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

    it('REORDERED state: REORDER/LINK active, others hidden', () => {
        const reorder = makeBtn(Roles.REORDER);
        const update  = makeBtn(Roles.UPDATE);
        new Button(reorder).setState(State.REORDERED);
        new Button(update).setState(State.REORDERED);
        expect(reorder.hasAttribute('disabled')).toBe(false);
        expect(update.classList.contains('hidden')).toBe(true);
    });

    it('emits taskRequest on click when enabled and not LINK', () => {
        const el = makeBtn(Roles.UPDATE, 'save');
        new Button(el);
        const events = captureEvent(el, 'taskRequest');
        el.click();
        expect(events.length).toBe(1);
        expect(events[0].detail.task).toBe('save');
    });

    it('does NOT emit taskRequest when disabled', () => {
        const el = makeBtn(Roles.UPDATE, 'save');
        const b = new Button(el);
        b.setState(State.SUBMITTED);
        const events = captureEvent(el, 'taskRequest');
        el.click();
        expect(events.length).toBe(0);
    });

    it('does NOT emit taskRequest for LINK role (anchor passthrough)', () => {
        const el = makeBtn(Roles.LINK, 'navigate');
        new Button(el);
        const events = captureEvent(el, 'taskRequest');
        el.click();
        expect(events.length).toBe(0);
    });
});
