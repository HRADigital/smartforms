/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

import TextInput from './TextInput.js';

/**
 * Form Email Input handling class.
 *
 * @package   SmartForms\Assets
 */
class EmailInput extends TextInput {
    /**
     * Validates if the input is currently holding an illegal value.
     *
     * @return {boolean}
     */
    isIllegal() {
        if (this._required && this._value.trim().length === 0) {
            return true;
        }

        if (
            this._value.trim().length > 0 &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this._value.trim())
        ) {
            return true;
        }

        return false;
    }
}

export default EmailInput;
