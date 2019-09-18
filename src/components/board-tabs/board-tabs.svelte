<script>
  import { createEventDispatcher } from "svelte";

  // components
  import NHScroller from "../h-scroller/h-scroller.svelte";

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

</style>

<NHScroller activeIndex={data.activeIndex} className="n-board-tabs">
  {#each boards as board}
    <button
      class="tab board-{board.id}
      {board.id == active ? 'active' : 'inactive'}"
      on:click={() => {
        dispatch('tabTap', board);
      }}>
      {board.label}
    </button>
  {/each}
  <button
    class="tab add-board"
    on:click={() => {
      dispatch('create');
    }}>
    <i class="zmdi zmdi-plus" />
  </button>
  <slot name="right" />
</NHScroller>
