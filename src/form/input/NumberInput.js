/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import BaseInput from './BaseInput.js';

/**
 * Form Number Input handling class.
 *
 * @package   SmartForms\Assets
 */
class NumberInput extends BaseInput {
    /**
     * Initializes the NumberInput instance.
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
        this._max = this._input.getAttribute('max');
        this._min = this._input.getAttribute('min');
        this._step = this._input.getAttribute('step');
        this._initial = this._value;

        // Sets up the control events.
        this._input.addEventListener('change', (e) => this.onChange(e));
        this._input.addEventListener('keyup', (e) => this.onKey(e));
        this._input.addEventListener('oninput', (e) => this.onInput(e));
        this._input.addEventListener('click', (e) => this.onClick(e));

        // Process the initial state.
        this.processChange(this._value);
    }

    /**
     * Event handler for when the NumberInput changes value (onBlur).
     *
     * @param {event} e
     */
    onChange(e) {
        this.processChange(e.target.value);
    }

    /**
     * Event handler for when the NumberInput changes value, while editing it.
     *
     * @param {event} e
     */
    onKey(e) {
        this.processChange(e.target.value);
    }

    /**
     * Event handler for when the NumberInput is clicked on, while editing it.
     *
     * @param {event} e
     */
    onClick(e) {
        this.processChange(e.target.value);
    }

    /**
     * Event handler for when the NumberInput changes value, while editing it.
     *
     * @param {event} e
     */
    onInput(e) {
        this.processChange(e.target.value);
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

        return !this.validateScope() || !this._input.checkValidity();
    }

    /**
     * Validates the NumberBox's scope. Min, Max and Step values.
     *
     * @return {boolean}
     */
    validateScope() {
        // Validates the minimum, and maximum allowed values.
        if (
            (this._max !== null && parseFloat(this._max) < parseFloat(this._value)) ||
            (this._min !== null && parseFloat(this._min) > parseFloat(this._value))
        ) {
            return false;
        }

        // Checks the validation for the step.
        return this.validateStep();
    }

    /**
     * Validates the NumberBox's value against its step.
     *
     * Counts how many steps separate the value from the step base, and requires
     * that count to be a whole number. A plain `value % step` cannot be used
     * here: binary floating point cannot hold most decimal steps exactly, so a
     * legal value leaves a residue of a few units in the last place - 41.7015
     * against a step of 0.0000001 leaves ~4.8e-15, which reads as a violation.
     * The same residue also hid the reverse bug, since `%` carries the sign of
     * the dividend and a negative remainder never compared greater than zero,
     * so no negative value was ever checked at all.
     *
     * @return {boolean}
     */
    validateStep() {
        // A missing step, or the literal "any", places no constraint on the value.
        const step = parseFloat(this._step);
        if (this._step === null || !Number.isFinite(step) || step <= 0) {
            return true;
        }

        // A value that is not a number is not this check's to reject.
        const value = parseFloat(this._value);
        if (!Number.isFinite(value)) {
            return true;
        }

        // The step is measured from the minimum where one is declared, and from
        // zero otherwise, as the HTML step base is defined.
        const min = parseFloat(this._min);
        const base = Number.isFinite(min) ? min : 0;

        // The residue grows with the magnitude of the count, so the tolerance
        // has to grow with it too - a fixed epsilon fails on small steps.
        const steps = (value - base) / step;
        const tolerance = Math.max(1e-9, Math.abs(steps) * Number.EPSILON * 8);

        return Math.abs(steps - Math.round(steps)) <= tolerance;
    }
}

export default NumberInput;
