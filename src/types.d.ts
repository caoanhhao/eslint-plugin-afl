import type { Rule } from 'eslint';

export type { Rule };

export interface Token {
  type: string;
  value: string;
  loc: { start: { line: number; column: number }; end: { line: number; column: number } };
  range: [number, number];
}