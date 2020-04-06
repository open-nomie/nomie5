<script>
  export let label = undefined;
  export let value = undefined;
  export let onClick = undefined;
  export let type = "text";
  export let className = "";
  export let inverse = false;
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
      line-height: 1rem;
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

    &.inverse {
      &.type-box,
      &.type-row {
        background-color: var(--color-darkest);
      }
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
    &.type-row {
      background-color: var(--color-faded);
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      border-radius: 6px;
      min-height: 40px;
      .value {
        font-size: 1.1rem !important;
        small {
          font-size: 1.1rem !important;
        }
      }
      .label {
        font-size: 0.9rem;
      }
    }
  }
</style>

<div
  class="{onClick ? 'clickable' : ''} type-{type} block {className}
  {inverse ? 'inverse' : ''}"
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
