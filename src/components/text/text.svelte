<script>
  import { createEventDispatcher } from "svelte";

  export let size = "md";
  // export let color = undefined;
  export let bold = undefined;
  export let medium = undefined;
  export let tag = "div";
  export let className = "";
  export let faded = false;
  export let style = "";
  const dispatch = createEventDispatcher();
</script>

<style type="text/scss">
  .n-text {
    color: var(--color-inverse);
    line-height: 116%;
    white-space: normal;

    &.xs {
      font-size: 0.65rem;
    }
    &.sm {
      font-size: 0.85rem;
    }
    &.md {
      font-size: 1rem;
    }
    &.lg {
      font-size: 1.25rem;
    }

    &.faded {
      opacity: 0.5;
    }
    &.xl {
      font-size: 2rem;
    }
    &.xxl {
      font-size: 2.4rem;
    }
    &.font-weight-bold {
      font-weight: bold;
    }
    &.font-weight-medium {
      font-weight: 500;
    }
  }
</style>

{#if tag === 'span'}
  <span
    {style}
    on:click={() => {
      dispatch('click');
    }}
    class="n-text {size || 'sm'}
    {className}
    {faded ? 'faded ' : ''}
    {bold ? 'font-weight-bold ' : ''}
    {medium ? 'font-weight-medium ' : ''}">
    <slot />
  </span>
{:else}
  <div
    {style}
    on:click={() => {
      dispatch('click');
    }}
    class="n-text {size || 'sm'}
    {className}
    {faded ? 'faded ' : ''}
    {bold ? 'font-weight-bold ' : ''}
    {medium ? 'font-weight-medium ' : ''}">
    <slot />
  </div>
{/if}
