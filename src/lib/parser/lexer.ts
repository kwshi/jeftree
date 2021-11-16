import * as Syntax from "./syntax";

const defs = [
  { token: Syntax.TokenType.BrackL, pattern: /\[/ },
  { token: Syntax.TokenType.BrackR, pattern: /\]/ },
  { token: Syntax.TokenType.Slash2, pattern: /\/\// },
  { token: Syntax.TokenType.Slash, pattern: /\// },
  // TODO quoted string support
  {
    token: Syntax.TokenType.Text,
    pattern: /[^\/\[\]\s]([^\/\[\]]*[^\/\[\]\s])?/,
  },
  { token: null, pattern: /\s+/ },
].map((def) => ({ ...def, pattern: new RegExp(def.pattern, "myu") }));

export default (input: string): Syntax.LexResult => {
  const pos = { offset: 0, row: 0, col: 0 };
  const tokens: Syntax.Token[] = [];
  const errs: Syntax.LexError[] = [];

  outer: while (pos.offset < input.length) {
    for (const def of defs) {
      def.pattern.lastIndex = pos.offset;
      const match = def.pattern.exec(input);

      if (match === null) continue;

      const start = { ...pos };

      const lines = match[0]!.split("\n");
      pos.offset = def.pattern.lastIndex;
      pos.row += lines.length - 1;
      pos.col = lines[lines.length - 1]!.length;

      const end = { ...pos };

      if (def.token !== null)
        tokens.push({
          type: def.token,
          text: match[0]!,
          range: { start, end },
        });

      continue outer;
    }

    // no token patterns matched, push error & skip one character
    errs.push({ range: { start: pos } });
    if (input[pos.offset++] === "\n") {
      ++pos.row;
      pos.col = 0;
    } else ++pos.col;
  }

  // TODO not a fan of this special end token business
  tokens.push({ type: Syntax.TokenType.End, text: "", range: { start: pos } });
  return errs.length === 0 ? { ok: true, tokens } : { ok: false, errs };
};
