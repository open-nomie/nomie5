<script>
  import NToolbar from "../toolbar/toolbar.svelte";

  import { Lang } from "../../store/lang";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let searchTerm = null;
  export let autocomplete = false;
  export let placeholder = `${Lang.t("general.search")}...`;
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
  :global(.search-bar) {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    .input-wrapper {
      border-radius: 6px;
      background-color: var(--color-faded-1) !important;
      flex-grow: 1;
      flex-shrink: 1;
      input {
        border: none;
        background-color: transparent;
      }
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
  <div class="input-wrapper n-row">
    <slot name="left" />
    <input
      type="text"
      class="search-input"
      on:keyup={searchKeypress}
      bind:value={searchTerm}
      {placeholder} />
    <slot name="right" />
    {#if searchTerm && !autocomplete}
      <button class="btn btn-sm text-inverse-2" on:click={fireSearch}>
        Search
      </button>
    {/if}
  </div>
</NToolbar>
