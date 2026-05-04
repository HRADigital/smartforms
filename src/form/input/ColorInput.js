import State     from '../../constants/State';
import BaseInput from './BaseInput';

/**
 * Form Color Input handling class.
 * 
 * @package   SmartForms\Assets
 */
class ColorInput extends BaseInput {

    /**
     * Initializes the ColorInput instance.
     * 
     * @param {object} fieldset 
     * @param {State}  state 
     */
    constructor(fieldset, state) {

        // Calls parent class
        super(fieldset, state);

        // Sets the initial state.
        this._input   = fieldset.querySelector('input');
        this._name    = this._input.getAttribute('name');
        this._value   = this._input.getAttribute('value');
        this._initial = this._value;

        // Sets up the control events.
        this._input.addEventListener("change", e => this.onChange(e));
        this._input.addEventListener("input", e => this.onInput(e));

        // Process the initial state.
        this.processChange(this._value);
    }

    /**
     * Event handler for when the ColorInput changes value (onBlur).
     * 
     * @param {event} e 
     */
    onChange(e) {
        this.processChange(e.target.value);
    }

    /**
     * Event handler for when the ColorInput changes value, while editing it.
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
        return (! this._input.checkValidity());
    }
}

export default ColorInput;
