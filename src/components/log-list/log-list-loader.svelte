<script>
  import { onMount } from "svelte";
  import config from "../../../config/global";
  import LogList from "./log-list.svelte";
  import NItem from "../list-item/list-item.svelte";
  import { LedgerStore } from "../../store/ledger";
  import tick from "../../utils/tick/tick";

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

  $: if (logs) {
    // console.log("Logs change in log-list-loader", logs);
  }

  //return record.note.match(new RegExp(`${term}`, "gi"));

  function findMore() {
    step++;
    getNextBook();
  }

  async function getNextBook() {
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
      theEnd = true;
    }
    loading = false;
  }

  onMount(() => {
    console.log("Log List Loader Loaded");
    getNextBook();
  });
</script>

<div class="log-list-loader">
  <LogList {loading} {logs} />
  <NItem className="py-2">
    {#if !theEnd}
      <button class="btn btn-outline btn-light btn-block" on:click={findMore}>
        Find more...
      </button>
    {:else}
      <div class="text-center">That's All Folks!</div>
    {/if}
  </NItem>
</div>
