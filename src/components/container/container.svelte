<script lang="ts">
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md'
  export let className: string = ''
</script>

<style global lang="postcss">
  .nui-container-sm {
    @apply max-w-screen-md;
  }
  .nui-container-xs {
    @apply max-w-screen-sm;
  }
  .nui-container-md {
    @apply max-w-screen-lg;
  }
  .nui-container-lg {
    @apply max-w-screen-xl;
  }
  .nui-container-xl {
    max-width: 1200px;
  }
  .nui-container {
    @apply w-full;
    @apply mx-auto;
  }
</style>

<div class={`nui-container nui-container-${size} ${className}`}>
  <slot />
</div>
