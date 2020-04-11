<script>
  import NHScroller from "../h-scroller/h-scroller.svelte";
  import DefaultColors from "../../modules/colors/colors";

  export let value = "#20699d";
  export let grid = false;
  export let colors = DefualtColors;

  $: selectedIndex = colors.indexOf(value) || 0;
</script>

<style lang="scss">
  $ballHeight: 40px;
  :global(.n-color-picker) {
    overflow: scroll;
    max-width: 100%;
    width: 90vw;
    min-width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    display: flex;
    background-color: var(--color-solid);
    padding: 8px 10px 8px 0;
  }
  :global(.n-color-picker button.color-btn) {
    width: $ballHeight;
    height: $ballHeight;
    flex-grow: 0;
    flex-shrink: 0;
    border-radius: $ballHeight * 0.5;
    border: solid 2px var(--color-solid);
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease-in-out;
    &.selected {
      transform: scale(1.2);
      box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.2);
      border: solid 1px var(--color-inverse);
    }
  }
</style>

{#if grid}
  <div class="n-grid n-color-picker" activeIndex={selectedIndex}>
    {#each colors as color, index}
      <button
        class="color-btn {color == value ? 'selected' : ''}"
        on:click={() => {
          value = color;
        }}
        style="background-color:{color}" />
    {/each}
  </div>
{:else}
  <NHScroller className="n-color-picker" activeIndex={selectedIndex}>
    {#each colors as color, index}
      <button
        class="color-btn {color == value ? 'selected' : ''}"
        on:click={() => {
          value = color;
        }}
        style="background-color:{color}" />
    {/each}
  </NHScroller>
{/if}
