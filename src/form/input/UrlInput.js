import State     from '../../constants/State';
import TextInput from './TextInput';

/**
 * Form URL Input handling class.
 * 
 * @package   SmartForms\Assets
 */
class UrlInput extends TextInput {

    /**
     * Initializes the UrlInput instance.
     * @param {object} element 
     * @param {State}  state 
     */
    constructor(element, state) {

        // Calls parent class
        super(element, state);

        // Sets the initial state.
        this._rule  = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/);
        this._guide = null;

        // Process the initial state.
        this.processChange(this._value);
    }

    /**
     * Validates if the input is currently holding an illegal value.
     * @return {boolean}
     */
    isIllegal() {

        // If it's required and empty, we won't need to check anything else.
        if (this._value.trim().length === 0) {
            return this._required;
        }

        // If this is the first run, and the 'rule' hasn't been set yet,
        // we'll just return the web browser's validation success.
        if (this._rule === null && this._value.trim().length > 0) {
            return !this._input.checkValidity();
        }

        // We'll check and return if the value respects the rule, and that the web browser
        // has marked the webcontrol's value as valid.
        return (
            !this._input.checkValidity() ||
            !this._rule.test(this._value)
        );
    }
}

export default UrlInput;
