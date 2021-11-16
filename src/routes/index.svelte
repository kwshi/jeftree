<script lang="ts">
  import * as Parser from "../lib/parser";

  let value: string = "";

  $: {
    console.log("parse result", Parser.parse(Parser.lex(value)));
  }
</script>

<textarea bind:value />

<!--
<pre>
{JSON.stringify(Parser.parse(value), undefined, 2)}
</pre>
-->
