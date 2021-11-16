export interface Position {
  offset: number;
  row: number;
  col: number;
}

export interface Range {
  start: Position;
  end?: Position;
}

export const enum TokenType {
  BrackL,
  BrackR,
  Slash,
  Slash2,
  Text,
  End,
}

export interface Token {
  type: TokenType;
  text: string;
  range: Range;
}

export const enum NodeType {
  Parent,
  Leaf,
  Bare,
}

export interface Node {
  label: string;
  data:
    | { type: NodeType.Parent; children: Node[] }
    | { type: NodeType.Leaf; leaf: string; roof: boolean }
    | { type: NodeType.Bare };
}

export type Root = Node[];

export const enum ErrorTag {
  UntokenableInput,
  UnexpectedEnd,
  UnacceptableToken,
  ExtraClose,
}

export interface LexError {
  range: Range;
  // TODO recovery & keep erroring char(s)
}

export interface ParseError {
  range: Range;
  data:
    | { tag: ErrorTag.UnexpectedEnd }
    | { tag: ErrorTag.UnacceptableToken; token: Token }
    | { tag: ErrorTag.ExtraClose; token: Token };
}

export type LexResult =
  | { ok: true; tokens: readonly Token[] }
  | { ok: false; errs: readonly LexError[] };

export type ParseResult =
  | { ok: true; nodes: readonly Node[] }
  | { ok: false; errs: readonly ParseError[] };
