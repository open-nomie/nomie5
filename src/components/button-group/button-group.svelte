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
    // if (inverse && color && active) {
    //   return `background-color:${color} !important; color:#FFF; box-shadow: 0px 3px 10px -3px ${color};`;
    // } else {
    //   return ``;
    // }
    return "";
  }
</script>

<style lang="scss">
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

<div class="nbtn-group {inverse ? 'inverse' : ''} {className}" {style}>
  {#if buttons.length}
    {#each buttons as button, index (button.label + button.icon)}
      {#if button.hide !== false}
        <Button color="" delay={0} {size} className={button.active ? 'active' : 'text-solid-1'} on:click={button.click}>
          {#if button.label}
            <div class={labelClass}>{button.label}</div>
          {:else if button.icon}
            <NIcon name={button.icon} className={labelClass} />
          {/if}
        </Button>
      {/if}
    {/each}
  {:else}
    <slot />
  {/if}
</div>
