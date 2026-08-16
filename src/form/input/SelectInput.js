/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import BaseInput from './BaseInput.js';

/**
 * Form Select Input handling class.
 *
 * @package   SmartForms\Assets
 */
class SelectInput extends BaseInput {
    /**
     * Initializes the SelectInput instance.
     *
     * @param {object} fieldset
     * @param {State}  state
     */
    constructor(fieldset, state) {
        // Calls parent class
        super(fieldset, state);

        // Loads the initial state.
        this._input = fieldset.querySelector('select');
        this._name = this._input.getAttribute('name');
        this._value = this._input.value;
        this._initial = this._value;

        // Sets up the control events.
        this._input.addEventListener('change', (e) => this.onChange(e));
        this.processChange(this._value);
    }

    /**
     * Event handler for when the SelectInput changes value.
     *
     * @param {event} e
     */
    onChange(e) {
        this.processChange(e.target.value);
    }
}

export default SelectInput;
