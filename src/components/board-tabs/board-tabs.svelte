<script>
  import { createEventDispatcher } from "svelte";

  // components
  import NHScroller from "../h-scroller/h-scroller.svelte";
  import NIcon from "../icon/icon.svelte";
  import Elephant from "../elephant.svelte";

  export let boards = [];
  export let active = undefined;

  const dispatch = createEventDispatcher();

  let data = {
    active: null,
    activeIndex: 0
  };

  $: if (boards.length && active) {
    boards.forEach((b, index) => {
      if (b.id == active) {
        data.activeIndex = index; // all
      }
    });
  }

  const methods = {
    asArray() {
      return;
    },
    setActive(id) {}
  };
</script>

<style lang="scss">
  .add-board {
    &:before {
      display: none;
    }
  }
</style>

<NHScroller activeIndex={data.activeIndex} className="n-board-tabs">
  {#each boards as board}
    <button
      class="tab board-{board.id}
      {board.id == active ? 'active' : 'inactive'}"
      on:click={() => {
        dispatch('tabTap', board);
      }}>
      {#if board.label == 'All'}
        <Elephant size={18} />
      {:else}{board.label}{/if}
    </button>
  {/each}
  <button
    class="tap-icon btn btn-clear px-2"
    on:click={() => {
      dispatch('create');
    }}>
    <NIcon name="newTab" className="fill-primary-bright" size={20} />
  </button>
  <slot />
  <slot name="right" />
</NHScroller>
