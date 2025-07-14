import { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Require space after "(" and before ")" in AFL function calls'
    },
    fixable: 'whitespace',
    schema: []
  },
  create(context) {
    return {
      Program() {
        const lines = context.sourceCode.getText().split(/\r?\n/);

        lines.forEach((line, i) => {
          const regex = /([A-Za-z_][A-Za-z0-9_]*)\((.*?)\)/g;
          let match: RegExpExecArray | null;
          while ((match = regex.exec(line))) {
            const lineNumber = i + 1;
            const fn = match[1];
            const args = match[2];
            const full = match[0];

            const hasSpaceAfterOpen = /^\s/.test(args);
            const hasSpaceBeforeClose = /\s$/.test(args);

            // If there is no space after the opening parenthesis or before the closing parenthesis
            // and there are arguments present, report the issue
            if ((!hasSpaceAfterOpen || !hasSpaceBeforeClose) && args.length > 0) {
              context.report({
                loc: {
                  start: { line: lineNumber, column: match.index },
                  end: { line: lineNumber, column: match.index + full.length }
                },
                message: 'Expected space after "(" and before ")"',
                fix(fixer) {
                  if (!match) return null;
                  const fixedArgs = `${hasSpaceAfterOpen ? '' : ' '}${args.trim()}${hasSpaceBeforeClose ? '' : ' '}`;
                  const start = context.sourceCode.getIndexFromLoc({ line: lineNumber, column: match.index + fn.length + 1 });
                  const end = context.sourceCode.getIndexFromLoc({ line: lineNumber, column: match.index + full.length - 1 });

                  // Only fix missing spaces, do not replace the entire args
                  const fixes: any[] = [];
                  if (!hasSpaceAfterOpen) {
                    // Add space after '('
                    fixes.push(fixer.insertTextAfterRange(
                      [start, start],
                      ' '
                    ));
                  }
                  if (!hasSpaceBeforeClose) {
                    // Add space before ')'
                    fixes.push(fixer.insertTextBeforeRange(
                      [end, end],
                      ' '
                    ));
                  }
                  return fixes;
                },
              });
            }
          }
        });
      }
    };
  }
};

export default rule;
