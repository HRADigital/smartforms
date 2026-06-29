import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TaskExecutor from '../../src/http/TaskExecutor.js';
import { registerForm } from '../../src/index.js';
import Tasks from '../../src/constants/Tasks.js';
import { html, clearDom, captureEvent } from '../_helpers/dom.js';

function fakeInstance({ id = 1, ids = [], state = 'normal', resource = 'widgets' } = {}) {
    return {
        id: () => id,
        selectedIds: () => ids,
        state: () => state,
        resource: () => resource,
        rebaseline: vi.fn(),
    };
}

describe('TaskExecutor.execute', () => {
    beforeEach(() => clearDom());

    afterEach(() => {
        if (globalThis.fetch && globalThis.fetch.mockRestore) globalThis.fetch.mockRestore();
        Tasks.configure({
            csrf: { metaName: 'csrf-token', headerName: 'X-CSRF-TOKEN', value: null },
        });
    });

    it('throws when the form was never registered', () => {
        const wrapper = html`<form action="/x"></form>`;
        const form = wrapper.querySelector('form');
        expect(() =>
            TaskExecutor.execute(form, { mode: 'sync', verb: 'GET', endpoint: '' }),
        ).toThrow(/not registered/);
    });

    describe('sync mode', () => {
        it('GET navigates to form action via window.location.assign', () => {
            const wrapper = html`<form action="/widgets/list"></form>`;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance());
            const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
            TaskExecutor.execute(form, { mode: 'sync', verb: 'GET', endpoint: '' });
            expect(assign).toHaveBeenCalledWith('/widgets/list');
            assign.mockRestore();
        });

        it('PUT injects _method spoof and submits', () => {
            const wrapper = html`<form action="/widgets/1"></form>`;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance());
            form.submit = vi.fn();
            TaskExecutor.execute(form, { mode: 'sync', verb: 'PUT', endpoint: '' });
            const spoof = form.querySelector('input[name="_method"]');
            expect(spoof).not.toBeNull();
            expect(spoof.value).toBe('PUT');
            expect(spoof.dataset.smartforms).toBe('1');
            expect(form.getAttribute('method')).toBe('POST');
            expect(form.submit).toHaveBeenCalledOnce();
        });

        it('POST submits without spoof method', () => {
            const wrapper = html`<form action="/widgets"></form>`;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance());
            form.submit = vi.fn();
            TaskExecutor.execute(form, { mode: 'sync', verb: 'POST', endpoint: '' });
            expect(form.querySelector('input[name="_method"]')).toBeNull();
            expect(form.submit).toHaveBeenCalledOnce();
        });

        it('honors the submitter button formaction over form action', () => {
            const wrapper = html`
                <form action="/default">
                    <button type="submit" formaction="/override"></button>
                </form>
            `;
            const form = wrapper.querySelector('form');
            const button = wrapper.querySelector('button');
            registerForm(form, fakeInstance());
            form.submit = vi.fn();
            TaskExecutor.execute(
                form,
                { mode: 'sync', verb: 'POST', endpoint: '' },
                { source: button },
            );
            expect(form.getAttribute('action')).toBe('/override');
        });

        it('substitutes {id} and {ids} tokens against instance', () => {
            const wrapper = html`<form><a href="/items/{id}/edit?ids={ids}"></a></form>`;
            const form = wrapper.querySelector('form');
            const link = wrapper.querySelector('a');
            registerForm(form, fakeInstance({ id: 7, ids: ['a', 'b'] }));
            form.submit = vi.fn();
            TaskExecutor.execute(
                form,
                { mode: 'sync', verb: 'POST', endpoint: '' },
                { source: link },
            );
            expect(form.getAttribute('action')).toBe('/items/7/edit?ids=a,b');
        });

        it('refreshes a previously injected SmartForms _method input', () => {
            const wrapper = html`
                <form action="/x">
                    <input type="hidden" name="_method" value="DELETE" data-smartforms="1" />
                </form>
            `;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance());
            form.submit = vi.fn();
            TaskExecutor.execute(form, { mode: 'sync', verb: 'PUT', endpoint: '' });
            const spoof = form.querySelector('input[name="_method"]');
            expect(spoof.value).toBe('PUT');
        });

        it('leaves a Laravel-rendered _method input untouched', () => {
            const wrapper = html`
                <form action="/x">
                    <input type="hidden" name="_method" value="PATCH" />
                </form>
            `;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance());
            form.submit = vi.fn();
            TaskExecutor.execute(form, { mode: 'sync', verb: 'PUT', endpoint: '' });
            const spoof = form.querySelector('input[name="_method"]');
            expect(spoof.value).toBe('PATCH');
        });
    });

    describe('async mode', () => {
        it('POSTs JSON body and dispatches taskCompleted on success', async () => {
            const wrapper = html`
                <form action="/x">
                    <input name="title" value="Hello" />
                    <input name="tags[]" value="a" />
                    <input name="tags[]" value="b" />
                </form>
            `;
            const form = wrapper.querySelector('form');
            const instance = fakeInstance();
            registerForm(form, instance);

            const completed = captureEvent(form, 'taskCompleted');
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                text: async () => 'ok',
            });

            TaskExecutor.execute(form, { mode: 'async', verb: 'POST', endpoint: '/widgets' });
            await new Promise((r) => setTimeout(r, 0));

            expect(globalThis.fetch).toHaveBeenCalledOnce();
            const [url, init] = globalThis.fetch.mock.calls[0];
            expect(url).toBe('/widgets');
            expect(init.method).toBe('POST');
            expect(init.headers['Content-Type']).toBe('application/json');
            const body = JSON.parse(init.body);
            expect(body.title).toBe('Hello');
            expect(body.tags).toEqual(['a', 'b']);

            expect(completed.length).toBe(1);
            expect(instance.rebaseline).toHaveBeenCalledOnce();
        });

        it('appends id for PUT and fills tokens', async () => {
            const wrapper = html`<form><input name="x" value="1" /></form>`;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance({ id: 42 }));
            globalThis.fetch = vi
                .fn()
                .mockResolvedValue({ ok: true, status: 200, text: async () => '' });

            TaskExecutor.execute(form, { mode: 'async', verb: 'PUT', endpoint: '/{resource}' });
            await new Promise((r) => setTimeout(r, 0));

            expect(globalThis.fetch.mock.calls[0][0]).toBe('/widgets/42');
        });

        it('uses FormData when a file is present', async () => {
            const wrapper = html`
                <form>
                    <input name="title" value="Hi" />
                    <input type="file" name="upload" />
                </form>
            `;
            const form = wrapper.querySelector('form');
            const fileInput = wrapper.querySelector('input[type=file]');
            const fakeFile = new File(['data'], 'a.txt', { type: 'text/plain' });
            Object.defineProperty(fileInput, 'files', { value: [fakeFile] });
            registerForm(form, fakeInstance());

            globalThis.fetch = vi
                .fn()
                .mockResolvedValue({ ok: true, status: 200, text: async () => '' });
            TaskExecutor.execute(form, { mode: 'async', verb: 'POST', endpoint: '/widgets' });
            await new Promise((r) => setTimeout(r, 0));

            const init = globalThis.fetch.mock.calls[0][1];
            expect(init.body).toBeInstanceOf(FormData);
            expect(init.headers['Content-Type']).toBeUndefined();
        });

        it('omits unchecked checkboxes and blanks empty file inputs in the JSON body', async () => {
            const wrapper = html`
                <form>
                    <input name="title" value="Hi" />
                    <input type="checkbox" name="agree" value="yes" />
                    <input type="file" name="doc" />
                </form>
            `;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance());
            globalThis.fetch = vi
                .fn()
                .mockResolvedValue({ ok: true, status: 200, text: async () => '' });

            TaskExecutor.execute(form, { mode: 'async', verb: 'POST', endpoint: '/widgets' });
            await new Promise((r) => setTimeout(r, 0));

            const init = globalThis.fetch.mock.calls[0][1];
            expect(init.headers['Content-Type']).toBe('application/json');
            const body = JSON.parse(init.body);
            expect(body.title).toBe('Hi');
            expect(body.agree).toBeUndefined();
            expect(body.doc).toBe('');
        });

        it('keeps checked checkboxes and drops unchecked ones in the FormData body', async () => {
            const wrapper = html`
                <form>
                    <input name="title" value="Hi" />
                    <input type="checkbox" name="agree" value="yes" checked />
                    <input type="checkbox" name="news" value="no" />
                    <input type="file" name="upload" />
                </form>
            `;
            const form = wrapper.querySelector('form');
            const fileInput = wrapper.querySelector('input[type=file]');
            const fakeFile = new File(['data'], 'a.txt', { type: 'text/plain' });
            Object.defineProperty(fileInput, 'files', { value: [fakeFile] });
            registerForm(form, fakeInstance());
            globalThis.fetch = vi
                .fn()
                .mockResolvedValue({ ok: true, status: 200, text: async () => '' });

            TaskExecutor.execute(form, { mode: 'async', verb: 'POST', endpoint: '/widgets' });
            await new Promise((r) => setTimeout(r, 0));

            const init = globalThis.fetch.mock.calls[0][1];
            expect(init.body).toBeInstanceOf(FormData);
            expect(init.body.get('agree')).toBe('yes');
            expect(init.body.get('news')).toBeNull();
            expect(init.body.get('upload')).toBeInstanceOf(File);
        });

        it('dispatches taskFailed on non-ok response and reverts state', async () => {
            const wrapper = html`<form><input name="x" value="1" /></form>`;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance({ state: 'changed' }));

            const failed = captureEvent(form, 'taskFailed');
            const stateChanges = [];
            form.addEventListener('formStateChange', (e) => stateChanges.push(e.detail.state));

            globalThis.fetch = vi
                .fn()
                .mockResolvedValue({ ok: false, status: 422, text: async () => 'bad' });

            TaskExecutor.execute(form, { mode: 'async', verb: 'POST', endpoint: '/x' });
            await new Promise((r) => setTimeout(r, 0));

            expect(failed.length).toBe(1);
            expect(failed[0].detail.status).toBe(422);
            expect(stateChanges).toContain('submitted');
            expect(stateChanges[stateChanges.length - 1]).toBe('changed');
        });

        it('dispatches taskFailed on network error', async () => {
            const wrapper = html`<form><input name="x" value="1" /></form>`;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance());

            const failed = captureEvent(form, 'taskFailed');
            globalThis.fetch = vi.fn().mockRejectedValue(new Error('boom'));

            TaskExecutor.execute(form, { mode: 'async', verb: 'POST', endpoint: '/x' });
            await new Promise((r) => setTimeout(r, 0));

            expect(failed.length).toBe(1);
            expect(failed[0].detail.error).toBeInstanceOf(Error);
            expect(failed[0].detail.status).toBe(0);
        });

        it('attaches CSRF header when configured', async () => {
            Tasks.configure({ csrf: { value: 'tok' } });
            const wrapper = html`<form><input name="x" value="1" /></form>`;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance());
            globalThis.fetch = vi
                .fn()
                .mockResolvedValue({ ok: true, status: 200, text: async () => '' });

            TaskExecutor.execute(form, { mode: 'async', verb: 'POST', endpoint: '/x' });
            await new Promise((r) => setTimeout(r, 0));

            expect(globalThis.fetch.mock.calls[0][1].headers['X-CSRF-TOKEN']).toBe('tok');
        });

        it('accepts a string descriptor and parses it', async () => {
            const wrapper = html`<form></form>`;
            const form = wrapper.querySelector('form');
            registerForm(form, fakeInstance({ id: 5 }));
            globalThis.fetch = vi
                .fn()
                .mockResolvedValue({ ok: true, status: 200, text: async () => '' });

            TaskExecutor.execute(form, 'async:get:/{resource}/{id}');
            await new Promise((r) => setTimeout(r, 0));

            expect(globalThis.fetch.mock.calls[0][0]).toBe('/widgets/5');
        });
    });
});
