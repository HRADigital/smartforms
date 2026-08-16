/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import Roles from './Roles.js';

const VERBS = ['get', 'post', 'put', 'patch', 'delete'];
const MODES = ['sync', 'async'];

const VERB_DEFAULT_MODE = Object.freeze({
    GET: 'sync',
    POST: 'sync',
    PUT: 'sync',
    PATCH: 'async',
    DELETE: 'sync',
});

const DEFAULT_TASKS = Object.freeze({
    STORE: 'post:/{resource}',
    EDIT: 'get:/{resource}/{id}/edit',
    UPDATE: 'put:/{resource}/{id}',
    UPDATE_MANY: 'put:/{resource}?ids={ids}',
    DESTROY: 'delete:/{resource}/{id}',
    DESTROY_MANY: 'delete:/{resource}?ids={ids}',
    TOGGLE: 'patch:/{resource}/{id}',
});

const DEFAULT_ROLE_MAP = Object.freeze({
    [Roles.CREATE]: DEFAULT_TASKS.STORE,
    [Roles.EDIT]: DEFAULT_TASKS.EDIT,
    [Roles.UPDATE]: DEFAULT_TASKS.UPDATE,
    [Roles.UPDATEALL]: DEFAULT_TASKS.UPDATE_MANY,
    [Roles.DELETE]: DEFAULT_TASKS.DESTROY,
    [Roles.DELETEALL]: DEFAULT_TASKS.DESTROY_MANY,
    [Roles.DESTROY]: DEFAULT_TASKS.DESTROY,
    [Roles.BACK]: null,
    [Roles.TOGGLE]: DEFAULT_TASKS.TOGGLE,
    [Roles.CANCEL]: null,
});

const DEFAULT_CSRF = Object.freeze({
    metaName: 'csrf-token',
    headerName: 'X-CSRF-TOKEN',
    value: null,
});

const registry = {
    tasks: { ...DEFAULT_TASKS },
    roleMap: { ...DEFAULT_ROLE_MAP },
    csrf: { ...DEFAULT_CSRF },
};

function parse(taskString) {
    const safe = typeof taskString === 'string' ? taskString : '';
    const segments = safe.split(':');
    let mode = null;
    let verb = null;
    let endpoint = '';

    if (segments.length < 3) {
        // Fewer than 3 segments — classify each by content, not position.
        const urlParts = [];
        for (const seg of segments) {
            const lower = seg.toLowerCase();
            const upper = seg.toUpperCase();
            if (mode === null && MODES.includes(lower)) {
                mode = lower;
                continue;
            }
            if (verb === null && VERBS.includes(lower)) {
                verb = upper;
                continue;
            }
            urlParts.push(seg);
        }
        endpoint = urlParts.join(':');
    } else {
        // Positional form: mode:verb:endpoint (endpoint may itself contain `:`).
        if (MODES.includes(segments[0])) {
            mode = segments.shift();
        }
        if (segments.length > 0 && VERBS.includes(segments[0])) {
            verb = segments.shift().toUpperCase();
        }
        endpoint = segments.join(':');
    }

    if (verb === null) verb = 'GET';
    if (mode === null) mode = VERB_DEFAULT_MODE[verb] || 'sync';

    return { mode, verb, endpoint };
}

function fillTokens(endpoint, ctx) {
    return endpoint.replace(/\{(resource|id|ids)\}/g, (_, name) => {
        const v = ctx[name];
        if (v === undefined || v === null || v === '') {
            throw new Error(`[SmartForms] missing token "${name}" for endpoint "${endpoint}"`);
        }
        return String(v);
    });
}

function maybeAppendId(endpoint, verb, ctx) {
    const verbsWithIdAppend = ['PUT', 'PATCH', 'DELETE'];
    if (!verbsWithIdAppend.includes(verb)) return endpoint;
    if (endpoint.includes('{id}')) return endpoint;
    if (ctx.id === undefined || ctx.id === null || ctx.id === '') return endpoint;
    return `${endpoint.replace(/\/$/, '')}/${ctx.id}`;
}

function resolve(role, dataTaskAttr) {
    const fromAttr =
        typeof dataTaskAttr === 'string' && dataTaskAttr.length > 0 ? dataTaskAttr : null;
    const taskString = fromAttr ?? registry.roleMap[role];
    if (taskString === null || taskString === undefined) return null;
    return parse(taskString);
}

function configure({ tasks, roleMap, csrf } = {}) {
    if (tasks) registry.tasks = { ...registry.tasks, ...tasks };
    if (roleMap) registry.roleMap = { ...registry.roleMap, ...roleMap };
    if (csrf) registry.csrf = { ...registry.csrf, ...csrf };

    if (tasks) {
        for (const [role, taskKey] of Object.entries(registry.roleMap)) {
            if (typeof taskKey === 'string' && DEFAULT_TASKS[taskKey] !== undefined) {
                registry.roleMap[role] = registry.tasks[taskKey];
            }
        }
    }
}

function csrf() {
    const { metaName, headerName, value } = registry.csrf;

    let token = null;
    if (typeof value === 'function') {
        token = value();
    } else if (typeof value === 'string' && value.length > 0) {
        token = value;
    } else if (typeof document !== 'undefined') {
        const meta = document.querySelector(`meta[name="${metaName}"]`);
        token = meta ? meta.getAttribute('content') : null;
    }

    if (!token) return null;
    return { headerName, value: token };
}

const Tasks = {
    ...DEFAULT_TASKS,
    get roleMap() {
        return registry.roleMap;
    },
    parse,
    fillTokens,
    maybeAppendId,
    resolve,
    configure,
    csrf,
};

export default Tasks;
