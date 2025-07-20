import { Options, tokenizer, Parser, tokTypes } from 'acorn';
import AFLParser from './afl-parser.js';

export function parseForESLint(text: string, options: Options = { ecmaVersion: 6, sourceType: "script" }): any {
  options.ranges = true; // Ensure ranges are enabled for ESLint compatibility
  const aflParserInstance = Parser.extend(AFLParser as any);
  const acornAST = aflParserInstance.parse(text, options);
  const tokens = [...tokenizer(text, options)];

  // AST for ESLint compatibility
  const ast = {
    ...acornAST,
    loc: { start: acornAST.start, end: acornAST.end },
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
