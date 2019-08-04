<script>
  import NHScroller from "../h-scroller/h-scroller.svelte";

  export let value = "#20699d";
  export let colors = [
    "#369DD3",
    "#20699d",
    "#FF6900",
    "#FCB900",
    "#7BDCB5",
    "#8ED1FC",
    "#0693E3",
    "#ABB8C3",
    "#EB144C",
    "#795548",
    "#F78DA7",
    "#9900EF",
    "#369DD3",
    "#558B2F",
    "#FF1744",
    "#F50057",
    "#D500F9",
    "#6200EA",
    "#304FFE",
    "#0D47A1",
    "#388E3C",
    "#64DD17",
    "#FFAB00",
    "#FF3D00",
    "#546E7A",
    "#757575"
  ];

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
    width: $ballHeight * 0.5;
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
