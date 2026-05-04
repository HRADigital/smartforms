import { describe, it, expect, beforeEach, vi } from 'vitest';
import AdminForm from '../../src/toolbar/AdminForm.js';
import Toolbar from '../../src/toolbar/Toolbar.js';
import { html, clearDom } from '../_helpers/dom.js';

function makeFixture() {
    const wrapper = html`
        <div>
            <form id="f">
                <input type="hidden" name="task" />
            </form>
            <nav class="toolbar">
                <ul>
                    <li><a href="#" data-role="update" data-task="Save">save</a></li>
                </ul>
            </nav>
        </div>
    `;
    return {
        form: wrapper.querySelector('form'),
        nav:  wrapper.querySelector('nav'),
    };
}

describe('AdminForm', () => {
    beforeEach(() => clearDom());

    it('writes the task and dispatches submit when a taskExecuted event fires', () => {
        const { form, nav } = makeFixture();
        const toolbar = new Toolbar(nav, form);
        const af = new AdminForm(form, toolbar);
        expect(af).toBeDefined();

        form.submit = vi.fn();

        nav.dispatchEvent(new CustomEvent('taskExecuted', {
            detail: { task: ' SAVE ' },
        }));

        expect(form.task.value).toBe('save');
        expect(form.submit).toHaveBeenCalledOnce();
    });

    it('does not throw when toolbar is null', () => {
        const { form } = makeFixture();
        expect(() => new AdminForm(form, null)).not.toThrow();
    });
});
