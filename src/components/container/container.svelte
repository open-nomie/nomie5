<script lang="ts">
  export let size: "xs" | "sm" | "md" = "md";
</script>

<style lang="postcss">
  .container-sm {
    @apply max-w-screen-sm;
  }
  .container-xs {
     @apply max-w-lg;
  }
  .container {
    @apply max-w-screen-md;
    @apply mx-auto;
  }
</style>

<div class={`container container-${size}`}><slot /></div>