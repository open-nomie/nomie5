<script lang="ts">
  import Text from '../text/text.svelte'

  export let style: string = ''
  export let solo: boolean = false
  export let transparent: boolean = false
  export let className: string = ''
  export let title: string = undefined
  export let outside: boolean = false
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
  {style}>
  {#if title && !outside}
    <Text size="xs" className="pt-3 px-3 pb-2" bold faded>
      {title.toUpperCase()}
    </Text>
  {/if}
  <slot />
</div>
