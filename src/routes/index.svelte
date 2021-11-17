<script lang="ts">
  import * as Parser from "../lib/parser";
  import * as Syntax from "../lib/parser/syntax";
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
    if (lexResult.ok) {
      const result = Parser.parse(lexResult.tokens);
      if (result.ok) {
        tree = result.nodes;
      }
    }
  }
</script>

<div id="editor" bind:this={container} />

{#each tree as node}
  {#key node}
    <!-- TODO maybe key'ing & recreating every time contents are changed is inefficient, but maybe who cares? -->
    <Node {node} />
  {/key}
{/each}
