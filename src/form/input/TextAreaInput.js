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
        this._initial = this._value;

        // Sets up the control events.
        this._input.addEventListener('change', (e) => this.onChange(e));
        this._input.addEventListener('keyup', (e) => this.onKey(e));

        // Process the initial state.
        this.processChange(this._value);
    }

    /**
     * Event handler for when the SelectInput changes value.
     *
     * @param {event} e
     */
    onChange(e) {
        this.processChange(e.target.value.trim());
    }

    /**
     * Event handler for when the TextInput changes value, while editing it.
     *
     * @param {event} e
     */
    onKey(e) {
        this.processChange(e.target.value.trim());
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
