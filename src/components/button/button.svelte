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
  export let prevent = false;
  export let inline = false;
  export let text = false;

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
  :global(.btn.btn-inline) {
    display: inline-flex;
  }
</style>

<button
  {style}
  {disabled}
  class={`btn ${block ? 'btn-block' : ''} ${icon ? 'btn-icon' : ''} 
          btn-${type} btn-${shape} btn-${color} btn-${size} 
          ${inline ? 'btn-inline' : ''}
          ${text ? 'btn-text' : ''}
          ${className}`}
  on:mousedown={(evt) => {}}
  {title}
  area-label={ariaLabel || title}
  on:click={(evt) => {
    hit = [evt.offsetX, evt.offsetY];
    if (prevent) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    if (delay) {
      setTimeout(() => {
        dispatch('click', evt);
      }, delay);
    } else {
      dispatch('click', evt);
    }
  }}>
  <Ripple bind:hit />
  <slot />

</button>
