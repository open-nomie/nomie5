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
  // export let hideMore = false;

  function sort(logs) {
    return logs.sort((a, b) => {
      return a.end < b.end ? 1 : -1;
    });
  }
</script>

<div class="n-list {className}" {style}>
  {#each sort(logs) as log (log._id)}
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
