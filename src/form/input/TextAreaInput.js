/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import BaseInput from './BaseInput.js';

/**
 * Form Text Area handling class.
 *
 * @package   SmartForms\Assets
 */
class TextAreaInput extends BaseInput {
    /**
     * Initializes the TextAreaInput instance.
     *
     * @param {object} fieldset
     * @param {State}  state
     */
    constructor(fieldset, state) {
        // Calls parent class
        super(fieldset, state);

        // Loads the initial state.
        this._input = fieldset.querySelector('textarea');
        this._name = this._input.getAttribute('name');
        this._value = this._input.value.trim();
        this._limit = this._input.getAttribute('data-limit');
        const showGuide = this._input.getAttribute('data-guide');
        this._guide = null;
        this._initial = this._value;

        // Loads and configures character limit processing.
        this.loadLimit(this._input);
        this.loadGuide(showGuide !== null);

        // Sets up the control events.
        this._input.addEventListener('change', (e) => this.onChange(e));
        this._input.addEventListener('keyup', (e) => this.onKey(e));

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
        const cText = document.createTextNode(this._input.value.length);
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
     * Processes the character limit counter, after text has been introduced in the Textarea.
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
     * Event handler for when the TextAreaInput changes value (onBlur).
     *
     * @param {event} e
     */
    onChange(e) {
        this.processChange(e.target.value.trim());

        if (this._guide !== null) {
            this.processGuide(e.target.value.length);
        }
    }

    /**
     * Event handler for when the TextAreaInput changes value, while editing it.
     *
     * @param {event} e
     */
    onKey(e) {
        this.processChange(e.target.value.trim());

        if (this._guide !== null) {
            this.processGuide(e.target.value.length);
        }
    }

    /**
     * Event handler blocking input past the character limit.
     *
     * @param {event} e
     */
    onKeyPress(e) {
        if (e.target.value.length >= this._limit) {
            e.preventDefault();
        }
    }

    /**
     * Marks the webcontrol as illegal.
     */
    setStateIllegal() {
        this._fieldset.classList.remove('changed');
        this._fieldset.classList.add('invalid');

        this._illegal = true;
        this._changed = false;
    }

    /**
     * Marks the webcontrol as changed.
     */
    setStateChanged() {
        this._fieldset.classList.remove('invalid');
        this._fieldset.classList.add('changed');

        this._illegal = false;
        this._changed = true;
    }

    /**
     * Marks the webcontrol as normal.
     */
    setStateNormal() {
        this._fieldset.classList.remove('invalid');
        this._fieldset.classList.remove('changed');

        this._illegal = false;
        this._changed = false;
    }
}

export default TextAreaInput;
