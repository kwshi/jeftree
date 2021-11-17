<script lang="ts">
  import Node from "./Node.svelte";
  import type * as Syntax from "../lib/parser/syntax";

  export let nodes: Syntax.Node[] = [];
  let pos: { x: number; y: number }[] = [];

  $: if (nodes.length !== pos.length)
    pos = Array.from(Array(nodes.length), () => ({ x: 0, y: 0 }));
</script>

<div class="children">
  <svg class="branches">
    {#each pos as p}
      <!-- TODO detect center position-->
      <line x1={p.x} y1={p.y - 1} x2="50%" y2={1} stroke="black" />
    {/each}
  </svg>
  {#each nodes as child, i}
    <Node node={child} on:move={(e) => void (pos[i] = e.detail)} />
  {/each}
</div>

<style>
  .children {
    padding-top: 1.5rem;
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: flex-start;
    position: relative;
  }

  .branches {
    position: absolute;
    width: 100%;
    height: 1.5rem;
    top: 0;
  }
</style>
