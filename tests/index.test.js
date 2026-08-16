import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as api from '../src/index.js';
import { html, clearDom } from './_helpers/dom.js';

describe('public API surface', () => {
    it('exports every documented class and constant', () => {
        const expected = [
            'SmartForm',
            'SmartFormList',
            'SmartFormRecord',
            'Toolbar',
            'Button',
            'AdminForm',
            'State',
            'Roles',
            'Tasks',
            'TaskExecutor',
            'autoInit',
            'registerForm',
            'getForm',
            'toggleDebug',
        ];
        for (const key of expected) {
            expect(api[key], `missing export: ${key}`).toBeDefined();
        }
    });

    it('default export mirrors named exports', () => {
        expect(api.default.SmartForm).toBe(api.SmartForm);
        expect(api.default.autoInit).toBe(api.autoInit);
    });
});

describe('autoInit', () => {
    beforeEach(() => clearDom());

    it('does not throw when no smartform is in the DOM', () => {
        expect(() => api.autoInit()).not.toThrow();
    });

    it('constructs SmartForm instances for each .smartform form and registers them', () => {
        const wrapper = html`
            <form class="smartform" data-resource="widgets">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        api.autoInit();
        const form = wrapper.querySelector('form');
        const instance = api.getForm(form);
        expect(instance).toBeInstanceOf(api.SmartForm);
    });

    it('constructs SmartFormList for .smartformlist forms', () => {
        const wrapper = html`
            <form class="smartformlist" data-resource="widgets">
                <table>
                    <thead>
                        <tr>
                            <th><input type="checkbox" name="checkall-toggle" /></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </form>
        `;
        api.autoInit();
        const form = wrapper.querySelector('form');
        const instance = api.getForm(form);
        expect(instance).toBeInstanceOf(api.SmartFormList);
    });

    it('wires a nav.toolbar found inside a form', () => {
        const wrapper = html`
            <form class="smartform" data-resource="widgets">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
                <nav class="toolbar">
                    <button type="button" data-role="update">Save</button>
                    <button type="button" data-role="cancel">Cancel</button>
                </nav>
            </form>
        `;
        api.autoInit();
        // On the initial NORMAL state the Toolbar deactivates update/cancel.
        const update = wrapper.querySelector('[data-role="update"]');
        expect(update.hasAttribute('disabled')).toBe(true);
        expect(update.classList.contains('disabled')).toBe(true);
    });

    it('wires data-track-form elements to mirror form state', () => {
        const wrapper = html`
            <div>
                <form class="smartform" id="trackme" data-resource="widgets">
                    <div class="smartformrecord">
                        <fieldset><input type="text" name="x" value="hi" /></fieldset>
                    </div>
                </form>
                <a data-track-form="trackme" href="#">tracker</a>
            </div>
        `;
        api.autoInit();
        const tracker = wrapper.querySelector('a');
        // NORMAL state on init → not disabled
        expect(tracker.classList.contains('disabled')).toBe(false);
        expect(tracker.getAttribute('aria-disabled')).toBe('false');

        const form = wrapper.querySelector('form');
        form.dispatchEvent(
            new CustomEvent('formStateChange', { detail: { state: api.State.CHANGED } }),
        );
        expect(tracker.classList.contains('disabled')).toBe(true);
        expect(tracker.getAttribute('aria-disabled')).toBe('true');
        expect(tracker.getAttribute('tabindex')).toBe('-1');
    });
});

describe('auto bootstrap', () => {
    beforeEach(() => clearDom());
    afterEach(() => {
        delete document.readyState;
        vi.resetModules();
    });

    it('defers the initial run until DOMContentLoaded while the document loads', async () => {
        Object.defineProperty(document, 'readyState', {
            configurable: true,
            get: () => 'loading',
        });

        const wrapper = html`
            <form class="smartform" data-resource="widgets">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const form = wrapper.querySelector('form');

        vi.resetModules();
        const reloaded = await import('../src/index.js');
        expect(reloaded.getForm(form)).toBeNull();

        document.dispatchEvent(new Event('DOMContentLoaded'));
        expect(reloaded.getForm(form)).toBeInstanceOf(reloaded.SmartForm);
    });
});

describe('form registry', () => {
    it('registerForm + getForm round-trip', () => {
        const form = document.createElement('form');
        const fake = { resource: () => 'x' };
        api.registerForm(form, fake);
        expect(api.getForm(form)).toBe(fake);
    });

    it('getForm returns null for unknown forms', () => {
        const form = document.createElement('form');
        expect(api.getForm(form)).toBeNull();
    });
});
