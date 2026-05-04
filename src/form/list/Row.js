import State from '../../constants/State';

/**
 * Form List's Row handling class.
 *
 * @package   SmartForms\Assets
 */
class Row {
    /**
     * Initializes the Row's instance.
     * @param {object}  element - The Row's (<tr>) DOM element.
     * @param {integer} order   - The Row's order in the parent list.
     */
    constructor(element, order) {
        // Loads initial state.
        this._element = element;
        this._row = element.querySelector('input[name="cid[]"]');
        this._order = order;
        this._id = this._row.value;
        this._checked = this._row.checked;
        this._state = State.NORMAL;

        // Hooks up the events.
        this._row.addEventListener('change', () => this.onChange());
    }

    /**
     * Returns the Row's record ID.
     *
     * @returns {integer}
     */
    id() {
        return this._id;
    }

    /**
     * Rteurns the Row's order in the parent list.
     *
     * @returns {integer}
     */
    order() {
        return this._order;
    }

    /**
     * Processes the Row's state changed.
     */
    processState() {
        // Checks the Webcontrol's state change.
        let state = State.NORMAL;
        if (this._checked !== this._row.checked) {
            state = State.CHANGED;
        }

        // Checks if the state has changed.
        if (this._state !== state) {
            this._state = state;
            this.triggerEvent(state);
        }
    }

    /**
     * Processes the Row's state changed.
     */
    onChange() {
        this.processState();
    }

    /**
     * Triggers a State change event.
     *
     * @param {State} state
     */
    triggerEvent(state) {
        // Configures Custom Event for State change.
        let event = new CustomEvent('stateChange', {
            bubbles: false,
            cancelable: false,
            detail: {
                state: state,
                instance: this,
            },
        });

        // Triggers Custom Event.
        this._element.dispatchEvent(event);
    }
}

export default Row;
