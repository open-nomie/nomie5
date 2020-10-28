<script>
  import { onMount } from "svelte";
  import config from "../../config/appConfig";
  import LogList from "./log-list.svelte";
  import NItem from "../list-item/list-item.svelte";
  import NSpinner from "../spinner/spinner.svelte";
  import { LedgerStore } from "../../store/ledger";
  import tick from "../../utils/tick/tick";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  // vendor
  import dayjs from "dayjs";
  import Text from "../text/text.svelte";
  import { UserStore } from "../../store/user-store";
  import Storage from "../../modules/storage/storage";
  import global from "../../config/appConfig";
  import Spinner from "../spinner/spinner.svelte";
  import Button from "../button/button.svelte";
  import { Lang } from "../../store/lang";

  export let term = null;
  export let limit = 20;
  export let className = "";
  export let compact = false;
  export let fullDate = true;
  export let results = [];
  export let showTimeDiff = false;

  let loading = false;
  let logs = [];

  let lastFrom;
  let lastTo;

  let searchCount = 0;

  const dtFormat = UserStore.getDateTimeFormat();

  // React to Term Change
  let lastTerm;

  $: if (term && lastTerm !== term) {
    lastTerm = term;
    reset();
    search();
  }

  function reset() {
    logs = [];
    lastTo = null;
    lastFrom = null;
    lastTerm = null;
  }

  async function search() {
    searchCount++;

    // Set from and to date
    loading = true;
    let from = !lastFrom ? dayjs().subtract(limit, config.book_time_unit) : dayjs(lastFrom).subtract(limit, config.book_time_unit);
    let to = !lastTo ? dayjs() : dayjs(lastTo).subtract(limit, config.book_time_unit);

    // Query the ledger
    let book = await LedgerStore.query({
      start: from.toDate(),
      end: to.toDate(),
      search: term,
    });
    //
    logs = [...logs, ...book].sort((a, b) => {
      return a.end > b.end ? 1 : -1;
    });
    lastFrom = from;
    lastTo = to;
    await tick(12);
    loading = false;
    results = logs;
  }

  // function cancelSearch() {
  //   cancelled = true;
  // }

  onMount(() => {
    reset();
  });
</script>

<style lang="scss">
  .log-list-loader {
    position: relative;
  }
</style>

<div class="log-list-loader">
  <LogList
    {fullDate}
    className="bg-transparent {className}"
    {compact}
    {logs}
    {showTimeDiff}
    on:trackerClick={(event) => {
      dispatch('trackerClick', event.detail);
    }}
    on:locationClick={(event) => {
      dispatch('locationClick', event.detail);
    }}
    on:textClick={(event) => {
      dispatch('textClick', event.detail);
    }}
    on:moreClick={(event) => {
      dispatch('moreClick', event.detail);
    }} />
  {#if !loading && logs.length == 0}
    <div class="p-2 text-center text-faded-2">No results found for this time period.</div>
  {/if}
  {#if !loading && lastTo}
    <NItem className="py-2 bg-transparent mb-2">
      <Button block color="light" className="mx-auto" style="max-width:300px;" on:click={search}>Search More...</Button>
      <Text size="sm" faded center className="mt-2">Place in time: {lastFrom.format(dtFormat.date)}</Text>
    </NItem>
  {:else if loading}
    <NItem className="py-2 bg-transparent mb-2">
      <Button block color="light" className="mx-auto" style="max-width:300px;" disabled>
        <Spinner size={18} />
        <span class="ml-2">{Lang.t('general.searching', 'Searching...')}</span>
      </Button>
      <Text size="sm" faded center className="mt-2">Looking through history</Text>
    </NItem>
  {/if}

</div>
