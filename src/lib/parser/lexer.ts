import * as Token from "./token";
import type * as Tree from "$lib/tree";

interface TokenDef {
  token: Token.Tag | null;
  pattern: RegExp;
}

export interface Error {
  readonly range: Tree.Range;
  // TODO recovery & keep erroring char(s)
}

export interface Result {
  readonly tokens: readonly Token.Token[];
  readonly errors: readonly Error[];
}

const defs: readonly TokenDef[] = [
  { token: Token.Tag.BrackL, pattern: /\[/ },
  { token: Token.Tag.BrackR, pattern: /\]/ },
  { token: Token.Tag.Slash, pattern: /\// },
  { token: Token.Tag.Id, pattern: /#([\w\-]+)/ },
  {
    token: Token.Tag.Text,
    pattern: /[\w\-'.]+(?:\s[\w\-'.]+)*/,
  },
  { token: Token.Tag.Quote, pattern: /"((?:[^"\\]|\\"|\\\\)+)"/ },
  { token: null, pattern: /\s+/ },
].map((def) => ({ ...def, pattern: new RegExp(def.pattern, "myu") }));

export default (input: string): Result => {
  const pos = { offset: 0, row: 0, column: 0 };
  const tokens: Token.Token[] = [];
  const errors: Error[] = [];

  outer: while (pos.offset < input.length) {
    const start = { ...pos };

    for (const def of defs) {
      def.pattern.lastIndex = pos.offset;
      const match = def.pattern.exec(input);

      if (match === null) continue;

      const lines = match[0]!.split("\n");
      pos.offset = def.pattern.lastIndex;
      pos.row += lines.length - 1;
      pos.column = lines[lines.length - 1]!.length;

      const end = { ...pos };

      if (def.token !== null)
        tokens.push({
          tag: def.token,
          text: match[0]!,
          range: { start, end },
        });

      continue outer;
    }

    // no token patterns matched, push error & skip one character
    if (input[pos.offset++] === "\n") {
      ++pos.row;
      pos.column = 0;
    } else ++pos.column;

    errors.push({ range: { start, end: { ...pos } } });
  }

  return { tokens, errors };
};
