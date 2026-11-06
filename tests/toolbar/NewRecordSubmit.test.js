import { describe, it, expect, beforeEach, vi } from 'vitest';
import { autoInit, getForm } from '../../src/index.js';
import { html, clearDom, fireKeyup } from '../_helpers/dom.js';

// A sign-in form: a POST-only route, and inputs with no value attribute.
function signInForm(dataTask) {
    const root = html`
        <form class="smartform" action="/login" method="post">
            <div class="smartformrecord">
                <fieldset required><input type="email" name="email" /></fieldset>
                <fieldset required><input type="password" name="password" /></fieldset>
            </div>
            <nav class="toolbar">
                <button type="submit" data-role="update" ${dataTask}>Sign in</button>
            </nav>
        </form>
    `;
    const form = root.querySelector('form');
    form.submit = vi.fn();
    autoInit(root);
    return form;
}

function fillAndClick(form) {
    fireKeyup(form.querySelector('[name=email]'), 'ada@example.com');
    fireKeyup(form.querySelector('[name=password]'), 'secret');
    form.querySelector('button').click();
}

describe('update button on a sign-in form', () => {
    beforeEach(() => clearDom());

    it('wires the form even though its inputs have no value attribute', () => {
        expect(getForm(signInForm(''))).not.toBeNull();
    });

    it('submits as a plain POST with data-task="post"', () => {
        const form = signInForm('data-task="post"');
        fillAndClick(form);
        expect(form.submit).toHaveBeenCalledOnce();
        expect(form.querySelector('input[name="_method"]')).toBeNull();
        expect(form.getAttribute('action')).toBe('/login');
    });

    it('keeps the documented PUT default when there is no data-task', () => {
        const form = signInForm('');
        fillAndClick(form);
        expect(form.querySelector('input[name="_method"]').value).toBe('PUT');
    });
});
