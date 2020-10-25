<script>
  import { createEventDispatcher, onMount } from "svelte";

  // components
  import NHScroller from "../h-scroller/h-scroller.svelte";
  import NIcon from "../icon/icon.svelte";
  import Elephant from "../elephant.svelte";

  import { TrackerStore } from "../../store/tracker-store";
  import Spacer from "../spacer/spacer.svelte";
  import Row from "../row/row.svelte";

  export let boards = [];
  export let active = undefined;

  const dispatch = createEventDispatcher();

  const state = {
    active: null,
    activeIndex: 0,
    hasTimers: false,
  };

  // When board size changes
  $: if (boards.length && active) {
    boards.forEach((b, index) => {
      if (b.id == active && b.id !== "all" && b.id !== "_timers") {
        state.activeIndex = index; // all
      }
    });
  }

  onMount(() => {});

  const methods = {
    asArray() {
      return;
    },
    setActive(id) {},
  };
</script>

<style lang="scss">
  .add-board {
    &:before {
      display: none;
    }
  }
  button.inactive {
    opacity: 0.8;
    color: var(--color-grey-4);
  }
</style>

{#if boards.length === 1}
  <div class="n-row n-board-tabs flex-grow flex-shrink" data-scroll="0">
    <Spacer />
    <Elephant size={16} />
    <Spacer />
  </div>
{:else}
  <NHScroller activeIndex={state.activeIndex} centerIfPossible className="n-board-tabs">
    {#each boards as board}
      <button
        class="tab board-{board.id}
        {board.id == active ? 'selected' : 'inactive'}"
        on:longtap={() => {
          dispatch('longPress', board);
        }}
        on:click={() => {
          dispatch('tabTap', board);
        }}>
        {#if board.id == 'all'}
          <Elephant size={16} />
          <!-- <NIcon name="grid" className="fill-primary-bright" size="18" /> -->
        {:else}{board.label}{/if}
      </button>
    {/each}
    <slot />
    <slot name="right" />
  </NHScroller>
{/if}
