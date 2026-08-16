/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import BaseInput from './BaseInput.js';

/**
 * Form File Input handling class.
 *
 * @package   SmartForms\Assets
 */
class FileInput extends BaseInput {
    /**
     * Initializes the FileInput instance.
     *
     * @param {object} fieldset
     * @param {State}  state
     */
    constructor(fieldset, state) {
        // Calls parent class
        super(fieldset, state);

        // Sets the initial state.
        this._input = fieldset.querySelector('input');
        this._name = this._input.getAttribute('name');
        this._value = this._input.getAttribute('value');
        this._initial = this._value;

        // Sets up the control events.
        this._input.addEventListener('change', (e) => this.onChange(e));
        this._input.addEventListener('keyup', (e) => this.onKey(e));

        // Process the initial state.
        this.processChange(this._value);
    }

    /**
     * Event handler for when the TextInput changes value (onBlur).
     *
     * @param {event} e
     */
    onChange(e) {
        this.processChange(e.target.value);
    }

    /**
     * Event handler for when the TextInput changes value, while editing it.
     *
     * @param {event} e
     */
    onKey(e) {
        this.processChange(e.target.value);
    }

    /**
     * Validates if the input has changed its value since start.
     *
     * @return {boolean}
     */
    hasChanged() {
        return this._value !== null;
    }

    /**
     * Validates if the input is currently holding an illegal value.
     *
     * @return {boolean}
     */
    isIllegal() {
        return !this._input.checkValidity();
    }
}

export default FileInput;
