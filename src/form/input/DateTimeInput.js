import State from '../../constants/State';
import TextInput from './TextInput';

/**
 * Form DateTimeInput Input handling class.
 *
 * @package   SmartForms\Assets
 */
class DateTimeInput extends TextInput {
    /**
     * Initializes the DateTimeInput instance.
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
        this._guide = null;

        let pattern = this._input.getAttribute('pattern');
        this._rule = pattern ? new RegExp(pattern) : null;

        // Process the initial state.
        this.processChange(this._value);
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

        // If this is the first run, and the 'rule' hasn't been set yet,
        // we'll just return the web browser's validation success.
        if (this._rule === null) {
            return !this._input.checkValidity();
        }

        // We'll check and return if the value respects the rule, and that the web browser
        // has marked the webcontrol's value as valid.
        return this._input.validity.badInput || !this._rule.test(this._value);
    }
}

export default DateTimeInput;
