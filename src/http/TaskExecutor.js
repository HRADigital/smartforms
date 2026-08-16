/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import Tasks from '../constants/Tasks.js';
import State from '../constants/State.js';
import { getForm } from '../index.js';

function triggerFormStateChange(form, state) {
    form.dispatchEvent(
        new CustomEvent('formStateChange', {
            bubbles: true,
            cancelable: true,
            detail: { state },
        }),
    );
}

function dispatchOnForm(form, name, detail) {
    form.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable: true, detail }));
}

function ensureMethodInput(form, verb) {
    // Respect a `_method` field already rendered by Laravel (e.g. via
    // `@method('PUT')`) — leave its value untouched. For inputs SmartForms
    // injected itself, refresh the value on every call so a previous click
    // (e.g. DELETE) can't poison a later one (e.g. PUT).
    const existing = form.querySelector('input[name="_method"]');
    if (existing) {
        if (existing.dataset.smartforms === '1') {
            existing.value = verb.toUpperCase();
        }
        return existing;
    }
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = '_method';
    input.value = verb.toUpperCase();
    input.dataset.smartforms = '1';
    form.appendChild(input);
    return input;
}

function serializeForm(form) {
    const out = {};
    const fields = form.querySelectorAll('[name]');
    fields.forEach((el) => {
        const name = el.getAttribute('name');
        if (!name) return;
        if (el.type === 'checkbox' || el.type === 'radio') {
            if (!el.checked) return;
        }
        if (el.type === 'file') {
            out[name] = '';
            return;
        }
        if (name.endsWith('[]')) {
            const key = name.slice(0, -2);
            if (!Array.isArray(out[key])) out[key] = [];
            out[key].push(el.value);
            return;
        }
        out[name] = el.value;
    });
    return out;
}

function buildFormData(form) {
    const fd = new FormData();
    const fields = form.querySelectorAll('[name]');
    fields.forEach((el) => {
        const name = el.getAttribute('name');
        if (!name) return;
        if (el.type === 'checkbox' || el.type === 'radio') {
            if (!el.checked) return;
            fd.append(name, el.value);
            return;
        }
        if (el.type === 'file') {
            const files = el.files || [];
            for (const f of files) fd.append(name, f);
            return;
        }
        fd.append(name, el.value);
    });
    return fd;
}

function hasNonEmptyFile(form) {
    const inputs = form.querySelectorAll('input[type="file"]');
    for (const el of inputs) {
        if (el.files && el.files.length > 0) return true;
    }
    return false;
}

function attachCsrfHeader(headers) {
    const c = Tasks.csrf();
    if (c) headers[c.headerName] = c.value;
    return headers;
}

function resolveSyncTarget(form, source, instance) {
    // The form's `action` is the default; a submitter button's `formaction`
    // overrides it (mirrors native HTML).
    let target = form.getAttribute('action') || '';
    if (source && source instanceof HTMLElement) {
        if (source.hasAttribute('formaction')) {
            target = source.getAttribute('formaction') || '';
        } else if (source.tagName === 'A' && source.hasAttribute('href')) {
            target = source.getAttribute('href') || '';
        }
    }
    // Substitute `{id}` and `{ids}` tokens from the form instance, if available.
    if (target && instance) {
        target = target.replace(/\{id\}/g, () => {
            const id = typeof instance.id === 'function' ? instance.id() : null;
            return id !== null && id !== undefined && id !== ''
                ? encodeURIComponent(String(id))
                : '';
        });
        target = target.replace(/\{ids\}/g, () => {
            const ids = typeof instance.selectedIds === 'function' ? instance.selectedIds() : [];
            return ids.map((v) => encodeURIComponent(String(v))).join(',');
        });
    }
    return target;
}

function syncSubmit(form, verb, source, instance) {
    const target = resolveSyncTarget(form, source, instance);

    // sync + GET is a navigation, not a form post.
    if (verb === 'GET') {
        window.location.assign(target);
        return;
    }

    // sync + POST/PUT/PATCH/DELETE → native form submit. Override action,
    // adjust method and inject Laravel's `_method` spoof when needed.
    form.setAttribute('action', target);
    const spoofed = ['PUT', 'PATCH', 'DELETE'];
    if (spoofed.includes(verb)) {
        ensureMethodInput(form, verb);
        form.setAttribute('method', 'POST');
    } else {
        form.setAttribute('method', 'POST');
    }
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.submit();
}

async function asyncFetch(form, url, verb, descriptor, instance) {
    const capturedState =
        instance && typeof instance.state === 'function' ? instance.state() : null;
    triggerFormStateChange(form, State.SUBMITTED);

    const headers = attachCsrfHeader({});
    const init = { method: verb, credentials: 'same-origin', headers };

    if (verb === 'POST' || verb === 'PUT') {
        if (hasNonEmptyFile(form)) {
            init.body = buildFormData(form);
        } else {
            headers['Content-Type'] = 'application/json';
            init.body = JSON.stringify(serializeForm(form));
        }
    }

    let response = null;
    let body = null;
    let status = 0;

    try {
        response = await fetch(url, init);
        status = response.status;
        body = await response.text();
    } catch (err) {
        dispatchOnForm(form, 'taskFailed', {
            descriptor,
            status: 0,
            response: null,
            body: null,
            error: err,
        });
        if (capturedState !== null) triggerFormStateChange(form, capturedState);
        return;
    }

    if (response.ok) {
        dispatchOnForm(form, 'taskCompleted', { descriptor, status, response, body });
        if (instance && typeof instance.rebaseline === 'function') instance.rebaseline();
        return;
    }

    dispatchOnForm(form, 'taskFailed', { descriptor, status, response, body, error: null });
    if (capturedState !== null) triggerFormStateChange(form, capturedState);
}

function execute(form, descriptor, options = {}) {
    const instance = getForm(form);
    if (!instance) {
        throw new Error(
            '[SmartForms] form not registered; call registerForm(form, instance) first',
        );
    }

    const parsed = typeof descriptor === 'string' ? Tasks.parse(descriptor) : descriptor;
    const { mode, verb, endpoint } = parsed;

    if (mode === 'sync') {
        // Native form submit. Endpoint is intentionally ignored — only the verb
        // is honored (to drive Laravel `_method` spoofing). The form posts to
        // its server-rendered `action`, unless the originating submitter button
        // declares a `formaction` (which natively overrides the form action).
        syncSubmit(form, verb, options.source || null, instance);
        return;
    }

    const ctx = {
        resource: instance.resource(),
        id: instance.id(),
        ids: (instance.selectedIds() || []).join(','),
    };

    const extended = Tasks.maybeAppendId(endpoint, verb, ctx);
    const url = Tasks.fillTokens(extended, ctx);

    asyncFetch(form, url, verb, parsed, instance);
}

const TaskExecutor = { execute };

export default TaskExecutor;
export { execute };
