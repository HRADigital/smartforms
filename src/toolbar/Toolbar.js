import Button from './Button';
import State  from '../constants/State';

/**
 * Main form's Toolbar handling class.
 * 
 * @package   SmartForms\Assets
 */
class Toolbar {

    /**
     * Initializes the Toolbar's instance.
     * 
     * Collects all Toolbar's buttons, and configures them.
     * 
     * @param {object}  element - Toolbar's DOM NAV element.
     * @param {object}  form    - Main Form's DOM element.
     */
    constructor(element, form) {

        // Sets initial attribute's values.
        this._nav     = element;
        this._form    = form;
        this._buttons = [];
        this._state   = State.NORMAL;

        // Loads all Toolbar's buttons.
        this._nav.querySelectorAll('ul li a[data-role]').forEach(button => {

            // Configures the Button's Task Request event handler.
            button.addEventListener('taskRequest', e => this.onTaskRequest(e));

            // Adds Button to list.
            this._buttons.push(
                new Button(button)
            );
        });

        // Declares state change listner.
        this._form.addEventListener('formStateChange', e => this.onFormStateChange(e), false);
        this._form.addEventListener('submit', () => this.onSubmit(), false);
    }

    /**
     * Returns the Toolbar's State.
     * 
     * @returns {State}
     */
    state() {
        return this._state;
    }

    /**
     * Returns the Toolbar's DOM element.
     * 
     * @returns {object}
     */
    element() {
        return this._nav;
    }

    /**
     * Sets the Toolbar to a new State.
     * 
     * @param {State} state - New State value to be set on the Toolbar. 
     */
    setState(state) {

        // Propagates the supplied State to all buttons.
        this._buttons.forEach(button => {
            button.setState(state);
        });

        // Logs the state change.
        if (this._state !== state) {
            this._previous = this._state;
            this._state    = state;
        }
    }

    /**
     * Event handler for when the main Form's State has changed.
     * 
     * @param {Event} e - State Change Event.
     */
    onFormStateChange(e) {
        this.setState(e.detail.state);
    }

    /**
     * Event handler for when the main Form has been submitted.
     * Should set the Toolbar's State to ILLEGAL (disables all buttons).
     */
    onSubmit() {
        this.setState(State.SUBMITTED);
    }

    /**
     * Event handler for when a Button's task is requested.
     * 
     * @param {Event} e - New Row's state Event.
     */
    onTaskRequest(e) {

        // Prevents Toolbar's default behaviour and propagation.
        e.preventDefault();
        e.stopPropagation();

        // Configures Custom Event for State change.
        let event = new CustomEvent(
            'taskExecuted',
            {
                bubbles:    false,
                cancelable: false,
                detail: {
                    task:    e.detail.task,
                    button:  e.detail.button,
                    toolbar: this,
                },
            }
        );

        // Triggers Custom Event.
        this._nav.dispatchEvent(event);
    }
}

export default Toolbar;
