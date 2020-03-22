<script>
  import NToolbar from "../toolbar/toolbar.svelte";

  import { Lang } from "../../store/lang";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let searchTerm = null;
  export let hasResults = false;

  // FIre off changes when input changes
  const fireChange = () => {
    dispatch("change", searchTerm);
  };
  // Fire off when search is hit
  const fireSearch = () => {
    dispatch("search", searchTerm);
  };
  // Fire off clearing
  const fireClear = () => {
    dispatch("clear");
    searchTerm = null;
  };
  // Watch for enter keys
  const searchKeypress = event => {
    if (event.key === "Enter" || event.key === "Return") {
      fireSearch();
      return false;
    }
  };
</script>

<style lang="scss">
  .search-bar {
    position: relative;
    input {
      border-radius: 20px;
    }
  }
  :global(.search-bar .btn-action-clear) {
    font-size: 14px;
  }
</style>

<NToolbar className="search-bar">
  {#if searchTerm}
    <button class="btn btn-sm btn-clear btn-action-clear" on:click={fireClear}>
      <i class="zmdi zmdi-close" />
    </button>
  {/if}
  <input
    type="text"
    class="search-input"
    on:keypress={searchKeypress}
    bind:value={searchTerm}
    placeholder="{Lang.t('general.search')}..." />
  {#if hasResults}

  {:else if searchTerm}
    <button class="btn btn-sm text-primary" on:click={fireSearch}>
      <i class="zmdi zmdi-search" />
    </button>
  {/if}
</NToolbar>
