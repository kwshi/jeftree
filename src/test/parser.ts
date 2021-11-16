import * as Parser from "../lib/parser";
import * as Syntax from "../lib/parser/syntax";
import * as Tap from "tap";

Tap.test("lexing", (t) => {
  // extra empty token at end is `End` token
  const cases = [
    { msg: "single word", input: "hello", segments: ["hello", ""] },
    { msg: "two words", input: "foo bar", segments: ["foo bar", ""] },
    { msg: "slashes", input: "/ // /  /", segments: ["/", "//", "/", "/", ""] },
    {
      msg: "brackets",
      input: "[ [[ ][",
      segments: ["[", "[", "[", "]", "[", ""],
    },
    {
      msg: "trim internal whitespace",
      input: "[ hi]ba b ]",
      segments: ["[", "hi", "]", "ba b", "]", ""],
    },
    {
      msg: "realistic stick",
      input: "[foo [bar [baz]]]",
      segments: ["[", "foo", "[", "bar", "[", "baz", "]", "]", "]", ""],
    },
  ];
  for (const c of cases) {
    const result = Parser.lex(c.input);
    t.ok(result.ok, c.msg);
    if (!result.ok) continue;
    t.strictSame(
      result.tokens.map((t) => t.text),
      c.segments,
      c.msg
    );
  }
  t.end();
});

Tap.test("parsing", (t) => {
  type Leaf = string | { roof: string };
  interface Tree {
    [label: string]: null | Leaf | Tree[];
  }
  const children = (data: Syntax.Node["data"]): Tree[string] => {
    switch (data.type) {
      case Syntax.NodeType.Parent:
        return data.children.map(simplify);
      case Syntax.NodeType.Leaf:
        return data.roof ? { roof: data.leaf } : data.leaf;
      case Syntax.NodeType.Bare:
        return null;
    }
  };
  const simplify = (node: Syntax.Node): Tree => ({
    [node.label]: children(node.data),
  });

  // `null` trees mean parsing should fail
  const cases: { msg: string; input: string; trees: Tree[] | null }[] = [
    { msg: "bare text", input: "hello world", trees: null },
    {
      msg: "singleton",
      input: "[hello world]",
      trees: [{ "hello world": null }],
    },
    {
      msg: "3 singletons",
      input: "[hello ] [ world] [ foo bar ]",
      trees: [{ hello: null }, { world: null }, { "foo bar": null }],
    },
    {
      msg: "simple stick",
      input: "[foo [bar [baz]]]",
      trees: [{ foo: [{ bar: [{ baz: null }] }] }],
    },
    {
      msg: "simple binary tree",
      input: "[4 [3 [1] [2]] [6 [5] [7]]]",
      trees: [
        {
          4: [
            { 3: [{ 1: null }, { 2: null }] },
            { 6: [{ 5: null }, { 7: null }] },
          ],
        },
      ],
    },
  ];
  for (const c of cases) {
    const lex = Parser.lex(c.input);
    t.ok(lex.ok);
    if (!lex.ok) continue;
    const result = Parser.parse(lex.tokens);

    if (c.trees === null) {
      t.notOk(result.ok);
      continue;
    }

    t.ok(result.ok);
    if (!result.ok) continue;
    t.strictSame(result.nodes.map(simplify), c.trees, c.msg);
  }

  t.end();
});
