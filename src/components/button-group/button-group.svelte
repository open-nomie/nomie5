<script lang="ts">
  import Button from '../button/button.svelte'
  import NIcon from '../icon/icon.svelte'

  import './button-group.css'

  export let buttons = []
  export let size = 'sm'
  export let labelClass = ''
  export let inverse = false
  export let className = ''
  export let style = ''
  export let scrollable = false
</script>

<div
  class="nbtn-group {inverse ? 'inverse' : ''}
  {scrollable ? 'scrollable' : ''}
  {className}"
  {style}>
  {#if buttons.length}
    {#each buttons as button}
      {#if button.hide !== false}
        <Button
          color=""
          title={button.label}
          delay={0}
          {size}
          className={button.active ? 'active' : 'text-solid-1'}
          on:click={button.click}>
          {#if button.icon}
            <NIcon
              name={button.icon}
              className={`${button.active ? 'fill-primary-bright' : 'fill-inverse-1'} ${labelClass}`} />
          {:else if button.label}
            <div class={labelClass}>{button.label}</div>
          {/if}
          {#if button.notify}
            <div class="notify" />
          {/if}
        </Button>
      {/if}
    {/each}
  {:else}
    <slot />
  {/if}
</div>
