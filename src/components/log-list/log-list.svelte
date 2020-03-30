<script>
  import { onMount } from "svelte";
  import NItem from "../list-item/list-item.svelte";
  import LogItem from "../list-item-log/list-item-log.svelte";
  import NSpinner from "../spinner/spinner.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let logs = null;
</script>

<div class="n-list">
  {#each logs as log}
    <LogItem
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
