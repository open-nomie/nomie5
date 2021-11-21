<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let value;
  export let colors: Array<string> = ["green", "orange", "red", "blue"];
  export let size = 24;
  export let className = "";
  const dispatch = createEventDispatcher();

  let selected;
  $: if (value && value !== selected) {
    selected = value;
  }
</script>

<style lang="postcss">
  .tiny-color-picker button {
	 border: none;
	 padding: 0;
	 margin: 4px;
	 border-radius: 50%;
}
 .tiny-color-picker button.not-selected {
	 border-width: 2px;
	 border-style: solid;
	 background-color: transparent;
}
 .tiny-color-picker button.border-green {
	 border-color: var(--color-green);
}
 .tiny-color-picker button.border-red {
	 border-color: var(--color-red);
}
 
</style>

<div class="tiny-color-picker flex {className}">
  {#each colors as color}
    <button
      aria-label={color}
      style={`height:${size}px;width:${size}px;`}
      on:click={() => {
        dispatch('change', color);
      }}
      class={`${selected == color ? `selected bg-${color}` : `not-selected border-${color}`}`} />
  {/each}
</div>
