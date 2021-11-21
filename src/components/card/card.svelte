<script>
  import Text from "../text/text.svelte";

  export let className = "";
  export let style = "";
  export let title = undefined;
  export let pad = false;
  export let compact = false;
  export let shadow = true;
</script>

<style global>
  .n-card {
    background-color: var(--color-solid);
    box-shadow: var(--box-shadow-tight);
    border-radius: 6px;
    overflow: hidden;
  }
  .n-card.compact .title {
    font-size: 0.7em;
  }
</style>

<div class="n-card {className} {pad ? 'p-3' : ''} {compact ? 'comapct' : ''} {!shadow ? 'box-shadow-off' : ''}" {style}>
  {#if title}
    <Text size="sm" className="title {pad ? 'pb-3' : 'p-3'}" bold>{title}</Text>
  {/if}
  <slot />
</div>
