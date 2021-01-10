<script>
  import Button from "../button/button.svelte";

  export let buttons = [];
  export let size = "sm";
  export let labelClass = "";
  export let inverse = false;
  // export let color = undefined;
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


<div class="nbtn-group {inverse ? 'inverse' : ''} {className}" {style}>
  {#if buttons.length}
    {#each buttons as button}
      {#if button.hide !== false}
        <Button
          color=""
          title={button.label}
          delay={0}
          {size}
          className={button.active ? 'active' : 'text-solid-1'}
          on:click={button.click}>
          {#if button.icon}
            <NIcon name={button.icon} className={`${button.active ? 'fill-primary-bright' : 'fill-inverse-1'} ${labelClass}`} />
          {:else if button.label}
            <div class={labelClass}>{button.label}</div>
          {/if}
          {#if button.notify}
            <div class="notify"></div>
          {/if}
        </Button>
      {/if}
    {/each}
  {:else}
    <slot />
  {/if}
</div>
