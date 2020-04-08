<script>
  import NToolbar from "../toolbar/toolbar.svelte";
  import NInput from "../input/input.svelte";

  import { Lang } from "../../store/lang";
  import { createEventDispatcher } from "svelte";
  import NIcon from "../icon/icon.svelte";
  const dispatch = createEventDispatcher();

  export let searchTerm = null;
  export let autocomplete = false;
  export let placeholder = `${Lang.t("general.search")}...`;
  export let style = "";
  export let className = "";

  let _elInput;
  // export let hasResults = false;

  // FIre off changes when input changes
  function fireChange() {
    dispatch("change", searchTerm);
  }

  export function focus() {
    if (_elInput.doFocus) {
      _elInput.doFocus();
    }
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

<NToolbar className="search-bar {className}" {style}>
  {#if searchTerm}
    <button
      class="btn btn-sm btn-clear btn-action-clear"
      on:click={fireClear}
      style="margin-left:-10px;">
      <NIcon name="close" className="fill-red" />
    </button>
  {/if}
  <div class="n-row">
    <NInput
      solo
      compact
      bind:this={_elInput}
      bind:value={searchTerm}
      on:change={fireChange}
      on:enter={fireSearch}
      {placeholder}>
      <div slot="left" class="pl-2">
        <NIcon
          name="search"
          style="height:20px; width: 20px; opacity:0.3; margin-top:-4px;" />
      </div>
      <div slot="right">
        <slot name="right-inside" />
      </div>
    </NInput>
    <slot name="right" />
    {#if searchTerm && !autocomplete}
      <button class="btn btn-sm text-inverse-2" on:click={fireSearch}>
        Search
      </button>
    {/if}
  </div>
</NToolbar>
