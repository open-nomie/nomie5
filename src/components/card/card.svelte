<script>
  export let className = "";
  export let style = "";
</script>

<style>
  .n-card {
    background-color: var(--color-solid);
    box-shadow: var(--box-shadow-tight);
    border-radius: 6px;
    margin: 8px;
    overflow: hidden;
  }
</style>

<div class="n-card {className}" {style}>
  <slot />
</div>
