import * as Syntax from "./syntax";

const enum StateType {
  Subtrees,
  SubtreeRoot,
  SubtreeLeaf,
  End,
}

interface PartialNode {
  label: string;
  leaf: string | null;
  children: Syntax.Node[];
}

interface State {
  tag: StateType;
  nodes: Syntax.Node[]; // finalized, top-level nodes
  stack: PartialNode[];
  errs: Syntax.ParseError[];
}

type Action = (state: State, token: Syntax.Token) => void;

const peek = (state: State) => state.stack[state.stack.length - 1];

const actionOpenChild: Action = (state) => {
  state.tag = StateType.SubtreeRoot;
  state.stack.push({
    label: "",
    leaf: null,
    children: [],
  });
};

const actionClose =
  (finalize: (partial: PartialNode) => Syntax.Node["data"]): Action =>
  (state, token) => {
    const s = state.stack.pop();
    if (typeof s === "undefined") {
      state.errs.push({
        range: token.range,
        data: { tag: Syntax.ErrorTag.ExtraClose, token },
      });
      return;
    }

    const parent = peek(state);
    state.tag = StateType.Subtrees;
    (parent?.children ?? state.nodes).push({
      label: s.label,
      data: finalize(s),
    });
  };

const action: Record<StateType, Partial<Record<Syntax.TokenType, Action>>> = {
  [StateType.SubtreeRoot]: {
    [Syntax.TokenType.BrackR]: actionClose(() => ({
      type: Syntax.NodeType.Bare,
    })),
    [Syntax.TokenType.Text]: (state, token) => {
      state.tag = StateType.SubtreeRoot;
      peek(state)!.label = token.text;
    },
    [Syntax.TokenType.Slash]: (state) => {
      state.tag = StateType.SubtreeLeaf;
    },
    [Syntax.TokenType.Slash2]: (state) => {
      state.tag = StateType.SubtreeLeaf;
    },
    [Syntax.TokenType.BrackL]: actionOpenChild,
  },
  [StateType.SubtreeLeaf]: {
    [Syntax.TokenType.BrackR]: actionClose((partial) => ({
      type: Syntax.NodeType.Leaf,
      leaf: partial.leaf!,
      roof: false,
    })),
    [Syntax.TokenType.Text]: (state, token) => {
      state.tag = StateType.SubtreeLeaf;
      peek(state)!.leaf = token.text;
    },
  },
  [StateType.Subtrees]: {
    [Syntax.TokenType.BrackL]: actionOpenChild,
    [Syntax.TokenType.BrackR]: actionClose((partial) => ({
      type: Syntax.NodeType.Parent,
      children: partial.children,
    })),
    [Syntax.TokenType.End]: (state, token) => {
      if (state.stack.length === 0) return;
      state.errs.push({
        range: token.range,
        data: { tag: Syntax.ErrorTag.UnexpectedEnd },
      });
    },
  },
  [StateType.End]: {},
};

export default (tokens: Iterable<Syntax.Token>): Syntax.ParseResult => {
  const state: State = {
    tag: StateType.Subtrees,
    stack: [],
    nodes: [],
    errs: [],
  };

  for (const token of tokens) {
    const act = action[state.tag][token.type];

    if (typeof act !== "undefined") act(state, token);
    else
      state.errs.push({
        range: token.range,
        data: { tag: Syntax.ErrorTag.UnacceptableToken, token },
      });
  }

  return state.errs.length === 0
    ? { ok: true, nodes: state.nodes }
    : { ok: false, errs: state.errs };
};
