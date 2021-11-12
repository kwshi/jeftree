<script lang="ts">
  import * as Parser from "../lib/better-parser";

  let value: string = "";

  $: console.log(Parser.lex(value));
</script>

<textarea bind:value />

<!--
<pre>
{JSON.stringify(Parser.parse(value), undefined, 2)}
</pre>
-->
-->
