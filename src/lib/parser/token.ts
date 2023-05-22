import type * as Tree from "$lib/tree";

export const enum Tag {
  BrackL,
  BrackR,
  Slash,
  Text,
  Quote,
  Id,
}

export interface Token {
  readonly tag: Tag;
  readonly text: string;
  readonly range: Tree.Range;
}
