export enum NodeType {
  Parent,
  Leaf,
}

export interface Node {
  label: string;
  data:
    | { type: NodeType.Parent; children: Node[] }
    | { type: NodeType.Leaf; leaf: string; roof: boolean };
}

import * as Ch from "chevrotain";

const brackL = Ch.createToken({ name: "brackL", pattern: /\[/ });
const brackR = Ch.createToken({ name: "brackR", pattern: /\]/ });
const slash = Ch.createToken({ name: "slash", pattern: /\// });
const slash2 = Ch.createToken({ name: "slash2", pattern: /\/\// });
// consider skip whitespace
const text = Ch.createToken({
  name: "text",
  pattern: /[^\[\]\/\s]([^\[\]\/]*[^\[\]\/\s])?/,
});
const space = Ch.createToken({
  name: "space",
  pattern: /\s+/,
  group: Ch.Lexer.SKIPPED,
});

const tokens = [brackL, brackR, slash, slash2, text, space];

export const lexer = new Ch.Lexer(tokens);

class Parser extends Ch.CstParser {
  constructor() {
    super(tokens);

    this.RULE("tree", () => {
      this.CONSUME(brackL);
      this.CONSUME(text);
      this.CONSUME(brackR);
    });

    this.performSelfAnalysis();
  }
}

const parser = new Parser();

class Visitor extends parser.getBaseCstVisitorConstructor() {
  constructor() {
    super();
    this.validateVisitor();
  }

  tree(ctx: Record<string, Ch.IToken[]>) {
    console.log(ctx);
    return {
      text: ctx.text.map((token) => token.image),
    };
  }
}

const visitor = new Visitor();

export const parse = (s: string) => {
  const lexed = lexer.tokenize(s);
  parser.input = lexed.tokens;

  const cst = parser.tree();
  const result = visitor.visit(cst);
  return {
    result,
    errors: {
      lexer: lexed.errors,
      parser: parser.errors,
    },
  };
};
