export default {
    test: {
        environment: 'happy-dom',
        include: ['tests/**/*.test.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            include: ['src/**/*.js'],
        },
    },
};
