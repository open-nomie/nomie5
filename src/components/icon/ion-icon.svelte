<script lang="ts">
  export let icon: any = undefined
  export let className: string = ''
  export let style: string = ''
  export let title: string = 'Icon'
  export let size: number = 24
</script>

<style global>
  .ion-icon {
    @apply inline-flex;
    @apply items-center;
    @apply justify-center;
  }
</style>

{#if icon}
  <span
    class="ion-icon {className} text-current fill-current"
    {style}
    aria-label={title}>
    {#if icon}
      <svelte:component
        this={icon}
        height={`${size || 24}px`}
        width={`${size || 24}px`} />
    {:else if name}
      <svelte:component
        this={dynamicIcon}
        height={`${size || 24}px`}
        width={`${size || 24}px`} />
    {/if}
  </span>
{/if}
