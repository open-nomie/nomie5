<script lang="ts">
  import { onMount } from "svelte";

  export let className = "";
  export let center = false;
  export let inset = false;
  export let pad = false;
  export let style = "";
  export let hideLine: boolean = false;

  let hasContent: boolean = false;

  onMount(() => {
    if (arguments[1].$$slots) {
      hasContent = true;
    }
  });
</script>

<div
  {style}
  class:inset
  class:show-line={!hideLine}
  class:pad
  class:center
  class:hasContent
  class="divider {className}"
>
  <slot />
</div>

<style lang="postcss" global>
  .divider {
    position: relative;
    padding: 0;
    margin: 0;
    z-index: 100;
    width: 100%;
    @apply w-full;
    @apply bg-gray-500;
    @apply bg-opacity-20;
    height: 2px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .divider.show-line {
    @apply border-t border-gray-100 dark:border-gray-900 border-opacity-50;
  }
  .divider.center {
    /* margin-left: 2rem;
    margin-right: 2rem; */
  }
  .divider.inset {
    margin-left: 16px;
    max-width: calc(100% - 16px);
  }
  .divider.hasContent {
    font-size: 0.9rem;
    color: var(--color-inverse-2);
  }
  .divider.pad {
    padding: 0.6rem 1rem;
  }
</style>
