import { AST_TOKEN_TYPES } from "@typescript-eslint/types";
import { Token } from "./types";

// Regex patterns with sticky flag
const whitespacePattern = /\s+/y;
const lineCommentPattern = /\/\/.*(?:\r?\n|$)/y; // Match till end of line or end of text
const blockCommentPattern = /\/\*[\s\S]*?\*\//y; // Non-greedy match for block comments
const stringPattern = /"([^"\\]|\\.)*"/y; // Basic double-quoted string
// Need to handle <...> after #include separately or refine regex
const numberPattern = /\b\d+(\.\d+)?\b/y;
const keywordPattern =
  /\b(?:and|or|not|if|else|switch|case|default|do|for|while|break|continue|return|function|procedure|_section_begin|_section_end|local|global|static|typeof|#include|#include_once)\b/iy; // Case-insensitive keywords
// Multi-character operators first
const multiCharOperatorPattern =
  /(?:==|!=|<=|>=|&&|\|\||\+=|-=|\*=|%=|\/=|\|=|&=|\^=|<<|>>|<<=|>>=)/y;
// Single-character operators and punctuators
const singleCharPattern = /[+\-*\/%=<>!~?:;,()[\\]{}]/y; // Added []{} and ;:?

// Identifier pattern - must not start with a digit
const identifierPattern = /[A-Za-z_][A-Za-z0-9_]*/y;

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;
  let col = 0;

  const length = text.length;

  // Helper to update line and column based on advancing position
  function updatePos(newPos: number) {
    for (let i = pos; i < newPos; i++) {
      if (text[i] === "\n") {
        line++;
        col = 0;
      } else {
        col++;
      }
    }
    pos = newPos;
  }

  // Helper to create location object using the line/col at the start of the token
  function makeLoc(
    startPos: number,
    endPos: number,
    startLine: number,
    startCol: number
  ) {
    let endLine = startLine;
    let endCol = startCol;
    for (let i = startPos; i < endPos; i++) {
      if (text[i] === "\n") {
        endLine++;
        endCol = 0;
      } else {
        endCol++;
      }
    }

    return {
      start: { line: startLine, column: startCol },
      end: { line: endLine, column: endCol },
    };
  }

  while (pos < length) {
    const start = pos;
    const startLine = line;
    const startCol = col;

    whitespacePattern.lastIndex = pos;
    const whitespaceMatch = whitespacePattern.exec(text);
    if (whitespaceMatch) {
      updatePos(pos + whitespaceMatch[0].length);
      continue;
    }

    lineCommentPattern.lastIndex = pos;
    const lineCommentMatch = lineCommentPattern.exec(text);
    if (lineCommentMatch) {
      updatePos(pos + lineCommentMatch[0].length);
      tokens.push({
        type: "Comment", // Using string literal as AST_TOKEN_TYPES.Comment is not available
        value: lineCommentMatch[0],
        loc: makeLoc(start, pos, startLine, startCol),
        range: [start, pos],
      });
      continue;
    }

    blockCommentPattern.lastIndex = pos;
    const blockCommentMatch = blockCommentPattern.exec(text);
    if (blockCommentMatch) {
      updatePos(pos + blockCommentMatch[0].length);
      tokens.push({
        type: "Comment", // Using string literal as AST_TOKEN_TYPES.Comment is not available
        value: blockCommentMatch[0],
        loc: makeLoc(start, pos, startLine, startCol),
        range: [start, pos],
      });
      continue;
    }

    stringPattern.lastIndex = pos;
    const stringMatch = stringPattern.exec(text);
    if (stringMatch) {
      updatePos(pos + stringMatch[0].length);
      tokens.push({
        type: AST_TOKEN_TYPES.String,
        value: stringMatch[0],
        loc: makeLoc(start, pos, startLine, startCol),
        range: [start, pos],
      });
      continue;
    }

    // Handle <...> string after #include
    // This requires looking back, which is tricky with simple regex.
    // A simpler approach for now is to treat `<` and `>` as punctuators,
    // or handle this specific case in the parser/AST building phase.
    // Let's add a basic check for `<...>` after #include for now, though it's not perfect.
    const includeMatch = text
      .substring(0, pos)
      .match(/#include(?:_once)?\s*$/i);
    if (includeMatch) {
      const includeStringPattern = /<[^>]*>/y; // Match <...>
      includeStringPattern.lastIndex = pos;
      const includeStringMatch = includeStringPattern.exec(text);
      if (includeStringMatch) {
        updatePos(pos + includeStringMatch[0].length);
        tokens.push({
          type: AST_TOKEN_TYPES.String, // Treat as string
          value: includeStringMatch[0],
          loc: makeLoc(start, pos, startLine, startCol),
          range: [start, pos],
        });
        continue;
      }
    }

    numberPattern.lastIndex = pos;
    const numberMatch = numberPattern.exec(text);
    if (numberMatch) {
      updatePos(pos + numberMatch[0].length);
      tokens.push({
        type: AST_TOKEN_TYPES.Numeric,
        value: numberMatch[0],
        loc: makeLoc(start, pos, startLine, startCol),
        range: [start, pos],
      });
      continue;
    }

    keywordPattern.lastIndex = pos;
    const keywordMatch = keywordPattern.exec(text);
    if (keywordMatch) {
      updatePos(pos + keywordMatch[0].length);
      tokens.push({
        type: AST_TOKEN_TYPES.Keyword,
        value: keywordMatch[0],
        loc: makeLoc(start, pos, startLine, startCol),
        range: [start, pos],
      });
      continue;
    }

    multiCharOperatorPattern.lastIndex = pos;
    const multiCharOperatorMatch = multiCharOperatorPattern.exec(text);
    if (multiCharOperatorMatch) {
      updatePos(pos + multiCharOperatorMatch[0].length);
      tokens.push({
        type: AST_TOKEN_TYPES.Punctuator, // Operators are often Punctuators in AST
        value: multiCharOperatorMatch[0],
        loc: makeLoc(start, pos, startLine, startCol),
        range: [start, pos],
      });
      continue;
    }

    singleCharPattern.lastIndex = pos;
    const singleCharMatch = singleCharPattern.exec(text);
    if (singleCharMatch) {
      updatePos(pos + singleCharMatch[0].length);
      tokens.push({
        type: AST_TOKEN_TYPES.Punctuator,
        value: singleCharMatch[0],
        loc: makeLoc(start, pos, startLine, startCol),
        range: [start, pos],
      });
      continue;
    }

    identifierPattern.lastIndex = pos;
    const identifierMatch = identifierPattern.exec(text);
    if (identifierMatch) {
      updatePos(pos + identifierMatch[0].length);
      tokens.push({
        type: AST_TOKEN_TYPES.Identifier,
        value: identifierMatch[0],
        loc: makeLoc(start, pos, startLine, startCol),
        range: [start, pos],
      });
      continue;
    }

    // If no pattern matched, consume one character as unknown
    updatePos(pos + 1);
    tokens.push({
      type: "Unknown", // Or throw an error for unexpected character
      value: text.substring(start, pos),
      loc: makeLoc(start, pos, startLine, startCol),
      range: [start, pos],
    });
  }

  return tokens;
}
