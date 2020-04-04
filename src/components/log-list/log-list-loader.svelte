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
  let step = 1;
  let logs = [];
  let hasMore = true;
  let books = {};
  let lastBookDate = null;
  let theEnd = false;
  let emptyBookCount = 0;
  let NoBookFoundCount = 0;
  let canceled = false;

  function findMore() {
    canceled = false;
    emptyBookCount = 0;
    NoBookFoundCount = 0;
    step++;
    getNextBook();
  }

  async function getNextBook() {
    if (!canceled) {
      loading = true;
      let lookupDate;

      if (!lastBookDate) {
        lastBookDate = dayjs();
        lookupDate = lastBookDate;
      } else {
        lookupDate = lastBookDate.subtract(1, config.book_time_unit);
        lastBookDate = dayjs(lookupDate);
      }

      let book = await LedgerStore.getBook(
        lookupDate.format(config.book_time_format),
        true
      );

      if (!book) {
        NoBookFoundCount++;
      } else if (book.length > 0) {
        book = book.filter(log => {
          return log.note.match(new RegExp(`${term}`, "gi"));
        });
        if (book.length == 0) {
          emptyBookCount++;
        } else {
          books[lookupDate.format(config.book_time_format)] = book;
          logs = [...logs, ...book];
        }
      } else if (book.length == 0) {
        emptyBookCount++;
      }

      // If < 6 404's on the book lookups
      // And less than 12 book with no matches
      // and the current limit is not met
      if (
        NoBookFoundCount < 6 &&
        emptyBookCount < 12 &&
        logs.length < limit * step
      ) {
        getNextBook();
      } else {
        loading = false;
      }
    } else {
      loading = false;
    }
  }

  function cancelSearch() {
    canceled = true;
  }

  onMount(() => {
    getNextBook();
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
  {#if loading}
    <NItem className="py-2 bg-transparent loading-bar">
      <div slot="left">
        <NSpinner size={24} />
      </div>
      Searching...
      <button
        class="btn btn-clear text-red"
        slot="right"
        on:click={cancelSearch}>
        Cancel
      </button>
    </NItem>
  {/if}

  {#if !theEnd && !loading}
    <NItem className="py-2 bg-transparent">
      <button class="btn btn-outline btn-light btn-block" on:click={findMore}>
        Search More...
      </button>
    </NItem>
  {:else if theEnd}
    <NItem className="py-2 bg-transparent">
      <div class="text-center text-md text-faded-2">No more results</div>
    </NItem>
  {/if}

</div>
