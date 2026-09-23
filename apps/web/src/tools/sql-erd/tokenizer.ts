export type TokenKind = "word" | "ident" | "string" | "number" | "punct";

export interface Token {
  kind: TokenKind;
  /** Identifier/word text with any quoting removed. */
  value: string;
  /** Uppercased `value`, precomputed because the parser compares keywords constantly. */
  upper: string;
  line: number;
}

const IDENT_START = /[A-Za-z_@#À-￿]/;
const IDENT_BODY = /[A-Za-z0-9_$@#À-￿]/;
const DIGIT = /[0-9]/;

/** Closing character for each supported quoted-identifier style. */
const IDENT_QUOTES: Record<string, string> = { '"': '"', "`": "`", "[": "]" };

/**
 * Marks a table or column as added by the change being diagrammed, e.g.
 * `form_id uuid, -- @new`. Read off comments rather than a separate input so an
 * annotated file is still the plain SQL it came from.
 */
const NEW_ANNOTATION = /@new\b/i;

export interface TokenizeResult {
  tokens: Token[];
  /** Lines carrying a `@new` comment, and the line each such comment sits above. */
  annotatedLines: Set<number>;
}

/**
 * Lexes SQL into tokens, dropping comments. Deliberately dialect-tolerant: it
 * accepts Postgres, MySQL, SQLite and T-SQL quoting rather than committing to one.
 */
export function tokenize(sql: string): TokenizeResult {
  const tokens: Token[] = [];
  const annotatedLines = new Set<number>();
  let index = 0;
  let line = 1;

  /** True when nothing but whitespace precedes `start` on its line. */
  const startsItsLine = (start: number): boolean => {
    for (let back = start - 1; back >= 0 && sql[back] !== "\n"; back -= 1) {
      if (!/\s/.test(sql[back])) {
        return false;
      }
    }

    return true;
  };

  // A trailing marker annotates the definition it sits on; one written on its own
  // line annotates the definition below it. Both styles are common in migrations.
  const annotate = (text: string, start: number, commentLine: number) => {
    if (!NEW_ANNOTATION.test(text)) {
      return;
    }

    annotatedLines.add(startsItsLine(start) ? commentLine + 1 : commentLine);
  };

  const push = (kind: TokenKind, value: string) => {
    tokens.push({ kind, value, upper: value.toUpperCase(), line });
  };

  while (index < sql.length) {
    const char = sql[index];

    if (char === "\n") {
      line += 1;
      index += 1;
      continue;
    }

    if (char === " " || char === "\t" || char === "\r" || char === "\f") {
      index += 1;
      continue;
    }

    // Line comments: -- ... and MySQL's # ...
    if ((char === "-" && sql[index + 1] === "-") || char === "#") {
      const start = index;
      while (index < sql.length && sql[index] !== "\n") {
        index += 1;
      }
      annotate(sql.slice(start, index), start, line);
      continue;
    }

    if (char === "/" && sql[index + 1] === "*") {
      const start = index;
      const openedOn = line;
      index += 2;
      while (index < sql.length && !(sql[index] === "*" && sql[index + 1] === "/")) {
        if (sql[index] === "\n") {
          line += 1;
        }
        index += 1;
      }
      index += 2;
      annotate(sql.slice(start, index), start, openedOn);
      continue;
    }

    // Postgres dollar-quoted body: $$ ... $$ or $tag$ ... $tag$
    if (char === "$") {
      const tagMatch = /^\$[A-Za-z_0-9]*\$/.exec(sql.slice(index));

      if (tagMatch) {
        const tag = tagMatch[0];
        const end = sql.indexOf(tag, index + tag.length);
        const stop = end === -1 ? sql.length : end;
        const body = sql.slice(index + tag.length, stop);
        line += (body.match(/\n/g) ?? []).length;
        push("string", body);
        index = end === -1 ? sql.length : end + tag.length;
        continue;
      }
    }

    if (char === "'") {
      let value = "";
      index += 1;

      while (index < sql.length) {
        if (sql[index] === "\\" && index + 1 < sql.length) {
          value += sql[index + 1];
          index += 2;
          continue;
        }

        if (sql[index] === "'") {
          // Doubled quote is an escaped quote, not the end of the literal.
          if (sql[index + 1] === "'") {
            value += "'";
            index += 2;
            continue;
          }

          index += 1;
          break;
        }

        if (sql[index] === "\n") {
          line += 1;
        }

        value += sql[index];
        index += 1;
      }

      push("string", value);
      continue;
    }

    // `[` only opens a quoted identifier at the start of a name; directly after one
    // it is an array suffix (`text[]`), which belongs to the type instead.
    const isArraySuffix = char === "[" && IDENT_BODY.test(sql[index - 1] ?? " ");
    const closingQuote = isArraySuffix ? undefined : IDENT_QUOTES[char];

    if (closingQuote) {
      let value = "";
      index += 1;

      while (index < sql.length) {
        if (sql[index] === closingQuote) {
          if (sql[index + 1] === closingQuote) {
            value += closingQuote;
            index += 2;
            continue;
          }

          index += 1;
          break;
        }

        if (sql[index] === "\n") {
          line += 1;
        }

        value += sql[index];
        index += 1;
      }

      push("ident", value);
      continue;
    }

    if (DIGIT.test(char) || (char === "." && DIGIT.test(sql[index + 1] ?? ""))) {
      let value = "";

      while (index < sql.length && /[0-9.eE+-]/.test(sql[index])) {
        // Only treat +/- as part of the number when it follows an exponent marker.
        if ((sql[index] === "+" || sql[index] === "-") && !/[eE]/.test(sql[index - 1] ?? "")) {
          break;
        }

        value += sql[index];
        index += 1;
      }

      push("number", value);
      continue;
    }

    if (IDENT_START.test(char)) {
      let value = "";

      while (index < sql.length && IDENT_BODY.test(sql[index])) {
        value += sql[index];
        index += 1;
      }

      push("word", value);
      continue;
    }

    push("punct", char);
    index += 1;
  }

  return { tokens, annotatedLines };
}

/** Splits a token stream into statements on top-level semicolons. */
export function splitStatements(tokens: Token[]): Token[][] {
  const statements: Token[][] = [];
  let current: Token[] = [];
  let depth = 0;

  for (const token of tokens) {
    if (token.kind === "punct") {
      if (token.value === "(") {
        depth += 1;
      } else if (token.value === ")") {
        depth = Math.max(0, depth - 1);
      } else if (token.value === ";" && depth === 0) {
        if (current.length) {
          statements.push(current);
        }

        current = [];
        continue;
      }
    }

    current.push(token);
  }

  if (current.length) {
    statements.push(current);
  }

  return statements;
}
