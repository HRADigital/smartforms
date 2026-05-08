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
        if (this._step !== null && parseFloat(this._value) % parseFloat(this._step) > 0) {
            return false;
        }

        return true;
    }
}

export default NumberInput;
