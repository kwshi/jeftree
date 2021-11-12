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

const enum Token {
  BrackL,
  BrackR,
}

const tokens = <const>[{ pattern: /\[/y }];

export const lex = function* (s: string) {
  outer: for (let pos = 0; pos < s.length; ) {
    for (const token of tokens) {
      token.pattern.lastIndex = pos;
      const match = token.pattern.exec(s);
      if (match !== null) {
        console.log(match);
        yield match;
        continue outer;
      }
    }
    // none found
    // return error TODO
  }
};
