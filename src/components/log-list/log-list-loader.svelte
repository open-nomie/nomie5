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

  let loading = false;
  let step = 1;
  let logs = [];
  let hasMore = true;
  let books = {};
  let lastBookDate = null;
  let theEnd = false;
  let emptyBookCount = 0;
  let canceled = false;

  $: if (logs) {
    // console.log("Logs change in log-list-loader", logs);
  }

  //return record.note.match(new RegExp(`${term}`, "gi"));

  function findMore() {
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
      if (book) {
        book = book.filter(log => {
          return log.note.match(new RegExp(`${term}`, "gi"));
        });
        books[lookupDate.format(config.book_time_format)] = book;
        logs = [...logs, ...book];
        if (logs.length < limit * step) {
          getNextBook();
        }
      } else if (emptyBookCount < 6) {
        emptyBookCount++;
        getNextBook();
      } else {
        loading = false;
        theEnd = true;
      }
    } else {
      loading = false;
      canceled = false;
    }
  }

  function cancelSearch() {
    console.log("Cancel Search");
    canceled = true;
  }

  onMount(() => {
    console.log("Log List Loader Loaded");
    getNextBook();
  });
</script>

<div class="log-list-loader">
  <LogList
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
  <NItem className="py-2 bg-transparent">
    {#if !theEnd && !loading}
      <button class="btn btn-outline btn-light btn-block" on:click={findMore}>
        Find more...
      </button>
    {:else if loading}
      <NItem className="py-2 bg-transparent">
        <div slot="left">
          <NSpinner size={24} />
        </div>
        Searching {lastBookDate.format('MMM YYYY')}...
        <button
          class="btn btn-clear text-red"
          slot="right"
          on:click={cancelSearch}>
          Cancel
        </button>
      </NItem>
    {:else}
      <div class="text-center text-md text-faded-2">No more results</div>
    {/if}
  </NItem>
</div>
