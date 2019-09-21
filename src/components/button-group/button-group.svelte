<script>
  export let buttons = [];
  export let size = "sm";
</script>

{#if buttons.length}
  <div class="btn-group w-100">
    {#each buttons as button (button.label)}
      <button
        class="btn {button.active ? 'active' : ''} btn-{size}"
        on:click={button.click}>
        {button.label}
      </button>
    {/each}
  </div>
{/if}
