<script>
  import Icon from "../icon.svelte";
  export let buttons = [];
  export let size = "sm";
</script>

{#if buttons.length}
  <div class="btn-group w-100">
    {#each buttons as button, index (button.label + button.icon)}
      <button
        class="btn {button.active ? 'active' : ''} btn-{size}"
        on:click={button.click}>
        {#if button.label}
          {button.label}
        {:else if button.icon}
          <i class="zmdi zmdi-{button.icon}" />
        {/if}
      </button>
    {/each}
  </div>
{/if}
