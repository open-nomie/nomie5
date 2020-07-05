<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let size = "md";
  export let type = "solid";
  export let shape = "rounded";
  export let color = "primary";
</script>

<style lang="scss">

</style>

<button
  class={`btn btn-${shape} btn-${color} btn-${size}`}
  on:click={() => {
    dispatch('click');
  }}>
  <slot />
</button>
