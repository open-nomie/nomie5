<script>
  /**
   * History Tab
   * A big collection of all things history
   *
   * TODO: Have it react when the ledger change, not a hard refresh
   */

  // svelte
  import { navigate } from "svelte-routing";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  // components
  import NItem from "../components/list-item/list-item.svelte";
  import NText from "../components/text/text.svelte";
  import NNoteTextualizer from "../components/note-textualizer/note-textualizer.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NModal from "../components/modal/modal.svelte";
  import Spinner from "svelte-spinner";
  import NDatePicker from "../components/date-picker/date-picker.svelte";
  import LogItem from "../components/list-item-log/list-item-log.svelte";
  import NDatePill from "../components/date-pill/date-pill.svelte";

  // Containers
  import NMap from "../containers/map/map.svelte";

  // Utils
  import NomieUOM from "../utils/nomie-uom/nomie-uom";
  import dayjs from "dayjs";

  // Stores
  import { UserStore } from "../store/user";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/trackers";
  import { LedgerStore } from "../store/ledger";

  import { HistoryPage } from "../store/history-page";

  /**
   * I've messed this all up again. but it's faster and more responsivle
   * TODO: refactor so it's clean and using the proper amount of Store vs local
   */

  let datePicker;

  const state = $HistoryPage; // Assign State to compiled history page

  let refreshing = false;

  let local = {
    showDatePicker: false,
    datePickerValue: null
  };

  let logs = undefined; // holder of the logs
  let searchLogs = undefined; // hodler of searched logs
  let loading = true;
  let book = undefined;
  let locations = [];

  // Used for checking things
  const checks = {
    list_date: {}
  };

  /// Watchers for when we're in edit mode
  // and when we have selected more than one.

  let isToday = true;

  // If the date changes - check to see if it's still today
  $: if (state.date) {
    isToday = new Date().toDateString() == state.date.toDate().toDateString();
  }

  // Filter logs for today
  const filterActiveDate = log => {
    return (
      log.end >=
        state.date
          .startOf("day")
          .toDate()
          .getTime() &&
      log.end <=
        state.date
          .endOf("day")
          .toDate()
          .getTime()
    );
  };

  // Dynamically assign book
  $: if ($LedgerStore.books[state.date.format("YYYY-MM")]) {
    loading = true;
    book = $LedgerStore.books[state.date.format("YYYY-MM")] || [];
    logs = (book || [])
      .filter(log => filterActiveDate(log))
      .sort((a, b) => {
        return a.end < b.end ? 1 : -1;
      });

    setTimeout(() => {
      loading = false;
      // TODO: Look at making this refresh without doing the loading, it's pushing the page to the top and it's annoying
      // window.scrollTo(0, windowScrollPosition);
    }, 1);
  }

  $: if (searchLogs || logs) {
    locations = (searchLogs || logs)
      .filter(log => {
        return log.lat;
      })
      .map(log => {
        return {
          lat: log.lat,
          lng: log.lng,
          name: log.location
        };
      });
  }

  // Methods
  const methods = {
    toggleSearch() {
      if (state.searchMode) {
        state.searchResults = null;
        state.searchTerm = null;
        state.searchMode = false;
      } else {
        state.searchMode = true;
      }
    },
    getLogs(fresh) {
      fresh = fresh ? fresh : false;

      loading = true;
      // state.refreshing = true;
      // checks.list_date = {};

      // Query the Ledger for Posts on this day.
      return LedgerStore.query({
        start: state.date.startOf("day").toDate(),
        end: state.date.endOf("day").toDate(),
        fresh: fresh
      });
    },
    clearLocation() {
      state.location.name = null;
      state.location.lat = null;
      state.location.lng = null;
    },
    refresh() {
      refreshing = true;
      setTimeout(() => {
        refreshing = false;
      });
    },
    clearSearch() {
      state.searchResults = null;
      state.searchMode = false;
      state.searchTerm = "";
      searchLogs = null;
    },
    previous() {
      methods.getDate(state.date.subtract(1, "day"));
    },
    getDate(date) {
      state.date = date;
      methods.getLogs();
    },
    next() {
      methods.getDate(state.date.add(1, "day"));
    },
    previousSearch() {
      state.date = state.date.subtract(1, "year").startOf("year");
      methods.search(state.searchTerm, state.date.format("YYYY"));
    },
    nextSearch() {
      state.date = state.date.add(1, "year").startOf("year");
      methods.search(state.searchTerm, state.date.format("YYYY"));
    },
    headerExists(date) {
      let dformat = dayjs(date).format("YYYY-MM-DD");
      if (checks.list_date.hasOwnProperty(dformat)) {
        return true;
      } else {
        checks.list_date[dformat] = true;
        return false;
      }
    },
    goto(date) {
      state.date = date;
      methods.getLogs();
    },
    searchKeypress(event) {
      if (event.key === "Enter" || event.key === "Return") {
        methods.search(state.searchTerm, state.date.format("YYYY"));
      }
    },
    refreshSearch() {
      methods.search(state.searchTerm, state.date.format("YYYY"));
    },
    search(key, year) {
      if ((key || "").length > 1) {
        state.searchResults = [];
        loading = true;
        LedgerStore.search(state.searchTerm, year).then(searchResults => {
          loading = false;
          state.searchMode = true;
          searchLogs = searchResults;
        });
      }
    },
    trackerTapped(tracker, log) {
      navigate(`/stats/${tracker.tag}`);
    },
    showLogOptions(log) {
      Interact.logOptions(log).then(action => {
        if (state.searchMode) {
          methods.refreshSearch();
        }
      });
    },
    selectDate() {
      let ranges = [
        {
          days: 90,
          title: "90 Days Back"
        },
        {
          days: 180,
          title: "6 Months Back"
        },
        {
          days: 365,
          title: "1 Year Back"
        },
        {
          days: 730,
          title: "2 Years Back"
        },
        {
          days: -1,
          title: "Select Date..."
        }
      ];

      if (!isToday) {
        ranges.unshift({
          days: 0,
          title: "Go to Today"
        });
      }

      Interact.popmenu({
        buttons: ranges.map(range => {
          return {
            title: range.title,
            click() {
              if (range.days == -1) {
                local.showDatePicker = true;
              } else if (range.days === 0) {
                methods.goto(dayjs());
              } else {
                methods.goto(state.date.subtract(range.days, "days"));
              }
            }
          };
        })
      });
    }
  };

  onMount(() => {
    if ((state.searchTerm || "").length > 1 || !searchLogs) {
      methods.refreshSearch();
    }
  });

  /**
   * // Fire off call to query the datastore
   * This will call the ledger and load up the right book
   * once the book is loaded, the logs var will be automaticallly filtered
   */
  methods.getLogs();
</script>

<style lang="scss" type="text/scss">
  // TODO: This is really sloppy - clean it up.
  hr {
    margin: 0;
    padding: 0;
    border-top: solid 1px rgba(0, 0, 0, 0.2);
  }
  :global(.trackers-list .border-bottom:last-child) {
    border-bottom: none !important;
  }

  .history-toolbar-container {
    .btn {
      outline: none !important;
    }
    .btn.active {
      background-color: var(--color-primary-bright);
      color: #fff !important;
      padding-top: 5px;
      padding-bottom: 5px;
      border-radius: 20% !important;
      outline: none !important;
    }
  }

  .search-bar {
    position: relative;
    .btn {
      position: absolute;
      right: 12px;
      top: -3px;
    }
  }

  .n-date-pill-container {
    position: fixed;
    bottom: 70px;
    left: 0;
    right: 0;
  }

  .header-date-control {
    line-height: 100%;
  }

  .border-right-fade {
    // border-right: solid 1px var(--color-solid-2);
  }

  :global(.trackers-list) {
    border-bottom: solid 1px rgba(0, 0, 0, 0.06);
    border-top: solid 1px rgba(0, 0, 0, 0.06);
    margin-top: 10px;
  }
  :global(.trackers-list .n-item) {
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px !important;
    padding-right: 16px !important;
    border-bottom-color: rgba(0, 0, 0, 0.05) !important;
  }
  .btn.flex {
    display: flex;
    align-items: center;
  }

  :global(.page-history .n-item .n-item:last-child) {
    border-bottom: none !important;
  }
</style>

<NToolbar pinTop>
  <div class="container history-toolbar-container">
    <div class="d-flex justify-content-stretch align-items-center w-100">
      {#if state.searchMode}
        <button
          class="btn btn-clear btn-icon flex"
          on:click={methods.previousSearch}>
          <i class="zmdi zmdi-chevron-left" />
        </button>
      {:else}
        <button class="btn btn-clear btn-icon flex" on:click={methods.previous}>
          <i class="zmdi zmdi-chevron-left" />
        </button>
      {/if}
      <div class="filler" />
      <button
        class="btn btn-clear btn-icon flex {state.searchMode ? 'active text-primary-bright' : ''}"
        on:click={methods.toggleSearch}>
        <i class="zmdi zmdi-search" />
      </button>
      <div class="filler" />
      {#if state.searchMode}
        <div class="text-center">
          <NText tag="div" size="lg" className="n-title" bold>
            {state.date.format('YYYY')}
          </NText>
        </div>
      {:else}
        <div
          class="header-date-control text-center {isToday ? 'today' : 'not-today text-primary-bright'}"
          on:click={methods.selectDate}>
          <NText tag="div" size="md" bold>{state.date.format('dddd')}</NText>
          <NText tag="div" size="sm">{state.date.format('MMM D YYYY')}</NText>
        </div>
      {/if}
      <div class="filler" />
      <button class="btn btn-clear btn-icon" on:click={methods.selectDate}>
        <i class="zmdi zmdi-calendar" />
      </button>
      <div class="filler" />
      {#if state.searchMode}
        <button
          class="btn btn-clear btn-icon flex"
          on:click={methods.nextSearch}>
          <i class="zmdi zmdi-chevron-right " />
        </button>
      {:else}
        <button class="btn btn-clear btn-icon flex" on:click={methods.next}>
          <i class="zmdi zmdi-chevron-right" />
        </button>
      {/if}
    </div>
  </div>
  <!-- end toolbar div wrapper-->
</NToolbar>
{#if state.searchMode}
  <NToolbar pinTop className="sub-header">

    <div
      class="d-flex d-row justify-content-between align-items-center w-100 px-2
      search-bar">
      <input
        type="search"
        on:keypress={methods.searchKeypress}
        bind:value={state.searchTerm}
        placeholder="Search"
        class="search-input" />
      <button
        class="btn btn-clear btn-sm btn-icon zmdi zmdi-close"
        on:click={methods.clearSearch} />
    </div>
  </NToolbar>
{/if}

<div
  class="page page-history {state.searchMode ? 'with-sub-header' : 'with-header'}">
  {#if loading}
    <div class="empty-notice">
      <Spinner size="50" speed="750" color="#666" thickness="2" gap="40" />
    </div>
  {:else if state.showAllLocations}
    <NMap {locations} />
  {:else}
    <div class="container p-0 pt-3">
      <!-- If no Logs found -->
      {#if logs.length === 0}
        {#if !state.searchMode}
          <div class="empty-notice">
            No records found for
            <br />
            {state.date.format('dddd, MMMM D YYYY')}
          </div>
        {:else}
          <div class="empty-notice">
            {state.date.format('YYYY')} nothing found.
          </div>
        {/if}
        <!-- If Logs and Not refreshing  -->
      {:else if !state.searchMode}
        <!-- Loop over logs -->
        {#each logs as log, i (log._id)}
          <LogItem
            {log}
            trackers={$TrackerStore}
            on:trackerClick={event => {
              methods.trackerTapped(event.detail.tracker, log);
            }}
            on:locationClick={event => {
              Interact.showLocations([log]);
            }}
            on:moreClick={event => {
              Interact.logOptions(log).then(() => {});
            }} />
          <!-- Show the Log Item -->
        {/each}
      {:else if state.searchMode && searchLogs}
        {#each searchLogs as log, i (log._id)}
          <!-- 
            TODO: Search Day Header isn't working reliably... Pulling it for now. 
            If we have search results in this set - and a header doesn't exist, lets show one. -->
          <!-- {#if !methods.headerExists(log.end)}
            <NItem className="bg-transparent">
              <h1 class="n-title">{dayjs(log.end).format('ddd MMM D YYYY')}</h1>
              <div slot="right">
                <NText size="md">{dayjs(log.end).fromNow()}</NText>
              </div>
            </NItem>
          {/if} -->

          <LogItem
            {log}
            fullDate={true}
            trackers={$TrackerStore}
            on:trackerClick={event => {
              methods.trackerTapped(event.detail.tracker, log);
            }}
            on:locationClick={event => {
              Interact.showLocations([log]);
            }}
            on:moreClick={event => {
              Interact.logOptions(log).then(() => {});
            }} />
          <!-- Show the Log Item -->
        {/each}
      {:else if state.searchMode && !searchLogs}
        <div class="empty-notice">Search {state.date.format('YYYY')}</div>
      {/if}

    </div>
  {/if}
  {#if locations.length}
    {#if !state.showAllLocations}
      <div
        class="mini-map"
        on:click={() => {
          state.showAllLocations = !state.showAllLocations;
        }}>
        <NMap {locations} />
      </div>
    {:else}
      <div
        class="mini-map opened"
        on:click={() => {
          state.showAllLocations = !state.showAllLocations;
        }}>
        <i class="zmdi zmdi-close" />
      </div>
    {/if}
  {/if}
  <!-- <input type="date" bind:this={datePicker} /> -->
</div>

{#if state.location.lat}
  <NModal show={true} title={state.location.name || 'Location'}>
    <NMap locations={[state.location]} />
    <button
      class="btn btn-lg btn-primary btn-block mb-0"
      on:click={methods.clearLocation}
      slot="footer">
      Close
    </button>
  </NModal>
{/if}

{#if local.showDatePicker}
  <NModal show={true} title={'Select a Date'}>
    <NDatePicker
      on:change={event => {
        local.datePickerValue = event.detail;
      }} />
    <button
      class="btn btn-lg btn-light btn-block m-0 mr-1"
      on:click={() => {
        local.showDatePicker = false;
      }}
      slot="footer">
      Close
    </button>
    <button
      class="btn btn-lg btn-primary btn-block m-0 ml-1"
      on:click={() => {
        local.showDatePicker = false;
        methods.goto(dayjs(local.datePickerValue));
      }}
      slot="footer">
      Go
    </button>
  </NModal>
{/if}
