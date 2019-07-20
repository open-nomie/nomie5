<script>
  import { createEventDispatcher } from "svelte";

  export let boards = [];
  export let active = undefined;

  const dispatch = createEventDispatcher();

  let data = {
    active: null
  };

  const methods = {
    asArray() {
      return;
    },
    setActive(id) {}
  };
</script>

<style lang="scss">
  .n-board-tabs {
    background-color: var(--color-solid);
    border-bottom: solid 1px var(--color-faded);
    width: 100%;
    flex-grow: 1;
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    height: 50px;
    .mask {
      padding-left: 10px;
      height: 100%;
      width: fit-content;
      display: flex;
      align-content: center;
    }
    .tab {
      color: var(--color-inverse-2);
      border: none;
      background: transparent;
      padding: 4px 6px;
      min-width: 40px;
      white-space: pre;
      &.active {
        border-bottom: solid 2px var(--color-inverse);
      }
    }
  }
</style>

<div class="n-board-tabs">
  <div class="mask">
    {#each boards as board}
      <button
        class="tab {board.id == active ? 'active' : 'inactive'}"
        on:click={() => {
          dispatch('tabTap', board);
        }}>
        {board.label}
      </button>
    {/each}
    <button
      class="tab"
      on:click={() => {
        dispatch('create');
      }}>
      <i class="zmdi zmdi-plus" />
    </button>
  </div>
</div>
