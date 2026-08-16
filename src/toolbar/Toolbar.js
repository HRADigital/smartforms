/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import Button from './Button.js';
import State from '../constants/State.js';
import Tasks from '../constants/Tasks.js';
import { log, warn } from '../logger.js';

/**
 * Main form's Toolbar handling class.
 *
 * @package   SmartForms\Assets
 */
class Toolbar {
    /**
     * Initializes the Toolbar's instance.
     *
     * Collects all Toolbar's buttons, and configures them.
     *
     * @param {object}  element - Toolbar's DOM NAV element.
     * @param {object}  form    - Main Form's DOM element.
     */
    constructor(element, form) {
        // Sets initial attribute's values.
        this._nav = element;
        this._form = form;
        this._buttons = [];
        this._state = State.NORMAL;

        // Loads all Toolbar's buttons.
        this._nav.querySelectorAll('[data-role]').forEach((button) => {
            // Configures the Button's Task Request event handler.
            button.addEventListener('taskRequest', (e) => this.onTaskRequest(e));

            // Adds Button to list.
            this._buttons.push(new Button(button));
        });

        // Declares state change listner.
        this._form.addEventListener('formStateChange', (e) => this.onFormStateChange(e), false);
        this._form.addEventListener('submit', () => this.onSubmit(), false);

        // Applies the initial state to all buttons so server-rendered markup
        // doesn't leak through (e.g. CANCEL active before any change).
        this.setState(this._state);
    }

    /**
     * Returns the Toolbar's State.
     *
     * @returns {State}
     */
    state() {
        return this._state;
    }

    /**
     * Returns the Toolbar's DOM element.
     *
     * @returns {object}
     */
    element() {
        return this._nav;
    }

    /**
     * Sets the Toolbar to a new State.
     *
     * @param {State} state - New State value to be set on the Toolbar.
     */
    setState(state) {
        log('[SmartForms] toolbar setState', {
            from: this._state,
            to: state,
            buttons: this._buttons.length,
        });

        // Propagates the supplied State to all buttons.
        this._buttons.forEach((button) => {
            button.setState(state);
        });

        // Logs the state change.
        if (this._state !== state) {
            this._previous = this._state;
            this._state = state;
        }
    }

    /**
     * Event handler for when the main Form's State has changed.
     *
     * @param {Event} e - State Change Event.
     */
    onFormStateChange(e) {
        this.setState(e.detail.state);
    }

    /**
     * Event handler for when the main Form has been submitted.
     * Should set the Toolbar's State to ILLEGAL (disables all buttons).
     */
    onSubmit() {
        this.setState(State.SUBMITTED);
    }

    /**
     * Event handler for when a Button's task is requested.
     *
     * @param {Event} e - Task request event.
     */
    onTaskRequest(e) {
        const { role, dataTaskAttr, button } = e.detail;
        const descriptor = Tasks.resolve(role, dataTaskAttr);
        if (!descriptor) {
            warn(`[SmartForms] no Task resolved for role "${role}"`);
            return;
        }
        const event = new CustomEvent('taskExecuted', {
            bubbles: true,
            cancelable: false,
            detail: { descriptor, button, toolbar: this },
        });
        log('[SmartForms] toolbar taskExecuted', { role, dataTaskAttr, descriptor });
        this._nav.dispatchEvent(event);
    }
}

export default Toolbar;
