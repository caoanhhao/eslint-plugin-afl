import { defineConfig } from "eslint/config";
import afl from './dist/src/index.js';

const configs = defineConfig([
  {
    name: 'eslint-plugin-afl',
    files: ['**/*.afl', '*.afl'],
    languageOptions: {
      parser: afl.parser,
    },
    plugins: {
      afl
    },
    rules: {
      'afl/space-inside-parens': 'warn'
    },
  }
])
export default configs;
