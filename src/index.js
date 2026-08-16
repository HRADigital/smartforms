/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import SmartForm from './form/SmartForm.js';
import SmartFormList from './form/SmartFormList.js';
import SmartFormRecord from './form/SmartFormRecord.js';
import AdminForm from './toolbar/AdminForm.js';
import Toolbar from './toolbar/Toolbar.js';
import Button from './toolbar/Button.js';
import Roles from './constants/Roles.js';
import State from './constants/State.js';
import Tasks from './constants/Tasks.js';
import TaskExecutor from './http/TaskExecutor.js';
import { toggleDebug } from './logger.js';

const formRegistry = new WeakMap();

function registerForm(form, instance) {
    formRegistry.set(form, instance);
}

function getForm(form) {
    return formRegistry.get(form) || null;
}

function autoInit(root = document) {
    const forms = root.querySelectorAll('form.smartform, form.smartformlist');
    forms.forEach((form) => {
        const isList =
            form.classList.contains('smartformlist') && !form.classList.contains('smartform');
        const instance = isList ? new SmartFormList(form, State.NORMAL) : new SmartForm(form);
        registerForm(form, instance);

        const nav = form.querySelector('nav.toolbar');
        if (nav !== null) {
            new Toolbar(nav, form);
        }

        new AdminForm(form);
    });

    // Wire generic state trackers: any element with `data-track-form="<formId>"`
    // mirrors that form's state via the `disabled` class. Active only on NORMAL.
    const trackers = root.querySelectorAll('[data-track-form]');
    trackers.forEach((el) => {
        const formId = el.getAttribute('data-track-form');
        const form = formId ? document.getElementById(formId) : null;
        if (!form) return;

        const sync = (state) => {
            const isNormal = state === State.NORMAL;
            el.classList.toggle('disabled', !isNormal);
            el.setAttribute('aria-disabled', isNormal ? 'false' : 'true');
            if (el.tagName === 'A') {
                if (isNormal) {
                    el.removeAttribute('tabindex');
                } else {
                    el.setAttribute('tabindex', '-1');
                }
            }
        };
        sync(State.NORMAL);
        form.addEventListener('formStateChange', (e) => {
            if (e && e.detail && typeof e.detail.state !== 'undefined') {
                sync(e.detail.state);
            }
        });
    });
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => autoInit());
    } else {
        autoInit();
    }
}

export {
    SmartForm,
    SmartFormList,
    SmartFormRecord,
    AdminForm,
    Toolbar,
    Button,
    Roles,
    State,
    Tasks,
    TaskExecutor,
    autoInit,
    registerForm,
    getForm,
    toggleDebug,
};

export default {
    SmartForm,
    SmartFormList,
    SmartFormRecord,
    AdminForm,
    Toolbar,
    Button,
    Roles,
    State,
    Tasks,
    TaskExecutor,
    autoInit,
    registerForm,
    getForm,
    toggleDebug,
};
