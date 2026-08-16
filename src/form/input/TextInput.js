/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import BaseInput from './BaseInput.js';

/**
 * Form Text Input handling class.
 *
 * @package   SmartForms\Assets
 */
class TextInput extends BaseInput {
    /**
     * Initializes the TextInput instance.
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
        this._rule = this._input.getAttribute('data-rule');
        this._value = this._input.getAttribute('value');
        this._limit = this._input.getAttribute('data-limit');
        const showGuide = this._input.getAttribute('data-guide');
        this._guide = null;
        this._initial = this._value;

        // Loads and configures character limit processing.
        this.loadLimit(this._input);
        this.loadGuide(showGuide !== null);

        // Fixes the validation rule, if present in the control.
        if (this._rule !== null) {
            this._rule = new RegExp(this._rule);
        }

        // Sets up the control events.
        this._input.addEventListener('change', (e) => this.onChange(e));
        this._input.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Process the initial state.
        this.processChange(this._value);
    }

    /**
     * Loads the character limit configuration.
     *
     * @param {object} element
     */
    loadLimit(element) {
        if (this._limit) {
            this._limit = parseInt(this._limit);
            element.addEventListener('keypress', (e) => this.onKeyPress(e));
        }
    }

    /**
     * Loads the character limit guiding counter.
     *
     * @param {boolean} show
     */
    loadGuide(show) {
        // Checks if the character limit guide counter should be rendered.
        if (!show) {
            return;
        }

        // Loads the character guide to the webcontrol.
        const parent = document.createElement('SPAN');
        parent.className = 'smartguide';

        this._guide = document.createElement('SPAN');
        const cText = document.createTextNode(this._value.length);
        this._guide.appendChild(cText);

        const total = document.createElement('SPAN');
        const tText = document.createTextNode(this._limit);
        total.appendChild(tText);

        const space = document.createElement('SPAN');
        const sText = document.createTextNode('/');
        space.appendChild(sText);

        parent.appendChild(this._guide);
        parent.appendChild(space);
        parent.appendChild(total);

        this._input.parentNode.insertBefore(parent, this._input);
    }

    /**
     * Processes the character limit counter, after text has been introduced in the Textbox.
     *
     * @param {int} length
     */
    processGuide(length) {
        // Updates the character's counter.
        const textnode = document.createTextNode(length);
        this._guide.replaceChild(textnode, this._guide.childNodes[0]);

        // Validates if a warning should be processed, if the character limit is reaching the limit.
        if (length / this._limit > 0.9) {
            this._guide.className = 'warning';
        } else {
            this._guide.className = '';
        }
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
    onKeyUp(e) {
        const value = e.target.value;
        this.processChange(value);

        if (this._guide !== null) {
            this.processGuide(value.length);
        }
    }

    /**
     * Event handler for when the TextInput changes value, while editing it.
     *
     * @param {event} e
     */
    onKeyPress(e) {
        if (e.target.value.length >= this._limit) {
            e.preventDefault();
        }
    }

    /**
     * Validates if the input is currently holding an illegal value.
     *
     * @return {boolean}
     */
    isIllegal() {
        // If it's required and empty, we won't need to check anything else.
        if (this._required && this._value.trim().length === 0) {
            return true;
        }

        // If it passed so far, but there's no rule to validate against, we
        // can return the method's success straight away.
        if (this._rule === null) {
            return false;
        }

        // We'll check and return if the value respects the rule.
        return !this._rule.test(this._value);
    }
}

export default TextInput;
