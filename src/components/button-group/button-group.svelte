<script>
  import Button from "../button/button.svelte";

  export let buttons = [];
  export let size = "sm";
  export let labelClass = "";
  export let inverse = false;
  export let color = undefined;
  export let className = "";
  export let style = "";

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
  :global(.btn-group .btn) {
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    font-size: 0.65rem;
    font-weight: 600;
  }
  // .btn-group {
  //   &.inverse {
  //     button {
  //       color: var(--color-inverse-2);
  //       opacity: 0.8;
  //       &.active {
  //         // border: solid 1px var(--color-primary-faded);
  //       }
  //     }
  //   }
  // }
</style>

{#if buttons.length}
  <div class="btn-group w-100 {inverse ? 'inverse' : ''} {className}" {style}>
    {#each buttons as button, index (button.label + button.icon)}
      {#if button.hide !== false}
        <Button
          delay={0}
          className="btn {button.active ? 'active' : ''} btn-{size}
          "
          style={getStyle(button.active)}
          on:click={button.click}>
          {#if button.label}
            <div class={labelClass}>{button.label}</div>
          {:else if button.icon}
            <NIcon name={button.icon} className={labelClass} />
          {/if}
        </Button>
      {/if}
    {/each}
  </div>
{/if}
