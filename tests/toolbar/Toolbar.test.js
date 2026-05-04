import { describe, it, expect, beforeEach } from 'vitest';
import Toolbar from '../../src/toolbar/Toolbar.js';
import State from '../../src/constants/State.js';
import Roles from '../../src/constants/Roles.js';
import { html, clearDom, captureEvent } from '../_helpers/dom.js';

function makeFixture() {
    const wrapper = html`
        <div>
            <form id="f"></form>
            <nav class="toolbar">
                <ul>
                    <li><a href="#" data-role="${Roles.UPDATE}" data-task="save">save</a></li>
                    <li><a href="#" data-role="${Roles.CANCEL}" data-task="cancel">cancel</a></li>
                </ul>
            </nav>
        </div>
    `;
    return {
        nav: wrapper.querySelector('nav'),
        form: wrapper.querySelector('form'),
    };
}

describe('Toolbar', () => {
    beforeEach(() => clearDom());

    it('starts in NORMAL and exposes its element', () => {
        const { nav, form } = makeFixture();
        const t = new Toolbar(nav, form);
        expect(t.state()).toBe(State.NORMAL);
        expect(t.element()).toBe(nav);
    });

    it('reacts to formStateChange event by updating state', () => {
        const { nav, form } = makeFixture();
        const t = new Toolbar(nav, form);
        form.dispatchEvent(
            new CustomEvent('formStateChange', {
                detail: { state: State.CHANGED },
            }),
        );
        expect(t.state()).toBe(State.CHANGED);
    });

    it('switches to SUBMITTED on form submit', () => {
        const { nav, form } = makeFixture();
        const t = new Toolbar(nav, form);
        form.dispatchEvent(new Event('submit'));
        expect(t.state()).toBe(State.SUBMITTED);
    });

    it('re-emits taskExecuted when a child Button raises taskRequest', () => {
        const { nav, form } = makeFixture();
        new Toolbar(nav, form);
        const events = captureEvent(nav, 'taskExecuted');

        // Activate the button first by transitioning to CHANGED so click is allowed.
        form.dispatchEvent(
            new CustomEvent('formStateChange', {
                detail: { state: State.CHANGED },
            }),
        );

        const saveAnchor = nav.querySelector('a[data-role="update"]');
        saveAnchor.click();

        expect(events.length).toBe(1);
        expect(events[0].detail.task).toBe('save');
    });
});
