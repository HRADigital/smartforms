import State from '../constants/State';
import Roles from '../constants/Roles';

/**
 * Toolbar's Button handling class.
 *
 * @package   SmartForms\Assets
 */
class Button {
    /**
     * Initializes the Button's instance.
     *
     * @param {object} button
     */
    constructor(button) {
        // Sets up initial object's state.
        this._button = button;
        this._role = this._button.getAttribute('data-role');
        this._task = this._button.getAttribute('data-task');
        this._actions = [];

        // Configures the DOM element.
        this._button.addEventListener('click', () => this.onClick());

        // Declares State related actions.
        this._actions[State.DEACTIVATED.toString()] = this.setStateDeactivated.bind(this);
        this._actions[State.SUBMITTED.toString()] = this.setStateSubmitted.bind(this);
        this._actions[State.ILLEGAL.toString()] = this.setStateIllegal.bind(this);
        this._actions[State.CHANGED.toString()] = this.setStateChanged.bind(this);
        this._actions[State.SELECTED.toString()] = this.setStateChanged.bind(this);
        this._actions[State.MANY.toString()] = this.setStateMany.bind(this);
        this._actions[State.REORDERED.toString()] = this.setStateReordered.bind(this);
        this._actions[State.NORMAL.toString()] = this.setStateNormal.bind(this);
    }

    /**
     * Changes the form's state.
     *
     * @param {State}   state - The new form's state.
     */
    setState(state) {
        this._actions[state.toString()]();
    }

    /**
     * Changes the button to disabled, independent of its assigned role.
     */
    setStateSubmitted() {
        this.deactivate();
    }

    /**
     * Changes the button's state, when the form has a NORMAL state.
     */
    setStateNormal() {
        switch (this._role) {
            case Roles.CREATE:
            case Roles.LINK:
            case Roles.CANCEL:
                this.activate();
                this.visible();
                break;
            case Roles.REORDER:
                this.hidden();
                break;
            default:
                this.deactivate();
                this.visible();
                break;
        }
    }

    /**
     * Changes the button's state, when the form has a CHANGED state.
     */
    setStateChanged() {
        switch (this._role) {
            case Roles.UPDATE:
            case Roles.UPDATEALL:
            case Roles.DELETE:
            case Roles.DELETEALL:
            case Roles.CANCEL:
                this.activate();
                this.visible();
                break;
            case Roles.REORDER:
                this.hidden();
                break;
            default:
                this.deactivate();
                this.visible();
                break;
        }
    }

    /**
     * Changes the button's state, when the form has a MANY state.
     */
    setStateMany() {
        switch (this._role) {
            case Roles.UPDATEALL:
            case Roles.DELETEALL:
                this.activate();
                this.visible();
                break;
            case Roles.REORDER:
                this.hidden();
                break;
            default:
                this.deactivate();
                this.visible();
                break;
        }
    }

    /**
     * Changes the button's state, when the form has a REORDER state.
     */
    setStateReordered() {
        switch (this._role) {
            case Roles.REORDER:
            case Roles.LINK:
                this.activate();
                this.visible();
                break;
            default:
                this.hidden();
                break;
        }
    }

    /**
     * Changes the button's state, when the form has an ILLEGAL state.
     */
    setStateIllegal() {
        if (this._role === Roles.CANCEL) {
            this.activate();
        } else {
            this.deactivate();
        }
    }

    /**
     * Changes the button's state, when the form has an DEACTIVATED state.
     */
    setStateDeactivated() {
        this.setStateIllegal();
    }

    /**
     * Activates the button
     */
    activate() {
        this._button.classList.remove('disabled');
        this._button.removeAttribute('disabled');
    }

    /**
     * Deactivates the button
     */
    deactivate() {
        this._button.classList.add('disabled');
        this._button.setAttribute('disabled', 'disabled');
    }

    /**
     * Shows the button
     */
    visible() {
        this._button.classList.remove('hidden');
    }

    /**
     * Hides the button
     */
    hidden() {
        this._button.classList.add('hidden');
    }

    /**
     * Click event on the button.
     *
     * @param {event} e
     */
    onClick() {
        // If the Button is disabled, or no Task has been assigned to it,
        // we won't respond to its clicking event.
        if (this._task === null || this._button.hasAttribute('disabled')) {
            return;
        }

        // We'll only process the click event if the button's role is different from Roles.LINK.
        // If Roles.LINK, the button performs as a normal 'Anchor' element.
        if (this._role !== Roles.LINK) {
            // Otherwise, we'll configure a Custom Event for a Task's execution request.
            let event = new CustomEvent('taskRequest', {
                bubbles: false,
                cancelable: false,
                detail: {
                    task: this._task,
                    button: this,
                },
            });

            // Triggers Custom Event.
            this._button.dispatchEvent(event);
        }
    }
}

export default Button;
