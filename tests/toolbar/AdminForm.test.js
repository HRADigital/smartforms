import { describe, it, expect, beforeEach, vi } from 'vitest';
import AdminForm from '../../src/toolbar/AdminForm.js';
import * as TaskExecutorModule from '../../src/http/TaskExecutor.js';
import { html, clearDom } from '../_helpers/dom.js';

function makeFixture() {
    const wrapper = html`
        <form id="f">
            <nav class="toolbar">
                <ul>
                    <li><a href="#" data-role="update" data-task="save">save</a></li>
                </ul>
            </nav>
        </form>
    `;
    return {
        form: wrapper.querySelector('form'),
        nav: wrapper.querySelector('nav'),
    };
}

describe('AdminForm', () => {
    beforeEach(() => clearDom());

    it('delegates to TaskExecutor.execute when a taskExecuted event fires', () => {
        const { form, nav } = makeFixture();
        new AdminForm(form);

        const spy = vi.spyOn(TaskExecutorModule.default, 'execute').mockImplementation(() => {});

        const descriptor = { mode: 'sync', verb: 'PUT', endpoint: '/widgets/1' };
        const button = { element: () => nav.querySelector('a') };
        nav.dispatchEvent(
            new CustomEvent('taskExecuted', {
                detail: { descriptor, button },
            }),
        );

        expect(spy).toHaveBeenCalledOnce();
        const call = spy.mock.calls[0];
        expect(call[0]).toBe(form);
        expect(call[1]).toBe(descriptor);
        expect(call[2].source).toBe(nav.querySelector('a'));

        spy.mockRestore();
    });

    it('does not throw when no toolbar is in the form', () => {
        const wrapper = html`<form id="bare"></form>`;
        const form = wrapper.querySelector('form');
        expect(() => new AdminForm(form)).not.toThrow();
    });

    it('handles taskExecuted detail without a button safely', () => {
        const { form, nav } = makeFixture();
        new AdminForm(form);
        const spy = vi.spyOn(TaskExecutorModule.default, 'execute').mockImplementation(() => {});

        nav.dispatchEvent(
            new CustomEvent('taskExecuted', {
                detail: { descriptor: { mode: 'sync', verb: 'GET', endpoint: '' } },
            }),
        );

        expect(spy).toHaveBeenCalledOnce();
        expect(spy.mock.calls[0][2].source).toBeNull();
        spy.mockRestore();
    });
});
