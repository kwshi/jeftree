export const enum Tag {
  Parent,
  Leaf,
  Bare,
}

export const enum LabelTag {
  Text,
  Quote,
}

export interface Label {
  tag: LabelTag;
  content: string;
}

export interface Node {
  readonly labels: readonly Label[];
  readonly data:
    | { readonly type: Tag.Parent; readonly children: Node[] }
    | {
        readonly type: Tag.Leaf;
        readonly leaf: string;
        readonly roof: boolean;
      }
    | { readonly type: Tag.Bare };
}
