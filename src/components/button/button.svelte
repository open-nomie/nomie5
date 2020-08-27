<script>
  import { createEventDispatcher } from "svelte";
  import Ripple from "./ripple.svelte";

  const dispatch = createEventDispatcher();

  export let size = "md";
  export let type = "solid";
  export let shape = "rounded";
  export let color = "primary";
  export let className = "";
  export let block = false;
  export let style = "";
  export let disabled = false;
  export let delay = 300;
  export let icon = false;
  export let title = undefined;
  export let ariaLabel = undefined;

  let hit;
  let ripple;
</script>

<style>
  button {
    position: relative;
    overflow: hidden;
  }
  svg {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
  }
</style>

<button
  {style}
  {disabled}
  class={`btn ${block ? 'btn-block' : ''} ${icon ? 'btn-icon' : ''} btn-${type} btn-${shape} btn-${color} btn-${size} ${className}`}
  on:mousedown={(evt) => {
    hit = [evt.offsetX, evt.offsetY];
  }}
  {title}
  area-label={ariaLabel || title}
  on:click={(evt) => {
    setTimeout(() => {
      dispatch('click', evt);
    }, delay);
  }}>
  <Ripple bind:this={ripple} bind:hit />
  <slot />

</button>
