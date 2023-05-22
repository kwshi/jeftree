import * as Tree from "$lib/tree";
import * as Token from "./token";

export const enum ErrorTag {
  UntokenableInput,
  UnexpectedEnd,
  UnacceptableToken,
  ExtraClose,
}

export interface Error {
  range: Tree.Range;
  data:
    | { tag: ErrorTag.UnexpectedEnd }
    | { tag: ErrorTag.UnacceptableToken; token: Token.Token }
    | { tag: ErrorTag.ExtraClose; token: Token.Token };
}

export interface Result {
  readonly nodes: readonly Tree.Node.Node[];
  readonly errors: readonly Error[];
}

const enum StateTag {
  Subtrees,
  SubtreeRoot,
  SubtreeLeaf,
}

interface PartialNode {
  labels: Tree.Node.Label[];
  children: Tree.Node.Node[];
}

interface State {
  tag: StateTag;
  nodes: Tree.Node.Node[]; // finalized, top-level nodes
  stack: PartialNode[];
  errs: Error[];
}

type Action = (state: State, token: Token.Token) => void;

const peek = (state: State) => state.stack[state.stack.length - 1];

const actionOpenChild: Action = (state) => {
  state.tag = StateTag.SubtreeRoot;
  state.stack.push({
    label: "",
    leaf: null,
    children: [],
  });
};

const actionClose =
  (finalize: (partial: PartialNode) => Tree.Node.Node["data"]): Action =>
  (state, token) => {
    const s = state.stack.pop();
    if (typeof s === "undefined") {
      state.errs.push({
        range: token.range,
        data: { tag: ErrorTag.ExtraClose, token },
      });
      return;
    }

    const parent = peek(state);
    state.tag = StateTag.Subtrees;
    (parent?.children ?? state.nodes).push({
      label: s.label,
      data: finalize(s),
    });
  };

const action: Record<StateTag, Partial<Record<Token.Tag, Action>>> = {
  [StateTag.SubtreeRoot]: {
    [Token.Tag.BrackR]: actionClose(() => ({
      type: Tree.Node.Tag.Bare,
    })),
    [Token.Tag.Text]: (state, token) => {
      state.tag = StateTag.SubtreeRoot;
      peek(state)!.label = token.text;
    },
    [Token.Tag.Slash]: (state) => {
      state.tag = StateTag.SubtreeLeaf;
    },
    //[Token.Tag.Slash2]: (state) => {
    //  state.tag = StateTag.SubtreeLeaf;
    //},
    [Token.Tag.BrackL]: actionOpenChild,
  },
  [StateTag.SubtreeLeaf]: {
    [Token.Tag.BrackR]: actionClose((partial) => ({
      type: Tree.Node.Tag.Leaf,
      leaf: partial.leaf!,
      roof: false,
    })),
    [Token.Tag.Text]: (state, token) => {
      state.tag = StateTag.SubtreeLeaf;
      peek(state)!.leaf = token.text;
    },
  },
  [StateTag.Subtrees]: {
    [Token.Tag.BrackL]: actionOpenChild,
    [Token.Tag.BrackR]: actionClose((partial) => ({
      type: Tree.Node.Tag.Parent,
      children: partial.children,
    })),
    //[Token.Tag.End]: (state, token) => {
    //  if (state.stack.length === 0) return;
    //  state.errs.push({
    //    range: token.range,
    //    data: { tag: Syntax.ErrorTag.UnexpectedEnd },
    //  });
    //},
  },
};

const end = (state: State): void => {
  if (state.tag !== StateTag.Subtrees) {
  }
};

export const parse = (tokens: Iterable<Token.Token>): Result => {
  const state: State = {
    tag: StateTag.Subtrees,
    stack: [],
    nodes: [],
    errs: [],
  };

  for (const token of tokens) {
    const act = action[state.tag][token.tag];

    if (typeof act !== "undefined") act(state, token);
    else
      state.errs.push({
        range: token.range,
        data: { tag: ErrorTag.UnacceptableToken, token },
      });
  }

  end(state);

  return Object.freeze({
    nodes: Object.freeze(state.nodes),
    errors: Object.freeze(state.errs),
  });
};

export default parse;
