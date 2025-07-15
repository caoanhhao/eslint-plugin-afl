import { tokenize } from './tokenizer';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

export function parseForESLint(text: string, options = {}) {
  const tokens = tokenize(text);

  const body = tokens.length
    ? tokens.map(token => ({
        type: AST_NODE_TYPES.ExpressionStatement,
        expression: {
          type: token.type || 'Identifier',
          name: token.value,
          loc: token.loc,
          range: token.range
        },
        loc: token.loc,
        range: token.range
      }))
    : [];

  const ast = {
    type: 'Program',
    body,
    sourceType: 'script',
    loc: body.length
      ? { start: body[0].loc.start, end: body[body.length - 1].loc.end }
      : { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
    range: [0, text.length],
    tokens,
    comments: []
  };

  return {
    ast,
    services: {},
    scopeManager: null,
    visitorKeys: null
  };
}

const parser = {
  parse: (text: string, options?: any) => parseForESLint(text, options).ast,
  parseForESLint
};

export default parser;
