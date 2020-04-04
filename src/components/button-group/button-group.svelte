<script>
  import Icon from "../icon.svelte";
  export let buttons = [];
  export let size = "sm";
  export let labelClass = "";
  export let inverse = false;
</script>

{#if buttons.length}
  <div class="btn-group w-100 {inverse ? 'inverse' : ''}">
    {#each buttons as button, index (button.label + button.icon)}
      <button
        class="btn {button.active ? 'active' : ''} btn-{size}
        "
        on:click={button.click}>
        {#if button.label}
          <div class={labelClass}>{button.label}</div>
        {:else if button.icon}
          <i class="zmdi zmdi-{button.icon} {labelClass}" />
        {/if}
      </button>
    {/each}
  </div>
{/if}
