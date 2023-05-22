<script lang="ts">
  import Children from "./Children.svelte";
  import * as Syntax from "../lib/tree/node";
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher<{ move: { x: number; y: number } }>();

  export let node: Syntax.Node;

  let root: HTMLDivElement;
  const resize = () => {
    dispatch("move", {
      x: root.offsetLeft + root.offsetWidth / 2,
      y: root.offsetTop,
    });
  };

  onMount(resize);
</script>

<svelte:window on:resize={resize} />

<div class="node" class:parent={node.data.type === Syntax.Tag.Parent}>
  <div class="root" bind:this={root}>
    {#if node.label.endsWith("'")}
      {node.label.slice(0, -1)}&prime;
    {:else}
      {node.label}
    {/if}
  </div>
  {#if node.data.type === Syntax.Tag.Parent}
    <Children nodes={node.data.children} />
  {:else if node.data.type === Syntax.Tag.Leaf}
    {#if node.data.leaf === null}
      <div class="leaf empty">&empty;</div>
    {:else}
      <div class="leaf">{node.data.leaf}</div>
    {/if}
  {/if}
</div>

<style lang="pcss">
  .node {
    display: grid;
    grid-template-rows: repeat(2, auto);
    justify-items: center;
  }

  .leaf:not(.empty) {
    font-style: italic;
  }
</style>
