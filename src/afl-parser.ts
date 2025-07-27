import { AST_NODE_TYPES } from "@typescript-eslint/types";

const STATE = Symbol("espree's internal state");

function init() {
  return Parser => {
    return class AFLParser extends Parser {
      // Override the parseStatement method to handle custom syntax
      parseStatement(context, topLevel, exports) {
        const valueLowerCase = getLowerCaseValue(this.value);

        // Handle 'global' and 'local' variable declarations
        if (this.type?.label === "name" && (valueLowerCase === "global" || valueLowerCase === "local")) {
          this.next();
          const declarations: any[] = [];
          do {
            const id = this.parseIdent();
            declarations.push({
              type: AST_NODE_TYPES.VariableDeclarator,
              id,
              init: null
            });
            if (this.type.label === ",") {
              this.next();
            } else {
              break;
            }
          } while (true);
          this.semicolon(); // consume ;
          return {
            type: AST_NODE_TYPES.VariableDeclarator,
            kind: valueLowerCase,
            declarations
          };
        }

        // Handle #include as import (supports both #include "file" and #include <file>)
        if (this.type.label === "privateId" && (valueLowerCase === "include" || valueLowerCase === "include_once")) {
          this.next();
          let source;
          // Accept string literal: #include "file.afl"
          if (this.type.label === "string") {
            const strValue = this.value;
            const start = this.start;
            const end = this.end;
            this.next(); // consume string
            source = {
              type: AST_NODE_TYPES.Literal,
              value: strValue,
              raw: `"${strValue}"`,
              start,
              end
            };
            // Accept angle-bracketed include: #include <file.afl>
          } else if (this.type.label === "</>/<=/>=" && this.value === "<") {
            // Parse everything until '>' as the source value
            const start = this.start;
            this.next(); // consume '<'
            let fileName = '';
            while (!(this.type.label === "</>/<=/>=" && this.value === ">")) {
              fileName += this.input.slice(this.start, this.end);
              this.next();
            }
            this.next(); // consume '>'
            source = {
              type: AST_NODE_TYPES.Literal,
              value: fileName.trim(),
              raw: `<${fileName.trim()}>`,
              start,
              end: this.end
            };
          } else if (this.type.label === "name") {
            // Accept identifier as fallback
            source = this.parseIdent();
          } else {
            this.unexpected();
          }
          // Make semicolon optional after #include
          if (this.type.label === ";") {
            this.semicolon();
          }
          return {
            type: "ImportDeclaration",
            specifiers: [],
            source,
            importKind: "value"
          };
        }

        return super.parseStatement(context, topLevel, exports);
      }

      // Parse expressions with custom handling for 'AND' and 'OR' as logical operators
      parseExprOp(left: any, leftStartPos: any, minPrec: any, ...args: any[]) {
        const valueLowerCase = getLowerCaseValue(this.value);

        // If the token is 'AND', treat it as the logical AND operator '&&'
        if (this.type.label === "name" && valueLowerCase === "and") {
          const operator = "&&";
          this.next();
          const right = this.parseExprOp(this.parseMaybeUnary(), leftStartPos, minPrec, ...args);
          return {
            type: AST_NODE_TYPES.LogicalExpression,
            operator,
            left,
            right
          };
        }

        // If the token is 'OR', treat it as the logical OR operator '||'
        if (this.type.label === "name" && valueLowerCase === "or") {
          const operator = "||";
          this.next();
          const right = this.parseExprOp(this.parseMaybeUnary(), leftStartPos, minPrec, ...args);
          return {
            type: AST_NODE_TYPES.LogicalExpression,
            operator,
            left,
            right
          };
        }

        return super.parseExprOp(left, leftStartPos, minPrec, ...args);
      }
        
      parseExprAtom(refDestructuringErrors) {
        const valueLowerCase = getLowerCaseValue(this.value);

        // If the keyword 'Not' is encountered, parse it as a negation UnaryExpression
        if (this.type.label === "name" && valueLowerCase === 'not') {
          const node = this.startNode();
          node.operator = '!';
          node.prefix = true;
          this.next(); // consume 'Not'
          const arg = this.parseMaybeUnary();
          node.argument = arg;
          return this.finishNode(node, AST_NODE_TYPES.UnaryExpression);
        }
    
        return super.parseExprAtom(refDestructuringErrors);
      }
    
    }
  }
}

function getLowerCaseValue(value) {
  return typeof value === 'string' ? value.toLowerCase() : value;
}

export default init();