import nodeResolve from '@rollup/plugin-node-resolve';
import terser      from '@rollup/plugin-terser';

const banner = `/*! @hradigital/smartforms | MPL-2.0 */`;

export default {
    input: 'src/index.js',
    output: [
        { file: 'dist/smartforms.mjs', format: 'esm', banner, sourcemap: true },
        { file: 'dist/smartforms.cjs', format: 'cjs', banner, sourcemap: true, exports: 'named' },
        {
            file: 'dist/smartforms.umd.js',
            format: 'umd',
            name: 'SmartForms',
            banner,
            sourcemap: true,
            plugins: [terser()],
        },
    ],
    plugins: [nodeResolve()],
};
