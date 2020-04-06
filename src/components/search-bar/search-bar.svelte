<script>
  import NToolbar from "../toolbar/toolbar.svelte";
  import NInput from "../input/input.svelte";

  import { Lang } from "../../store/lang";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let searchTerm = null;
  export let autocomplete = false;
  export let placeholder = `${Lang.t("general.search")}...`;
  export let style = "";
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
    flex-shrink: 0;
    flex-grow: 1;
  }
  :global(.search-bar .btn-action-clear) {
    font-size: 14px;
  }
  :global(.search-bar input) {
    width: calc(100% - 30px); // account for icon pushing it out.
  }
</style>

<NToolbar className="search-bar" {style}>
  {#if searchTerm}
    <button
      class="btn btn-sm btn-clear btn-action-clear"
      on:click={fireClear}
      style="margin-left:-10px;">
      <i class="zmdi zmdi-close-circle text-xl" />
    </button>
  {/if}
  <div class="n-row">
    <NInput
      solo
      compact
      bind:value={searchTerm}
      on:change={fireChange}
      on:enter={fireSearch}
      {placeholder}>

      <i
        class="zmdi zmdi-search ml-2 text-inverse opacity-3"
        style="font-size:1rem !important"
        slot="left" />

    </NInput>
    <slot name="right" />
    {#if searchTerm && !autocomplete}
      <button class="btn btn-sm text-inverse-2" on:click={fireSearch}>
        Search
      </button>
    {/if}
  </div>
</NToolbar>
