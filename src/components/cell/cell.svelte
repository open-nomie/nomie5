<script>
  export let direction = "row";
  export let gap = false;
  export let className = null;
</script>

<style lang="scss">
  .n-cell .gap-2 {
  }
</style>

<div class="n-cell d-flex flex-{direction} gap-{gap} {className}">
  <slot />
</div>
