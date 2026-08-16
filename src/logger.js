/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

let debug = false;

export function log(...args) {
    // eslint-disable-next-line no-console -- intentional debug logger output
    if (debug) console.log(...args);
}

export function warn(...args) {
    if (debug) console.warn(...args);
}

export function toggleDebug(v) {
    debug = v !== undefined ? Boolean(v) : !debug;
    // eslint-disable-next-line no-console -- intentional debug-state notice
    console.log('[SmartForms] debug', debug);
    return debug;
}
