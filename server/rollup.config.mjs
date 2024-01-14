import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import html from 'rollup-plugin-html';

export default {
  input: 'server/tsc_out/server/src/index.js',
  output: {
    dir: 'publish',
    format: 'cjs'
  },
  plugins: [nodeResolve({
    preferBuiltins: true
  }),
  html({
    include: "src/assets/*.html"
  }),
  commonjs(),
  json()]
};