<script>
  export let label = undefined;
  export let value = undefined;
  export let onClick = undefined;
</script>

<style lang="scss">
  .block {
    margin: 0 3px;

    .label {
      font-size: 0.7rem;
    }
    .value {
      font-size: 1.2rem;
      font-weight: 500;
    }
    &.clickable {
      border-bottom: dotted 1px var(--color-faded);
    }
  }
</style>

<div
  class={`${onClick ? 'clickable' : ''} block`}
  on:click={() => {
    if (onClick) {
      onClick();
    }
  }}>
  <div class="label">
    {#if label}{label}{/if}
    <slot name="label" />
  </div>
  <div class="value">
    {#if value}{value}{/if}
    <slot name="value" />
  </div>
</div>
