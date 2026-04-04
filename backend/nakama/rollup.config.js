import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'modules/index.ts',
    output: {
        file: 'build/index.js',
        format: 'cjs',
        exports: 'named',
        compact: true,        // minifies whitespace
    },
    plugins: [
        resolve(),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
    ],
};
