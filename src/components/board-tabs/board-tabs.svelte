<script>
  import { createEventDispatcher, onMount } from "svelte";

  // components
  import NHScroller from "../h-scroller/h-scroller.svelte";
  import NIcon from "../icon/icon.svelte";
  import Elephant from "../elephant.svelte";

  import { TrackerStore } from "../../store/trackers";

  export let boards = [];
  export let active = undefined;

  const dispatch = createEventDispatcher();

  const state = {
    active: null,
    activeIndex: 0,
    hasTimers: false
  };

  // When board size changes
  $: if (boards.length && active) {
    console.log("Boards active changed", active);
    boards.forEach((b, index) => {
      if (b.id == active && b.id !== "all" && b.id !== "_timers") {
        console.log("Setting activeindex", index);
        state.activeIndex = index; // all
      }
    });
  }

  $: if ($TrackerStore) {
    toggleTimerBoard();
  }

  function toggleTimerBoard() {
    let timers = Object.keys($TrackerStore).filter(tag => {
      let tracker = $TrackerStore[tag];
      return tracker.started;
    });
    state.hasTimers = timers.length ? true : false;
  }

  onMount(() => {
    toggleTimerBoard();
  });

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
  @keyframes pulse {
    0% {
      background-color: var(--color-red);
      opacity: 0.55;
    }
    50% {
      background-color: var(--color-red);
      opacity: 1;
    }
    100% {
      background-color: var(--color-red);
      opacity: 0.55;
    }
  }
  .timer-bar {
    position: fixed;
    animation: pulse 1s infinite;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    font-size: 12px;
    background-color: var(--color-red);
    z-index: 2000;
  }
</style>

{#if state.hasTimers}
  <div
    class="timer-bar clickable"
    on:click={() => {
      console.log('Show Timers');
    }} />
  <div class="pt-2" />
{/if}
<NHScroller activeIndex={state.activeIndex} className="n-board-tabs">
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
