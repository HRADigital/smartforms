/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import State from '../../constants/State.js';
import { log } from '../../logger.js';

/**
 * Form Dynamic Table Input handling class.
 *
 * @package   SmartForms\Assets
 */
class DynamicTableInput {
    /**
     * Initializes the Dynamic Table instance.
     *
     * @param {object} table
     * @param {State}  state
     */
    constructor(table, state) {
        // Collects supplied parameters.
        this._state = state;
        this._table = table;
        this._fieldset = table.parentNode.querySelector('fieldset');
        this._input = this._fieldset.querySelector('select');
        this._name = this._table.querySelector('tbody input[type="hidden"]').name;

        this._required = this._fieldset.getAttribute('required') !== null;
        this._recommended = this._fieldset.getAttribute('recommended') !== null;

        // Loads value's state.
        this._initial = [];
        this._values = [];
        this.loadInitialValues();

        // Sets table changed event.
        this._table
            .querySelector('tbody')
            .addEventListener('DOMSubtreeModified', () => this.onDomChanged());
    }

    /**
     * Returns the name of the BaseInput.
     *
     * @return {string}
     */
    name() {
        return this._name;
    }

    /**
     * Validates if the input has changed its value since start.
     *
     * @return {boolean}
     */
    hasChanged() {
        // First, we'll just validate the lengths of both state arrays.
        if (this._values.length !== this._initial.length) {
            return true;
        }

        // If they're still the same, we'll check each of the values inthe arrays.
        for (let i = 0; i < this._initial.length; i++) {
            if (this._initial[i] !== this._values[i]) {
                return true;
            }
        }

        // If we reached this far, both arrays are the same.
        return false;
    }

    /**
     * Returns illegality for the Webcontrol.
     *
     * @returns {boolean}
     */
    isIllegal() {
        return this._required && this._values.length === 0;
    }

    /**
     * Returns TRUE of field is Required. FALSE otherwise.
     *
     * @return {boolean}
     */
    isRequired() {
        return this._required;
    }

    /**
     * Returns TRUE of field is Recommended. FALSE otherwise.
     *
     * @return {boolean}
     */
    isRecommended() {
        return this._recommended;
    }

    /**
     * Loads value's initial state.
     */
    loadInitialValues() {
        this.loadCurrentValues();

        this._initial = this._values.slice(0);
        this.editStatusStyles();
    }

    /**
     * Loads Dynamic Table's current values.
     */
    loadCurrentValues() {
        // Gathers all the rows in the dynamic table.
        const rows = this._table.querySelectorAll(
            'tbody tr:not(.smartdynamicrow) input[type="hidden"]:first-of-type',
        );

        // Loads theirs values into the current value array.
        this._values = [];
        rows.forEach((row) => {
            this._values.push(row.value);
        });

        // Sorts the value array.
        this._values.sort();
    }

    /**
     * Edits the Webcontrol's Status styling.
     */
    editStatusStyles() {
        if (this.isIllegal()) {
            this._fieldset.classList.remove('changed');
            this._fieldset.classList.add('invalid');
        } else if (this.hasChanged()) {
            this._fieldset.classList.remove('invalid');
            this._fieldset.classList.add('changed');
        } else {
            this._fieldset.classList.remove('invalid');
            this._fieldset.classList.remove('changed');
        }
    }

    /**
     * Event handler for when the table's DOM has changed.
     */
    onDomChanged() {
        // Loads current table's values.
        this.loadCurrentValues();
        this.editStatusStyles();

        // Process the Webcontrol's state.
        let state = State.NORMAL;
        if (this.hasChanged()) {
            state = State.CHANGED;
        }

        // If the state has changed, and a callback is set, we'll call it.
        if (state !== this._state) {
            this._state = state;
            this.triggerEvent(state);
        }
    }

    /**
     * Triggers a State change event.
     *
     * @param {State} state
     */
    triggerEvent(state) {
        // Configures Custom Event for State change.
        const event = new CustomEvent('stateChange', {
            bubbles: false,
            cancelable: false,
            detail: {
                state: state,
                instance: this,
            },
        });

        // Triggers Custom Event.
        log('[SmartForms] input stateChange (table)', {
            name: this.name?.() ?? null,
            state,
            instance: this,
        });
        this._table.dispatchEvent(event);
        this._fieldset.dispatchEvent(event);
    }
}

export default DynamicTableInput;
