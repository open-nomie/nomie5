<script>
  export let className = ''
  export let style = ''
  import './toolbar.css'
</script>

<style global lang="postcss">
  .n-toolbar-grid .right [slot] {
    @apply flex;
    @apply items-center;
    @apply justify-end;
  }
</style>

<div class="n-toolbar-grid {className}" {style}>
  <div class="left">
    <slot name="left" />
  </div>
  <div class="truncate main">
    <slot name="main" />
    <slot />
  </div>
  <div class="flex items-center justify-end text-right right">
    <slot name="right" />
  </div>
</div>
