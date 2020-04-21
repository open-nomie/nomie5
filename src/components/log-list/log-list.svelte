<script>
  import { onMount } from "svelte";
  import NItem from "../list-item/list-item.svelte";
  import LogItem from "../list-item-log/list-item-log.svelte";
  import NSpinner from "../spinner/spinner.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let logs = null;
  export let compact = false;
  export let style = "";
  export let className = "";

  let loading = false;
  // export let hideMore = false;

  let internalLogs = [];

  function sort(logs) {
    return logs.sort((a, b) => {
      return a.end < b.end ? 1 : -1;
    });
  }

  $: if (logs) {
    loading = true;
    setTimeout(() => {
      internalLogs = sort(logs);
      loading = false;
    }, 100);
  }
</script>

{#if loading}
  <div class="n-panel center-all h-100 flex-grow">
    <NSpinner />
  </div>
{:else}
  <div class="n-list {className}" {style}>
    {#each internalLogs as log}
      <LogItem
        className={compact ? 'compact' : ''}
        {log}
        on:trackerClick={event => {
          dispatch('trackerClick', event.detail);
        }}
        on:locationClick={event => {
          dispatch('locationClick', event.detail);
        }}
        on:textClick={event => {
          dispatch('textClick', event.detail);
        }}
        on:moreClick={event => {
          dispatch('moreClick', event.detail);
        }} />
    {/each}
  </div>
{/if}
