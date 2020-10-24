<script>
  export let className = "";
  export let style = "";
</script>

<style lang="scss">

</style>

<div class="n-toolbar-grid {className} w-100" {style}>
  <div class="left">
    <slot name="left" />
  </div>
  <div class="main truncate">
    <slot name="main" />
    <slot />
  </div>
  <div class="right">
    <slot name="right" />
  </div>
</div>
