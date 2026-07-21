/**
 * Core calculator logic.
 *
 * Supports the four basic operations (+, -, *, /) with standard operator
 * precedence. Parentheses can group sub-expressions and override the default
 * evaluation order; nesting and multiple independent pairs are supported.
 * Operands and results are integers; negative results are allowed. Division
 * must divide evenly and must not divide by zero.
 */

/** Raised when a formula cannot be calculated. Carries the client-facing message. */
export class CalculationError extends Error {}

type Operator = "+" | "-" | "*" | "/";

interface NumberToken {
  type: "number";
  value: number;
}

interface OperatorToken {
  type: "operator";
  value: Operator;
}

interface LParenToken {
  type: "lparen";
}

interface RParenToken {
  type: "rparen";
}

type Token = NumberToken | OperatorToken | LParenToken | RParenToken;

const OPERATORS: readonly string[] = ["+", "-", "*", "/"];

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < formula.length) {
    const char = formula[index];

    if (char === " " || char === "\t") {
      index += 1;
      continue;
    }

    if (char === "(") {
      tokens.push({ type: "lparen" });
      index += 1;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: "rparen" });
      index += 1;
      continue;
    }

    if (char >= "0" && char <= "9") {
      let digits = "";
      while (index < formula.length && formula[index] >= "0" && formula[index] <= "9") {
        digits += formula[index];
        index += 1;
      }
      tokens.push({ type: "number", value: Number.parseInt(digits, 10) });
      continue;
    }

    if (OPERATORS.includes(char)) {
      tokens.push({ type: "operator", value: char as Operator });
      index += 1;
      continue;
    }

    throw new CalculationError(`The formula is not valid: ${formula}`);
  }

  return tokens;
}

/**
 * Recursive-descent parser/evaluator that honours operator precedence and
 * parentheses.  Grammar (simplified):
 *
 *   expr   → term  (('+' | '-') term)*
 *   term   → factor (('*' | '/') factor)*
 *   factor → NUMBER | '(' expr ')'
 */
class Parser {
  private pos = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly formula: string
  ) {}

  parse(): number {
    const result = this.parseExpr();
    if (this.pos < this.tokens.length) {
      // Remaining tokens mean an unmatched closing parenthesis or similar.
      throw new CalculationError(`The formula is not valid: ${this.formula}`);
    }
    return result;
  }

  private parseExpr(): number {
    let left = this.parseTerm();

    while (this.pos < this.tokens.length) {
      const tok = this.tokens[this.pos];
      if (tok.type !== "operator" || (tok.value !== "+" && tok.value !== "-")) break;
      this.pos++;
      const right = this.parseTerm();
      left = tok.value === "+" ? left + right : left - right;
    }

    return left;
  }

  private parseTerm(): number {
    let left = this.parseFactor();

    while (this.pos < this.tokens.length) {
      const tok = this.tokens[this.pos];
      if (tok.type !== "operator" || (tok.value !== "*" && tok.value !== "/")) break;
      const op = tok.value;
      this.pos++;
      const right = this.parseFactor();
      left = this.applyMulDiv(left, op, right);
    }

    return left;
  }

  private parseFactor(): number {
    if (this.pos >= this.tokens.length) {
      throw new CalculationError(`The formula is not valid: ${this.formula}`);
    }

    const tok = this.tokens[this.pos];

    if (tok.type === "lparen") {
      this.pos++;
      // Reject empty parentheses immediately.
      if (this.pos >= this.tokens.length || this.tokens[this.pos].type === "rparen") {
        throw new CalculationError(`The formula is not valid: ${this.formula}`);
      }
      const value = this.parseExpr();
      if (this.pos >= this.tokens.length || this.tokens[this.pos].type !== "rparen") {
        throw new CalculationError(`The formula is not valid: ${this.formula}`);
      }
      this.pos++;
      return value;
    }

    if (tok.type === "number") {
      this.pos++;
      return tok.value;
    }

    throw new CalculationError(`The formula is not valid: ${this.formula}`);
  }

  /** Division error messages identify the operands, not the full formula. */
  private applyMulDiv(left: number, operator: "*" | "/", right: number): number {
    if (operator === "*") return left * right;
    if (right === 0) {
      throw new CalculationError(`Division by zero is not allowed: ${left} / ${right}`);
    }
    if (left % right !== 0) {
      throw new CalculationError(`The result must be an integer: ${left} / ${right}`);
    }
    return left / right;
  }
}

export interface CalculationResult {
  result: number;
  formula: string;
  formattedExpression: string;
}

/**
 * Calculates the given formula, returning the result together with the
 * original formula and a formatted `formula = result` expression.
 *
 * @throws {CalculationError} when the formula is empty or invalid, or when a
 *   division is by zero or does not divide evenly.
 */
export function calculate(rawFormula: unknown): CalculationResult {
  if (typeof rawFormula !== "string" || rawFormula.trim() === "") {
    throw new CalculationError("The formula must not be empty");
  }

  const formula = rawFormula.trim();
  const tokens = tokenize(formula);
  if (tokens.length === 0) {
    throw new CalculationError(`The formula is not valid: ${formula}`);
  }
  const result = new Parser(tokens, formula).parse();

  return {
    result,
    formula,
    formattedExpression: `${formula} = ${result}`
  };
}
