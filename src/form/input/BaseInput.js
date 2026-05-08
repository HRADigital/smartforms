import State from '../../constants/State';
import { log } from '../../logger.js';

/**
 * Form Base Input handling class.
 *
 * @package   SmartForms\Assets
 */
class BaseInput {
    /**
     * Initializes the BaseInput instance.
     *
     * @param {object} fieldset
     * @param {State}  state
     */
    constructor(fieldset, state) {
        // Sets the Input's initial state.
        this._fieldset = fieldset;
        this._state = state;
        this._input = null;
        this._name = null;

        this._value = '';
        this._initial = '';
        this._illegal = false;
        this._changed = false;

        this._required = fieldset.getAttribute('required') !== null;
        this._recommended = fieldset.getAttribute('recommended') !== null;
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
        return this._initial !== this._value;
    }

    /**
     * Validates if the input is currently holding an illegal value.
     *
     * @return {boolean}
     */
    isIllegal() {
        return this._required && this._value.trim().length === 0;
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
     * Processes the input's changes after an internal event is triggered.
     *
     * @param {string} value
     */
    processChange(value) {
        // Loads the changed value into the class.
        this._value = value;

        // Validates the input's styling.
        if (this.isIllegal()) {
            this.setStateIllegal();
        } else if (this.hasChanged()) {
            this.setStateChanged();
        } else {
            this.setStateNormal();
        }

        // Processes the input's current state.
        this.processState();
    }

    /**
     * Restores the input's value to its initial state and re-evaluates.
     */
    reset() {
        if (this._input && 'value' in this._input) {
            this._input.value = this._initial == null ? '' : this._initial;
            this.processChange(this._input.value);
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

    /**
     * Processes the Input's state changed.
     */
    processState() {
        // Check current control's state.
        let state = State.NORMAL;
        if (this._illegal) {
            state = State.ILLEGAL;
        } else if (this._changed) {
            state = State.CHANGED;
        }

        // Compare current state with previous one.
        // If not changed, there's no need to call the callback.
        if (this._state !== state) {
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
        let event = new CustomEvent('stateChange', {
            bubbles: true,
            cancelable: false,
            detail: {
                state: state,
                instance: this,
            },
        });

        // Triggers Custom Event.
        log('[SmartForms] input stateChange', { name: this.name?.() ?? null, state, instance: this });
        this._fieldset.dispatchEvent(event);
    }

    /**
     * Resets the input to its baseline state.
     */
    rebaseline() {
        this._initial = this._value;
        this.setStateNormal();
    }
}

export default BaseInput;
