<script>
  import { onMount } from "svelte";
  import NItem from "../list-item/list-item.svelte";
  import LogItem from "../list-item-log/list-item-log.svelte";
  import NSpinner from "../spinner/spinner.svelte";

  export let logs = null;
</script>

<div class="n-list">
  {#each logs as log}
    <LogItem {log} showMore={false} />
  {/each}
</div>
