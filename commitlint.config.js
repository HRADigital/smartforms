/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) HRADigital - Hugo Rafael Azevedo.
 */

export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // The release automation reads the type, so the enum stays closed.
        'type-enum': [
            2,
            'always',
            [
                'feat',
                'fix',
                'perf',
                'refactor',
                'revert',
                'test',
                'docs',
                'chore',
                'build',
                'ci',
                'style',
            ],
        ],
        'header-max-length': [2, 'always', 90],
    },
};
