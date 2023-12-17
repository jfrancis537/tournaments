import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'server/tsc_out/server/src/index.js',
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [nodeResolve({
    preferBuiltins: true
  }),commonjs(),json()]
};