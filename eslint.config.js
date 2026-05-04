export default [
    {
        files: ['src/**/*.js', 'tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                CustomEvent: 'readonly',
                Event: 'readonly',
                HTMLElement: 'readonly',
                console: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'warn',
            eqeqeq: ['error', 'always'],
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
    },
];
