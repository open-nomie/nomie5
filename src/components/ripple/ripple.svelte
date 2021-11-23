<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Ripple from "./ripple-ripple.svelte";

  export let className = "";
  export let style = "";
  export let start:boolean = false;
  export let center:boolean = true;
  export let end: boolean = false;
  export let id: string = "";

  const dispatch = createEventDispatcher();
  let hit: Array<any>;
</script>

<style lang="postcss" global>
  .ripple-btn {
    @apply flex;
    @apply items-center;
    @apply justify-center;
    position: relative;
  }
  .ripple-btn.start {
    @apply justify-start;
  }
  .ripple-btn.end {
    @apply justify-end;
  }
</style>

<button
  {id}
  class:center
  class:start
  class:end
  class="ripple-btn {className}"
  {style}
  on:click|preventDefault|stopPropagation={(evt) => {
    hit = [evt.offsetX, evt.offsetY];
    dispatch('click');
  }}>
  <Ripple bind:hit />
  <slot />
</button>
