<script>
  export let label = undefined;
  export let value = undefined;
  export let onClick = undefined;
  export let type = "text";
</script>

<style lang="scss">
  .block {
    margin: 0 3px;

    .label {
      font-size: 0.7rem;
      line-height: 0.9rem;
    }
    .value {
      font-size: 1.2rem;
      font-weight: 700;
      small {
        font-weight: bold !important;
      }
    }
    label div {
      opacity: 0.7;
    }
    &.clickable {
      border-bottom: dotted 1px var(--color-faded);
    }
    &.type-box {
      background-color: var(--color-faded);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
      min-height: 90px;
      min-width: 90px;
      border-radius: 20px;
      padding: 10px;
    }
  }
</style>

<div
  class="{onClick ? 'clickable' : ''} type-{type} block"
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
    {#if (value || '').length > 6}
      <small>{value}</small>
    {:else}{value}{/if}
    <slot name="value" />
  </div>
</div>
