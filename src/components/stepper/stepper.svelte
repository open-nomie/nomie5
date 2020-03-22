<script>
  export let steps = 0;
  export let current = 0;

  let _steps = [];
  $: if (steps || current) {
    _steps = [];
    for (let i = 0; i < steps; i++) {
      _steps.push(current >= i);
    }
  }
</script>

<style lang="scss">
  .n-stepper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;
    padding: 4px;
    .step {
      transition: all 0.2s ease-in-out;
      border: solid 1px var(--color-translucent);
      opacity: 0.5;
      height: 4px;
      flex-grow: 1;
      flex-shrink: 1;
      margin: 0 2px;
      border-radius: 3px;
      &.active {
        background-color: var(--color-translucent);
        opacity: 1;
        height: 6px;
      }
    }
  }
</style>

<div class="n-stepper">
  {#each _steps as step}
    <div class="step {step ? 'active' : 'inactive'}" />
  {/each}
</div>
