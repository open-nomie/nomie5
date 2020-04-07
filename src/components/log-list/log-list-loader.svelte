<script>
  import { onMount } from "svelte";
  import config from "../../../config/global";
  import LogList from "./log-list.svelte";
  import NItem from "../list-item/list-item.svelte";
  import NSpinner from "../spinner/spinner.svelte";
  import { LedgerStore } from "../../store/ledger";
  import tick from "../../utils/tick/tick";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // vendor
  import dayjs from "dayjs";

  export let term = null;
  export let limit = 20;
  export let compact = false;

  let loading = false;
  let logs = [];

  let lastFrom;
  let lastTo;

  // React to Term Change
  let lastTerm;
  $: if (lastTerm !== term) {
    lastTerm = term;
    reset();
    search();
  }

  function reset() {
    logs = [];
    lastTo = null;
    lastFrom = null;
  }

  async function search() {
    console.log("Searching");
    // Set from and to date
    loading = true;
    let from = !lastFrom
      ? dayjs().subtract(limit, config.book_time_unit)
      : dayjs(lastFrom).subtract(limit, config.book_time_unit);
    let to = !lastTo
      ? dayjs()
      : dayjs(lastTo).subtract(limit, config.book_time_unit);

    // Query the ledger
    let book = await LedgerStore.query({
      start: from.toDate(),
      end: to.toDate(),
      search: term
    });
    //
    logs = [...logs, ...book].sort((a, b) => {
      return a.end > b.end ? 1 : -1;
    });
    lastFrom = from;
    lastTo = to;
    await tick(12);
    loading = false;
  }

  function cancelSearch() {
    canceled = true;
  }

  onMount(() => {
    search();
  });
</script>

<style lang="scss">
  .log-list-loader {
    position: relative;
  }
</style>

<div class="log-list-loader">
  <LogList
    {compact}
    {logs}
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

  {#if !loading && lastTo}
    <NItem className="py-2 bg-transparent mb-2">
      <button class="btn btn-outline btn-light btn-block" on:click={search}>
        Search past {lastFrom.format('MMM Do YYYY')}...
      </button>
    </NItem>
  {:else if loading}
    <NItem className="py-2 bg-transparent mb-2">
      <button class="btn btn-outline btn-light btn-block" disabled>
        Searching...
      </button>
    </NItem>
  {/if}

</div>
