/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import State from '../../constants/State.js';
import BaseInput from './BaseInput.js';

/**
 * Form RadioInput Button handling class.
 *
 * @package   SmartForms\Assets
 */
class RadioInput extends BaseInput {
    /**
     * Initializes the RadioInput instance.
     *
     * @param {object} fieldset
     * @param {State}  state
     */
    constructor(fieldset, state) {
        // Calls parent class
        super(fieldset, state);

        // Loads all RadioInput buttons.
        this._buttons = fieldset.querySelectorAll('input');

        // Configures all child radio buttons in the FIeldset.
        this._buttons.forEach((input) => {
            // Collects the element's name.
            // Will be the same for all Checkboxes.
            this._name = input.getAttribute('name');

            // Sets up the control events.
            input.addEventListener('change', (e) => this.onChange(e));

            // Tries to load the initial value.
            if (input.checked) {
                this._initial = input.value;
            }
        });

        // Process the initial state.
        this.processChange(this._initial);
    }

    /**
     * Event handler for when the RadioInput changes value.
     *
     * @param {event} e
     */
    onChange(e) {
        if (e.target.checked) {
            this.processChange(e.target.value);
        }
    }

    /**
     * Processes the Input's state changed.
     */
    processState() {
        // Check current control's state.
        let state = State.NORMAL;
        if (this._value !== this._initial) {
            state = State.CHANGED;
        }

        // We'll need to trigger the State changing event.
        this.triggerEvent(state);
    }
}

export default RadioInput;
