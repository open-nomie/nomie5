<script>
  import { onMount } from "svelte";
  import NItem from "../list-item/list-item.svelte";
  import LogItem from "../list-item-log/list-item-log.svelte";
  import NSpinner from "../spinner/spinner.svelte";

  export let logs = null;
  export let loading = false;
</script>

<div class="n-list">

  {#each logs as log}
    <LogItem {log} showMore={false} />
  {/each}
  {#if loading}
    <NItem className="py-2">
      <div slot="left">
        <NSpinner size={24} />
      </div>
      Finding More...
    </NItem>
  {/if}
</div>
