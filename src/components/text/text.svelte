<script>
  export let size = "sm";
  export let color = undefined;
  export let bold = undefined;
  export let medium = undefined;
  export let tag = "span";
  export let className = "";
</script>

<style type="text/scss">
  .n-text {
    color: var(--color-inverse);
    line-height: 100%;
    &.xs {
      font-size: 0.65rem;
    }
    &.sm {
      font-size: 0.85rem;
      line-height: 0.98rem;
    }
    &.md {
      font-size: 1rem;
    }
    &.lg {
      font-size: 1.25rem;
    }
    &.xl {
      font-size: 2rem;
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
    class="n-text {size || 'sm'}
    {className}
    {bold ? 'font-weight-bold' : ''}
    {medium ? 'font-weight-medium' : ''}">
    <slot />
  </span>
{:else}
  <div
    class="n-text {size || 'sm'}
    {className}
    {bold ? 'font-weight-bold' : ''}
    {medium ? 'font-weight-medium' : ''}">
    <slot />
  </div>
{/if}
