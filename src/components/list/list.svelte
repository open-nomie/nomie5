<script lang="ts">
  import Text from "../text/text.svelte";

  export let style: string = "";
  export let solo: boolean = false;
  export let transparent: boolean = false;
  export let className: string = "";
  export let title: string = undefined;
  export let outside: boolean = false;
</script>

{#if title && outside}
  <div class="font-bold text-sm pb-2 px-3 pt-3 text-gray-500">
    {title.toUpperCase()}
  </div>
{/if}
<div
  class="n-list {solo ? 'solo' : ''}
  {transparent ? 'transparent' : ''}
  {className}"
  {style}
>
  {#if title && !outside}
    <Text size="xs" className="pt-3 px-3 pb-2" bold faded>
      {title.toUpperCase()}
    </Text>
  {/if}
  <slot />
</div>

<style global lang="postcss">
  .n-list {
    @apply bg-white dark:bg-gray-900;
    margin-bottom: 16px;
    overflow: hidden;
    @apply lg:rounded-lg;
  }
  .n-list.transparent,
  .n-list[transparent] {
    background-color: transparent;
  }
  .n-list.solo,
  .n-list [solo] {
    width: calc(100% - 16px);
    margin: 8px;
    box-shadow: var(--box-shadow);
    @apply rounded-xl;
    overflow: hidden;
    @apply bg-gray-900;
    padding: 0px 0;
  }
  .n-list.framed {
    /* border: solid 1px var(--color-solid-2) !important; */
  }
</style>
