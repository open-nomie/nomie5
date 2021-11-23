<style lang="postcss" global>
  .form-group {
    @apply rounded-xl;
    @apply overflow-hidden;
    @apply mb-3;
  }
  .form-group.no-bottom {
    @apply mb-0;
  }
  .form-group.pad {
    @apply mx-3;
  }
  .form-group.solid {
    
    @apply bg-white dark:bg-gray-900;
  }
  .form-group.tint {
    @apply bg-gray-100 dark:bg-gray-800;
  }
</style>

<script lang="ts">
  export let className: string = "";
  export let style: string = "";
  export let solid: boolean = true;
  export let tint: boolean = false;
  export let pad: boolean = false;
</script>

<div
  class:pad
  class:tint
  class:solid
  class="form-group {className}"
  style="{style}"
>
  <slot />
</div>
