<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let size = "md";
  export let type = "solid";
  export let shape = "rounded";
  export let color = "primary";
  export let className = "";
  export let block = false;
</script>

<style>

</style>

<button
  class={`btn ${block ? 'btn-block' : ''} btn-${type} btn-${shape} btn-${color} btn-${size} ${className}`}
  on:click={() => {
    dispatch('click');
  }}>
  <slot />
</button>
