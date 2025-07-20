import parser from './parser.js';
import spaceInsideParens from './rules/space-inside-parens.js';

export default {
  parser,
  rules: {
    'space-inside-parens': spaceInsideParens
  }
};
