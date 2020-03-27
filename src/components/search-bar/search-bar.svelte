<script>
  import NToolbar from "../toolbar/toolbar.svelte";

  import { Lang } from "../../store/lang";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let searchTerm = null;
  // export let hasResults = false;

  // FIre off changes when input changes
  function fireChange() {
    dispatch("change", searchTerm);
  }
  // Fire off when search is hit
  function fireSearch() {
    dispatch("search", searchTerm);
  }
  // Fire off clearing
  function fireClear() {
    dispatch("clear");
    searchTerm = null;
  }
  // Watch for enter keys
  function searchKeypress(event) {
    if (event.key === "Enter" || event.key === "Return") {
      fireSearch();
      return false;
    } else {
      fireChange();
    }
  }
</script>

<style lang="scss">
  .search-bar {
    position: relative;
    input {
      border-radius: 6px;
    }
  }
  :global(.search-bar .btn-action-clear) {
    font-size: 14px;
  }
</style>

<NToolbar className="search-bar">
  {#if searchTerm}
    <button
      class="btn btn-sm btn-clear btn-action-clear"
      on:click={fireClear}
      style="margin-left:-10px;">
      <i class="zmdi zmdi-close-circle text-sm" />
    </button>
  {/if}
  <input
    type="text"
    class="search-input"
    on:keyup={searchKeypress}
    bind:value={searchTerm}
    placeholder="{Lang.t('general.search')}..." />
  {#if searchTerm}
    <button class="btn btn-sm text-primary" on:click={fireSearch}>
      Search
    </button>
  {/if}
</NToolbar>
