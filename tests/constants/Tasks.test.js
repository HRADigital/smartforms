import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Tasks from '../../src/constants/Tasks.js';
import Roles from '../../src/constants/Roles.js';
import { clearDom } from '../_helpers/dom.js';

describe('Tasks.parse', () => {
    it('parses positional mode:verb:endpoint', () => {
        expect(Tasks.parse('async:put:/widgets/{id}')).toEqual({
            mode: 'async',
            verb: 'PUT',
            endpoint: '/widgets/{id}',
        });
    });

    it('keeps colons inside the endpoint', () => {
        expect(Tasks.parse('sync:get:/widgets/abc:def')).toEqual({
            mode: 'sync',
            verb: 'GET',
            endpoint: '/widgets/abc:def',
        });
    });

    it('classifies tokens by content with fewer than 3 segments', () => {
        expect(Tasks.parse('post:/widgets')).toEqual({
            mode: 'sync',
            verb: 'POST',
            endpoint: '/widgets',
        });
        expect(Tasks.parse('async:/widgets')).toMatchObject({
            mode: 'async',
            verb: 'GET',
            endpoint: '/widgets',
        });
    });

    it('defaults verb to GET and mode to verb default when missing', () => {
        expect(Tasks.parse('/widgets')).toEqual({
            mode: 'sync',
            verb: 'GET',
            endpoint: '/widgets',
        });
        expect(Tasks.parse('patch:/x')).toEqual({
            mode: 'async',
            verb: 'PATCH',
            endpoint: '/x',
        });
    });

    it('handles non-string input safely', () => {
        const r = Tasks.parse(null);
        expect(r.verb).toBe('GET');
        expect(r.mode).toBe('sync');
        expect(r.endpoint).toBe('');
    });
});

describe('Tasks.fillTokens', () => {
    it('substitutes {resource}, {id}, {ids}', () => {
        const out = Tasks.fillTokens('/{resource}/{id}?ids={ids}', {
            resource: 'w',
            id: 7,
            ids: '1,2',
        });
        expect(out).toBe('/w/7?ids=1,2');
    });

    it('throws when a required token is missing', () => {
        expect(() => Tasks.fillTokens('/{resource}/{id}', { resource: 'w', id: '' })).toThrow(
            /missing token/,
        );
        expect(() => Tasks.fillTokens('/{resource}', { resource: null })).toThrow(/missing token/);
    });
});

describe('Tasks.maybeAppendId', () => {
    it('appends id for PUT/PATCH/DELETE when endpoint has no {id}', () => {
        expect(Tasks.maybeAppendId('/widgets', 'PUT', { id: 5 })).toBe('/widgets/5');
        expect(Tasks.maybeAppendId('/widgets/', 'DELETE', { id: 5 })).toBe('/widgets/5');
    });

    it('skips append when endpoint already references {id}', () => {
        expect(Tasks.maybeAppendId('/widgets/{id}', 'PUT', { id: 5 })).toBe('/widgets/{id}');
    });

    it('skips append for verbs without id semantics', () => {
        expect(Tasks.maybeAppendId('/widgets', 'POST', { id: 5 })).toBe('/widgets');
        expect(Tasks.maybeAppendId('/widgets', 'GET', { id: 5 })).toBe('/widgets');
    });

    it('skips append when no id present', () => {
        expect(Tasks.maybeAppendId('/widgets', 'PUT', { id: '' })).toBe('/widgets');
        expect(Tasks.maybeAppendId('/widgets', 'PUT', {})).toBe('/widgets');
    });
});

describe('Tasks.resolve', () => {
    it('honors data-task attr when present', () => {
        const r = Tasks.resolve(Roles.UPDATE, 'async:get:/custom');
        expect(r).toEqual({ mode: 'async', verb: 'GET', endpoint: '/custom' });
    });

    it('falls back to roleMap', () => {
        const r = Tasks.resolve(Roles.UPDATE, '');
        expect(r).toBeTruthy();
        expect(r.verb).toBe('PUT');
    });

    it('returns null for roles mapped to null (CANCEL/BACK)', () => {
        expect(Tasks.resolve(Roles.CANCEL, '')).toBeNull();
        expect(Tasks.resolve(Roles.BACK, null)).toBeNull();
    });

    it('returns null for an unmapped role', () => {
        expect(Tasks.resolve('unknown-role', '')).toBeNull();
    });
});

describe('Tasks.roleMap', () => {
    it('exposes the current role to task mapping', () => {
        expect(Tasks.roleMap[Roles.UPDATE]).toBe('put:/{resource}/{id}');
        expect(Tasks.roleMap[Roles.CANCEL]).toBeNull();
    });
});

describe('Tasks.configure', () => {
    afterEach(() => {
        // Restore defaults so other tests don't get polluted.
        Tasks.configure({
            tasks: {
                STORE: 'post:/{resource}',
                EDIT: 'get:/{resource}/{id}/edit',
                UPDATE: 'put:/{resource}/{id}',
                UPDATE_MANY: 'put:/{resource}?ids={ids}',
                DESTROY: 'delete:/{resource}/{id}',
                DESTROY_MANY: 'delete:/{resource}?ids={ids}',
                TOGGLE: 'patch:/{resource}/{id}',
            },
            roleMap: {
                [Roles.CREATE]: 'post:/{resource}',
                [Roles.EDIT]: 'get:/{resource}/{id}/edit',
                [Roles.UPDATE]: 'put:/{resource}/{id}',
                [Roles.UPDATEALL]: 'put:/{resource}?ids={ids}',
                [Roles.DELETE]: 'delete:/{resource}/{id}',
                [Roles.DELETEALL]: 'delete:/{resource}?ids={ids}',
                [Roles.DESTROY]: 'delete:/{resource}/{id}',
                [Roles.BACK]: null,
                [Roles.TOGGLE]: 'patch:/{resource}/{id}',
                [Roles.CANCEL]: null,
            },
            csrf: { metaName: 'csrf-token', headerName: 'X-CSRF-TOKEN', value: null },
        });
    });

    it('overrides roleMap entries directly', () => {
        Tasks.configure({ roleMap: { [Roles.UPDATE]: 'async:get:/override' } });
        const r = Tasks.resolve(Roles.UPDATE, '');
        expect(r.endpoint).toBe('/override');
    });

    it('rebinds roleMap entries pointing to a renamed task key', () => {
        Tasks.configure({
            tasks: { UPDATE: 'put:/things/{id}' },
            roleMap: { [Roles.UPDATE]: 'UPDATE' },
        });
        const r = Tasks.resolve(Roles.UPDATE, '');
        expect(r.endpoint).toBe('/things/{id}');
    });
});

describe('Tasks.csrf', () => {
    beforeEach(() => clearDom());
    afterEach(() =>
        Tasks.configure({
            csrf: { metaName: 'csrf-token', headerName: 'X-CSRF-TOKEN', value: null },
        }),
    );

    it('returns null when no token is available', () => {
        expect(Tasks.csrf()).toBeNull();
    });

    it('reads token from meta tag by default', () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'csrf-token');
        meta.setAttribute('content', 'abc123');
        document.head.appendChild(meta);
        expect(Tasks.csrf()).toEqual({ headerName: 'X-CSRF-TOKEN', value: 'abc123' });
    });

    it('uses static value when configured', () => {
        Tasks.configure({ csrf: { value: 'literal-token' } });
        expect(Tasks.csrf()).toEqual({ headerName: 'X-CSRF-TOKEN', value: 'literal-token' });
    });

    it('uses function value when configured', () => {
        Tasks.configure({ csrf: { value: () => 'fn-token' } });
        expect(Tasks.csrf()).toEqual({ headerName: 'X-CSRF-TOKEN', value: 'fn-token' });
    });
});
