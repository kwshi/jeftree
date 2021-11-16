<script lang="ts">
  import * as Parser from "../lib/parser";
  import * as CmView from "@codemirror/view";
  import * as CmState from "@codemirror/state";
  import { onMount } from "svelte";

  let value: string = "";
  let container: HTMLDivElement;

  const field = CmState.StateField.define({
    create: () => {
      return 0;
    },
    update: (value, tr) => {
      console.log(value, tr);
      return value;
    },
  });
  const initState = CmState.EditorState.create({
    doc: "yo",
    extensions: field,
  });

  onMount(() => {
    const editor = new CmView.EditorView({
      state: initState,
      parent: container,
    });
  });
</script>

<textarea bind:value />

<div id="editor" bind:this={container} />

<!--
<pre>
{JSON.stringify(Parser.parse(value), undefined, 2)}
</pre>
-->
