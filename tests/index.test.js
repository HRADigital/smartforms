import { describe, it, expect, beforeEach } from 'vitest';
import * as api from '../src/index.js';
import { html, clearDom } from './_helpers/dom.js';

describe('public API surface', () => {
    it('exports every documented class and constant', () => {
        const expected = [
            'SmartForm', 'SmartFormList', 'SmartFormRecord',
            'BaseInput', 'TextInput', 'NumberInput', 'UrlInput', 'ColorInput',
            'DateTimeInput', 'FileInput', 'TextAreaInput', 'CheckBoxInput',
            'RadioInput', 'SelectInput', 'DynamicTableInput',
            'Row',
            'Toolbar', 'Button', 'AdminForm',
            'State', 'Roles',
            'autoInit',
        ];
        for (const key of expected) {
            expect(api[key], `missing export: ${key}`).toBeDefined();
        }
    });
});

describe('autoInit', () => {
    beforeEach(() => clearDom());

    it('returns empty result when no smartform is in the DOM', () => {
        const { forms, admin } = api.autoInit();
        expect(forms).toEqual([]);
        expect(admin).toBeNull();
    });

    it('constructs SmartForm instances for each matching form', () => {
        html`
            <form class="smartform">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const { forms } = api.autoInit();
        expect(forms).toHaveLength(1);
        expect(forms[0]).toBeInstanceOf(api.SmartForm);
    });

    it('honors custom selectors', () => {
        html`
            <form class="custom-form">
                <div class="smartformrecord">
                    <fieldset><input type="text" name="x" value="hi" /></fieldset>
                </div>
            </form>
        `;
        const { forms } = api.autoInit({ formSelector: 'form.custom-form' });
        expect(forms).toHaveLength(1);
    });
});
