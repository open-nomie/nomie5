<script>
  export let buttons = [];
  export let size = "sm";
  export let labelClass = "";
  export let inverse = false;
  export let color = undefined;
  export let className = "";

  import NIcon from "../icon/icon.svelte";

  function getStyle(active) {
    if (inverse && color && active) {
      return `background-color:${color} !important; color:#FFF; box-shadow: 0px 3px 10px -3px ${color};`;
    } else {
      return ``;
    }
  }
</script>

<style lang="scss">
  .btn-group {
    &.inverse {
      button {
        color: var(--color-inverse-2);
        opacity: 0.8;
        &.active {
          // border: solid 1px var(--color-primary-faded);
        }
      }
    }
  }
</style>

{#if buttons.length}
  <div class="btn-group w-100 {inverse ? 'inverse' : ''} {className}">
    {#each buttons as button, index (button.label + button.icon)}
      <button
        class="btn {button.active ? 'active' : ''} btn-{size}
        "
        style={getStyle(button.active)}
        on:click={button.click}>
        {#if button.label}
          <div class={labelClass}>{button.label}</div>
        {:else if button.icon}
          <NIcon name={button.icon} className={labelClass} />
        {/if}
      </button>
    {/each}
  </div>
{/if}
