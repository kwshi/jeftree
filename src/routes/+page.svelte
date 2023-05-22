<script lang="ts">
  import * as Parser from "../lib/parser";
  import type * as Syntax from "../lib/tree/node";
  import * as CmView from "@codemirror/view";
  import * as CmState from "@codemirror/state";
  import * as CmGutter from "@codemirror/gutter";
  import { onMount } from "svelte";

  import Node from "../components/Node.svelte";

  let value: string = `
  [ CP
    []
    [ C'
      [C]
      [ TP [] [T' [T] [VoiceP [DP [D' [D] [NP//Jeff]]] [Voice' [Voice] [VP [] [V' [V/graded] [DP [] [D' [D/our] [NP [] [N' [AdjP [Adj' [Adj/syntax]]] [N' [N/papers]]]]]]]]]]]
    ]
  ]
  ]
  `;
  let container: HTMLDivElement;

  const field = CmState.StateField.define({
    create: () => {
      return null;
    },
    update: (_, tr) => {
      if (tr.docChanged) value = tr.newDoc.toString();
      return null;
    },
  });
  const initState = CmState.EditorState.create({
    doc: value,
    extensions: [field, CmGutter.lineNumbers()],
  });

  onMount(() => {
    const editor = new CmView.EditorView({
      state: initState,
      parent: container,
    });
  });

  let tree: readonly Syntax.Node[] = [];

  $: {
    const lexResult = Parser.lex(value);
    const result = Parser.parse(lexResult.tokens);
    console.log(lexResult);
    tree = result.nodes;
  }
</script>

<div id="editor" bind:this={container} />

{#each tree as node}
  {#key node}
    <!-- TODO maybe key'ing & recreating every time contents are changed is inefficient, but maybe who cares? we do this because of size updates-- updating a left child doesn't remeasure the location of a right child, for some reason. -->
    <Node {node} />
  {/key}
{/each}

<style>
  :root {
    font-family: "EB Garamond";
  }
</style>
