import parser from './parser.js';
import spaceInsideParens from './rules/space-inside-parens.js';
import AFLParser from './afl-parser.js';

export { AFLParser };

export default {
  parser,
  rules: {
    'space-inside-parens': spaceInsideParens
  }
};
