<script>
  import { createEventDispatcher } from "svelte";
  import Ripple from "./Ripple.svelte";

  const dispatch = createEventDispatcher();

  export let size = "md";
  export let type = "solid";
  export let shape = "rounded";
  export let color = "primary";
  export let className = "";
  export let block = false;
  export let style = "";
  export let disabled = false;

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
  class={`btn ${block ? 'btn-block' : ''} btn-${type} btn-${shape} btn-${color} btn-${size} ${className}`}
  on:mousedown={(evt) => {
    console.log(evt);
    console.log(`${evt.offsetX},${evt.offsetY}`);
    hit = [evt.offsetX, evt.offsetY];
  }}
  on:click={(evt) => {
    dispatch('click');
  }}>
  <Ripple bind:this={ripple} bind:hit />
  <slot />

</button>
