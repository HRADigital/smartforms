import State from '../constants/State';
import Roles from '../constants/Roles';
import { log } from '../logger.js';

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
        this._actions = {};

        // Configures the DOM element.
        this._button.addEventListener('click', (e) => this.onClick(e));

        // Declares State related actions.
        this._actions = {
            [State.NORMAL]:      this.setStateNormal.bind(this),
            [State.CHANGED]:     this.setStateChanged.bind(this),
            [State.SELECTED]:    this.setStateSelected.bind(this),
            [State.MANY]:        this.setStateMany.bind(this),
            [State.ILLEGAL]:     this.setStateIllegal.bind(this),
            [State.DEACTIVATED]: this.setStateDeactivated.bind(this),
            [State.SUBMITTED]:   this.setStateSubmitted.bind(this),
        };
    }

    /**
     * Returns the underlying DOM element.
     *
     * @returns {HTMLElement}
     */
    element() {
        return this._button;
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
        if (this._role === Roles.TOGGLE) {
            this.deactivate();
            this.visible();
        } else {
            this.deactivate();
            this.visible();
        }
    }

    /**
     * Changes the button's state, when the form has a NORMAL state.
     */
    setStateNormal() {
        switch (this._role) {
            case Roles.CREATE:
            case Roles.DESTROY:
            case Roles.BACK:
                this.activate();
                this.visible();
                break;
            case Roles.TOGGLE:
                this.deactivate();
                this.visible();
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
            case Roles.EDIT:
            case Roles.UPDATE:
            case Roles.UPDATEALL:
            case Roles.DELETE:
            case Roles.DELETEALL:
            case Roles.CANCEL:
                this.activate();
                this.visible();
                break;
            case Roles.TOGGLE:
                this.deactivate();
                this.visible();
                break;
            default:
                this.deactivate();
                this.visible();
                break;
        }
    }

    /**
     * Changes the button's state, when the form has a SELECTED state.
     */
    setStateSelected() {
        switch (this._role) {
            case Roles.EDIT:
            case Roles.UPDATE:
            case Roles.DELETE:
            case Roles.CANCEL:
                this.activate();
                this.visible();
                break;
            case Roles.TOGGLE:
                this.activate();
                this.visible();
                break;
            case Roles.CREATE:
            case Roles.UPDATEALL:
            case Roles.DELETEALL:
                this.deactivate();
                this.visible();
                break;
            default:
                this.deactivate();
                this.visible();
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
            case Roles.TOGGLE:
                this.deactivate();
                this.visible();
                break;
            default:
                this.deactivate();
                this.visible();
                break;
        }
    }

    /**
     * Changes the button's state, when the form has an ILLEGAL state.
     */
    setStateIllegal() {
        if (this._role === Roles.CANCEL) {
            this.activate();
            this.visible();
        } else if (this._role === Roles.TOGGLE) {
            this.deactivate();
            this.visible();
        } else {
            this.deactivate();
            this.visible();
        }
    }

    /**
     * Changes the button's state, when the form has an DEACTIVATED state.
     */
    setStateDeactivated() {
        if (this._role === Roles.TOGGLE) {
            this.deactivate();
            this.visible();
        } else {
            this.deactivate();
            this.visible();
        }
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
    onClick(e) {
        // CREATE / BACK are pure navigations, not form tasks. If the element
        // is an anchor with an href, let the browser follow it — unless the
        // button is currently deactivated (e.g. BACK while form is dirty).
        if (this._role === Roles.CREATE || this._role === Roles.BACK) {
            const isAnchor = this._button.tagName === 'A';
            const href = this._button.getAttribute('href');
            const isDisabled = this._button.classList.contains('disabled');
            if (isAnchor && typeof href === 'string' && href.length > 0) {
                if (isDisabled) {
                    e.preventDefault();
                    return;
                }
                return;
            }
        }
        e.preventDefault();
        if (this._role === Roles.CANCEL) {
            const form = this._button.closest('form');
            if (form !== null) {
                form.reset();
            }
            return;
        }
        if (this._button.disabled || this._button.classList.contains('disabled')) {
            return;
        }
        const dataTaskAttr = this._button.getAttribute('data-task');
        const event = new CustomEvent('taskRequest', {
            bubbles: true,
            cancelable: false,
            detail: {
                role: this._role,
                dataTaskAttr,
                button: this,
            },
        });
        log('[SmartForms] button taskRequest', { role: this._role, dataTaskAttr, button: this });
        this._button.dispatchEvent(event);
    }
}

export default Button;
