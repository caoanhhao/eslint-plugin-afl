import parser from './parser.js';
import spaceInsideParens from './rules/space-inside-parens.js';

console.log('Loading AFL ESLint plugin...');
export default {
  parser,
  rules: {
    'space-inside-parens': spaceInsideParens
  }
};
