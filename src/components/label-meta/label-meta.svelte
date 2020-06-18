<script>
  import { tokenize } from "nomie-utils";

  export let str;
  export let titleClass = "";

  let tokenized;
  let label = "";
  let meta = "";

  let lastStr;
  $: if (str !== lastStr) {
    lastStr = str;
    tokenized = tokenize(str);
    label = tokenized
      .filter(t => {
        return t.type == "generic";
      })
      .map(t => {
        return t.raw;
      })
      .join(" ")
      .trim();

    meta = tokenized
      .filter(t => {
        return t.type !== "generic";
      })
      .map(t => {
        return t.raw;
      })
      .join(" ")
      .trim();
  }
</script>

<div class="n-label-meta">
  {#if label.length}
    <div class="title {titleClass}">{label}</div>
  {/if}
  {#if meta.length && label.length}
    <div class="note">{meta}</div>
  {:else if meta.length}
    <div class="title {titleClass}">{meta}</div>
  {/if}
</div>
