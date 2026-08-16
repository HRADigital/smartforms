/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import State from '../constants/State.js';
import SmartFormList from './SmartFormList.js';
import SmartFormRecord from './SmartFormRecord.js';

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
        this._body = null;

        // Now loads the Form's body.
        // First we'll need to validate if the Form's body is a List.
        let container = form.querySelector('.smartformlist');
        if (container !== null) {
            this._body = new SmartFormList(container, State.NORMAL);
            this._isNew = null;
        } else {
            // If it's not a List, we'll need to validate that the Form's body is a Record.
            container = form.querySelector('.smartformrecord');
            if (container !== null) {
                this._body = new SmartFormRecord(container, State.NORMAL);
                const record = form.querySelector(':scope > .smartformrecord') || form;
                const idInput = record.querySelector(':scope > input[name="id"]');
                this._isNew = idInput === null;
            } else {
                throw new Error("Type of form's body not found.");
            }
        }

        // Restore each input to its initial state when the form is reset.
        form.addEventListener('reset', () => {
            if (this._body && typeof this._body.reset === 'function') {
                this._body.reset();
            }
        });
    }

    /**
     * retrieves the Form's current State.
     *
     * @returns {State}
     */
    state() {
        return this._body.state();
    }

    /**
     * Returns the form's resource name.
     *
     * @returns {string|null}
     */
    resource() {
        return this._form.getAttribute('data-resource');
    }

    /**
     * Returns the form's ID or the selected row's ID.
     *
     * @returns {string|null}
     */
    id() {
        if (this._form.classList.contains('smartformlist')) {
            return this._body && typeof this._body.id === 'function' ? this._body.id() : null;
        }
        const record = this._form.querySelector(':scope > .smartformrecord') || this._form;
        const idInput = record.querySelector(':scope > input[name="id"]');
        const v = idInput ? idInput.value : '';
        return v === '' ? null : v;
    }

    /**
     * Returns the selected row IDs.
     *
     * @returns {array}
     */
    selectedIds() {
        if (this._body && typeof this._body.selectedIds === 'function') {
            return this._body.selectedIds();
        }
        return [];
    }

    /**
     * Resets the form to its baseline state.
     */
    rebaseline() {
        if (this._body && typeof this._body.rebaseline === 'function') {
            this._body.rebaseline();
        }
    }
}

export default SmartForm;
