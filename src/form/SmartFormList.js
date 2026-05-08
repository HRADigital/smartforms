import Row from './list/Row';
import State from '../constants/State';
import { log } from '../logger.js';

/**
 * Form's List handling class.
 *
 * @package   SmartForms\Assets
 */
class SmartFormList {
    /**
     * Initializes the List's managing instance.
     *
     * @param {object} list
     * @param {State}  state
     */
    constructor(list, state) {
        // Sets the List's initial state.
        this._element = list;
        this._state = state;
        this._rows = [];
        this._toggle = list.querySelector('thead input[name="checkall-toggle"]');
        this._checkbox = list.querySelectorAll('tbody tr input[name="cid[]"]');
        this._changed = [];

        // Loads each Row's information.
        let order = 0;
        list.querySelectorAll('tbody tr').forEach((row) => {
            // Configures the Row's State changing event handler, and adds it to the list.
            row.addEventListener('stateChange', (e) => this.onStateChange(e), false);
            this._rows.push(new Row(row, ++order));
        });

        // Configures main checkbox.
        this._toggle.addEventListener('change', () => this.onToggleChange());
        this.triggerEvent();
    }

    /**
     * retrieves the Form's current State.
     *
     * @returns {State}
     */
    state() {
        return this._state;
    }

    /**
     * Returns the number of loaded Rows in the List.
     *
     * @returns {integer}
     */
    rowCount() {
        return this._rows.length;
    }

    /**
     * Returns the number of Rows in the List, marked as changed.
     *
     * @returns {integer}
     */
    changedCount() {
        return this._changed.length;
    }

    /**
     * Event handler for the Table's toggle checkbox click event.
     */
    onToggleChange() {
        // Toggles all Row's checkboxes.
        this._checkbox.forEach((row) => {
            row.checked = this._toggle.checked;
        });

        // Processes each Row's internal state.
        this._rows.forEach((row) => {
            row.processState();
        });
    }

    /**
     * Event handler for when a Row's state changes.
     *
     * @param {Event} e - New Row's state Event.
     */
    onStateChange(e) {
        // We'll need to evaluate the Row's current state, in order to procees the
        // Row's state tracking.
        const index = this._changed.indexOf(e.detail.instance.id());

        // Manages the changed element's array.
        if (e.detail.state === State.NORMAL && index >= 0) {
            this._changed.splice(index, 1);
        } else if (e.detail.state === State.CHANGED && index < 0) {
            this._changed.push(e.detail.instance.id());
        }

        // Now that we synced the Row's tracking information, we'll need to process
        // the List's state as well.
        this.checkListState();
    }

    /**
     * Processes the List's current state, and calls parent callback if required (state changed).
     */
    checkListState() {
        // Now we'll evaluate possible scenarios.
        let state = State.NORMAL;
        if (this._changed.length > 1) {
            state = State.MANY;
        } else if (this._changed.length === 1) {
            state = State.SELECTED;
        }

        // Processes the Toggle's checkbox state first.
        this._toggle.checked = this._changed.length === this._rows.length;

        // Now we'll compare current state, with previous one.
        if (this._state !== state) {
            this._state = state;
            this.triggerEvent();
        }
    }

    /**
     * Triggers a State change event.
     */
    triggerEvent() {
        // Configures Custom Event for State change.
        const event = new CustomEvent('formStateChange', {
            bubbles: true,
            cancelable: false,
            detail: {
                state: this._state,
                instance: this,
            },
        });

        // Triggers Custom Event.
        log('[SmartForms] formStateChange (list)', { state: this._state, instance: this });
        this._element.dispatchEvent(event);
    }

    /**
     * Returns the IDs of selected rows.
     *
     * @returns {array}
     */
    selectedIds() {
        return Array.from(this._element.querySelectorAll('input[name="cid[]"]:checked'))
            .map((cb) => cb.value);
    }

    /**
     * Returns the ID of the selected row if exactly one row is selected, null otherwise.
     *
     * @returns {string|null}
     */
    id() {
        return this._changed.length === 1 ? this._changed[0] : null;
    }

    /**
     * Resets the list to its baseline state.
     */
    rebaseline() {
        this._changed = [];
        if (this._toggle) this._toggle.checked = false;
        this._element.querySelectorAll('input[name="cid[]"]').forEach((cb) => { cb.checked = false; });
        if (this._state !== State.NORMAL) {
            this._state = State.NORMAL;
            this.triggerEvent();
        }
    }
}

export default SmartFormList;
