<script lang="ts">
  export let size: "xs" | "sm" | "md" = "md";
</script>

<style lang="postcss">
  .nui-container-sm {
    @apply max-w-screen-sm;
  }
  .nui-container-xs {
     @apply max-w-lg;
  }
  .nui-container {
    @apply max-w-screen-md;
    @apply mx-auto;
  }
</style>

<div class={`nui-container nui-container-${size}`}><slot /></div>