export const enum NodeType {
  Parent,
  Leaf,
}

export interface Node {
  label: string;
  data:
    | { type: NodeType.Parent; children: Node[] }
    | { type: NodeType.Leaf; leaf: string; roof: boolean };
}
