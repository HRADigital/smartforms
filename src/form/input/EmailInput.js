import TextInput from './TextInput.js';

/**
 * Form Email Input handling class.
 *
 * @package   SmartForms\Assets
 */
class EmailInput extends TextInput {
    /**
     * Validates if the input is currently holding an illegal value.
     *
     * @return {boolean}
     */
    isIllegal() {
        if (this._required && this._value.trim().length === 0) {
            return true;
        }

        if (
            this._value.trim().length > 0 &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this._value.trim())
        ) {
            return true;
        }

        return false;
    }
}

export default EmailInput;
