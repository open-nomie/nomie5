<script>
  import NToolbar from "../toolbar/toolbar.svelte";
  import NInput from "../input/input.svelte";

  import { Lang } from "../../store/lang";
  import { createEventDispatcher } from "svelte";
  import NIcon from "../icon/icon.svelte";
  import Button from "../button/button.svelte";
  import Icon from "../icon/icon.svelte";
  const dispatch = createEventDispatcher();

  export let searchTerm = null;
  export let autocomplete = false;
  export let placeholder = `${Lang.t("general.search", "Search")}...`;
  export let style = "";
  export let className = "";
  export let compact = false;
  export let showClose = true;
  export let autofocus = false;

  let _elInput;
  // export let hasResults = false;

  // FIre off changes when input changes
  let timeout;
  function fireChange() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      dispatch("change", searchTerm);
    }, 400);
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

<style lang="postcss" global>

  .search-bar {
    padding: 0 16pt;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
    flex-grow: 1;
    width: calc(100% - 16pt);
    margin: 0 8pt;
  
  }

  .search-bar .btn-action-clear {
    font-size: 14px;
  }
  .search-bar input {
    width: calc(100% - 30px);
    font-size: 100%;
  }
  .search-bar .n-input-container {
    margin-bottom: 0 !important;
  }
</style>

<div class="n-toolbar flex search-bar {className}" {style}>
  <div class="flex py-1">
    <NInput
      solo
      {compact}
      {autofocus}
      className="mt-0"
      bind:this={_elInput}
      bind:value={searchTerm}
      on:change={fireChange}
      on:enter={fireSearch}
      {placeholder}>
      <div slot="left" class="pl-2 d-flex">
        <NIcon name="search" style="height:20px; width: 20px" />
      </div>
      <div slot="right">
        <slot name="right-inside" />
        {#if searchTerm && showClose}
          <Button icon className=" btn-action-clear mr-2" on:click={fireClear} style="margin-left:-10px;">
            <NIcon name="close" className="fill-inverse-2" />
          </Button>
        {/if}
      </div>
    </NInput>
    <slot name="right" />
    {#if searchTerm && !autocomplete}
      <Button shape="circle" color="clear" icon on:click={fireSearch}>
        <Icon name="search" className="fill-primary-bright" />
      </Button>
    {/if}
  </div>
</div>
