import State from '../constants/State';
import SmartFormList from './SmartFormList';
import SmartFormRecord from './SmartFormRecord';

/**
 * Main form's handling class.
 *
 * @package   SmartForms\Assets
 */
class SmartForm {
    /**
     * Initializes the Form's instance.
     *
     * @param {object}  form
     */
    constructor(form) {
        // Sets the form's initial state.
        this._form = form;
        this._isNew = form.querySelector('input[name="id"]') === null;
        this._body = null;

        // Now loads the Form's body.
        // First we'll need to validate if the Form's body is a List.
        let container = form.querySelector('.smartformlist');
        if (container !== null) {
            this._body = new SmartFormList(container, State.NORMAL);
        } else {
            // If it's not a List, we'll need to validate that the Form's body is a Record.
            container = form.querySelector('.smartformrecord');
            if (container !== null) {
                this._body = new SmartFormRecord(container, State.NORMAL);
            } else {
                throw new Error("Type of form's body not found.");
            }
        }
    }

    /**
     * retrieves the Form's current State.
     *
     * @returns {State}
     */
    state() {
        return this._body.state();
    }
}

export default SmartForm;
