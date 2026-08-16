/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import TaskExecutor from '../http/TaskExecutor.js';

/**
 * Main form's handling class.
 *
 * @package   SmartForms\Assets
 */
class AdminForm {
    /**
     * Initializes the Form's handling instance.
     *
     * @param {object}  form
     */
    constructor(form) {
        // Sets the form's initial state.
        this._form = form;

        // Finds and configures the Toolbar if one exists in the form.
        const toolbar = form.querySelector('nav.toolbar');
        if (toolbar !== null) {
            toolbar.addEventListener('taskExecuted', (e) => this.onTaskExecuted(e), false);
        }
    }

    /**
     * Event handler for when a Button's task is requested.
     *
     * @param {Event} e - Task executed event.
     */
    onTaskExecuted(e) {
        const { descriptor, button } = e.detail;
        const source = button && typeof button.element === 'function' ? button.element() : null;
        TaskExecutor.execute(this._form, descriptor, { source });
    }
}

export default AdminForm;
