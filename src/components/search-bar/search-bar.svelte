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
    input {
      border-radius: 20px;
    }
  }
</style>

<NToolbar className="search-bar">
  <input
    type="text"
    class="search-input"
    on:keypress={searchKeypress}
    bind:value={searchTerm}
    placeholder="{Lang.t('general.search')}..." />
  {#if hasResults}
    <button class="btn btn-sm text-red" on:click={fireClear}>Clear</button>
  {:else if searchTerm}
    <button class="btn btn-sm text-primary" on:click={fireSearch}>
      Search
    </button>
  {/if}
</NToolbar>
