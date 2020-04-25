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

  // components
  import NItem from "../components/list-item/list-item.svelte";
  import NPoints from "../components/points/points.svelte";
  import NIcon from "../components/icon/icon.svelte";
  import NLogListLoader from "../components/log-list/log-list-loader.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NToolbarGrid from "../components/toolbar/toolbar-grid.svelte";
  import NModal from "../components/modal/modal.svelte";
  import Spinner from "../components/spinner/spinner.svelte";
  import NDatePicker from "../components/date-picker/date-picker.svelte";
  import LogItem from "../components/list-item-log/list-item-log.svelte";
  import NSearchBar from "../components/search-bar/search-bar.svelte";

  import config from "../../config/global";

  // Containers
  import NMap from "../containers/map/map.svelte";
  import NLayout from "../containers/layout/layout.svelte";
  // Utils
  import dayjs from "dayjs";
  import tick from "../utils/tick/tick";

  // Stores
  import { UserStore } from "../store/user";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/tracker-store";
  import { LedgerStore } from "../store/ledger";
  import { Lang } from "../store/lang";

  import { HistoryPage } from "../store/history-page";

  /**
   * I've messed this all up again. but it's faster and more responsivle
   * TODO: refactor so it's clean and using the proper amount of Store vs local
   */

  let datePicker;
  let searchInput;
  let appTitle = null;
  let showSearch = false;

  const state = {
    date: dayjs(new Date()),
    time_format: config.book_time_format,
    logs: null,
    trackers: {},
    ledger: null,
    searchTerm: "",
    searchResults: null,
    searchMode: false,
    selected: {},
    selectCount: 0,
    editMode: false,
    showDatePicker: false,
    location: {
      name: null,
      lat: null,
      lng: null
    },
    locations: [],
    loading: true,
    showAllLocations: false
  }; // Assign State to compiled history page

  let refreshing = false;

  let local = {
    showDatePicker: false,
    datePickerValue: null,
    searchMode: false
  };

  // $: searchMode = (state.searchTerm || "").length ? true : false;
  let searchMode = false;
  $: if (state.searchTerm && !searchMode) {
    searchMode = true;
  }

  let logs = undefined; // holder of the logs
  let searchLogs = undefined; // hodler of searched logs
  let loading = true;
  let book = undefined;
  let locations = [];
  let dayScore = 0;

  // Used for checking things
  const checks = {
    list_date: {}
  };

  /// Watchers for when we're in edit mode
  // and when we have selected more than one.

  let isToday = true;

  // If the date changes - check to see if it's still today
  let activeDate;
  $: if (state.date && state.date !== activeDate) {
    activeDate = state.date;
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

  $: appTitle = `History ${state.date.format("YYYY-MM-DD")}`;

  $: if (searchLogs || logs) {
    locations = (searchLogs || logs)
      .filter(log => {
        return log.lat;
      })
      .map(log => {
        return {
          lat: log.lat,
          lng: log.lng,
          name: log.location,
          log: log
        };
      });
  }

  // Methods
  const methods = {
    toggleSearch() {
      if (searchMode) {
        state.searchResults = null;
        state.searchTerm = null;
        searchMode = false;
      } else {
        searchMode = true;
      }
    },

    async doSearch(event) {
      state.searchTerm = null;
      let trackableElement = event.detail;
      tick(100);
      if (trackableElement.type == "tracker") {
        state.searchTerm = `#${trackableElement.id}`;
      } else {
        state.searchTerm = `${trackableElement.raw}`;
      }
      showSearch = true;
      methods.onSearchEnter();
    },

    async textClick(event) {
      let trackableElement = event.detail;
      let tracker =
        trackableElement.type == "tracker"
          ? TrackerStore.getByTag(trackableElement.id)
          : null;

      const buttons = [
        {
          title: `View stats`,
          click: () => {
            if (tracker) {
              Interact.openStats(`#${trackableElement.id}`);
            } else {
              Interact.openStats(trackableElement.raw);
            }
          }
        },
        {
          title: `Search for ${tracker ? tracker.label : trackableElement.raw}`,
          click: () => {
            methods.doSearch(event);
          }
        }
      ];
      if (trackableElement.type == "person") {
        buttons.push({
          title: `Check-In`,
          click: () => {
            Interact.person(trackableElement.id);
          }
        });
      }
      Interact.popmenu({
        title: `${tracker ? tracker.label : trackableElement.raw} options`,
        buttons: buttons
      });
    },
    async getLogs(fresh) {
      fresh = fresh ? fresh : false;
      loading = true;
      // Query the Ledger for Posts on this day.
      logs = await LedgerStore.query({
        start: state.date.startOf("day").toDate(),
        end: state.date.endOf("day").toDate(),
        fresh: fresh
      });

      loading = false;
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
      }, 10);
    },
    clearSearch() {
      showSearch = false;
      state.searchTerm = "";
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
    goto(date) {
      state.date = date;
      methods.getLogs();
    },
    searchChange(evt) {
      state.searchTerm = evt.detail;
      showSearch = false;
      window.scrollTo(0, 0);
    },
    async onSearchEnter(evt) {
      await tick(100);
      window.scrollTo(0, 0);
      showSearch = true;
    },
    trackerTapped(tracker, log) {
      Interact.openStats(`#${tracker.tag}`);
    },
    showLogOptions(log) {
      Interact.logOptions(log).then(action => {
        if (searchMode) {
          methods.refreshSearch();
        }
      });
    },
    selectDate() {
      let ranges = [
        {
          time: 90,
          title: "90 Days Back",
          unit: "day"
        },
        {
          time: 180,
          title: "6 Months Back",
          unit: "day"
        },
        {
          time: 1,
          title: "1 Year Back",
          unit: "year"
        },
        {
          time: 2,
          title: "2 Years Back",
          unit: "year"
        },
        {
          time: -1,
          title: "Select Date...",
          unit: "day"
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
            click: async () => {
              if (range.time == -1) {
                let date = await Interact.selectDate();
                if (date) {
                  methods.goto(dayjs(date));
                }
              } else if (range.time === 0) {
                methods.goto(dayjs());
              } else {
                methods.goto(state.date.subtract(range.time, range.unit));
              }
            }
          };
        })
      });
    }
  };

  // If a new Log is added, or changed update the list.
  LedgerStore.hook("onLogUpdate", log => {
    methods.getLogs();
  });

  LedgerStore.hook("onLogsDeleted", async () => {
    await tick(600);
    methods.getLogs();
  });

  // WHen mounted.
  onMount(() => {
    if ((state.searchTerm || "").length > 1 && !searchLogs) {
      methods.refreshSearch();
    }
    window.scrollTo(0, 0);
    methods.getLogs();
    LedgerStore.getMemories();
  });

  /**
   * // Fire off call to query the datastore
   * This will call the ledger and load up the right book
   * once the book is loaded, the logs var will be automaticallly filtered
   */
</script>

<style lang="scss" type="text/scss">
  // TODO: This is really sloppy - clean it up.
  hr {
    margin: 0;
    padding: 0;
    border-top: solid 1px rgba(0, 0, 0, 0.2);
  }
  // :global(.trackers-list .border-bottom:last-child) {
  //   border-bottom: none !important;
  // }

  .map-btn {
    position: absolute;
    left: 10px;
    bottom: 10px;
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 12px;
  }
  .today-btn {
    position: fixed;
    left: 10px;
    bottom: 10px;
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 12px;
  }
  .close-btn {
    left: auto;
    right: 0px;
    bottom: 0px !important;
  }

  .page-history {
    .show-map {
      height: 200px;
      min-height: 200px;
      max-height: 400px;
    }
  }
  .header-date-control {
    line-height: 100%;
    flex-grow: 1;
    flex-shrink: 1;
  }

  :global(.page-history .n-item .n-item:last-child) {
    border-bottom: none !important;
  }
</style>

<NLayout pageTitle={appTitle}>

  <header slot="header">
    <NToolbarGrid className="animate in {showSearch ? 'hidden' : 'visible'}">
      <button
        slot="left"
        class="btn btn-clear btn-icon flex text-xl tap-icon"
        on:click={methods.previous}>
        <NIcon name="chevronLeft" />
      </button>
      <div
        slot="main"
        class={isToday ? 'text-inverse-2' : 'not-today text-red'}
        on:click={methods.selectDate}>
        <span class="font-weight-bold mx-1">{state.date.format('ddd')}</span>
        {state.date.format('MMM Do YYYY')}
        <NIcon name="chevronDown" size="16" style="margin-top:-2px;" />
        <!-- end text middle -->
      </div>
      <button
        slot="right"
        class="btn btn-clear btn-icon flex text-xl tap-icon"
        on:click={methods.next}>
        <NIcon name="chevronRight" />
      </button>
    </NToolbarGrid>

    <!-- hasResults={(searchLogs || []).length > 0} -->

    <NSearchBar
      searchTerm={state.searchTerm}
      placeholder="Search History..."
      style={showSearch ? 'margin-top:-20px;' : ''}
      on:change={methods.searchChange}
      on:clear={methods.clearSearch}
      on:search={methods.onSearchEnter} />

  </header>
  <!-- end header-content header -->

  <main slot="content" class="page page-history">

    {#if loading}
      <div class="empty-notice">
        <Spinner />
      </div>
    {:else}
      <div class="container p-0">
        <!-- If no Logs found -->
        {#if logs.length === 0 && !showSearch}
          {#if !searchMode}
            <div class="empty-notice" style="max-height:200px;">
              {Lang.t('history.no-records-found')}
            </div>
          {:else}
            <div class="empty-notice">
              {state.date.format('YYYY')} {Lang.t('history.no-records-found')}
            </div>
          {/if}
          <!-- If Logs and Not refreshing  -->
        {:else if !showSearch}
          <!-- Loop over logs -->
          {#each logs as log, index}
            <LogItem
              {log}
              on:trackerClick={event => {
                methods.trackerTapped(event.detail.tracker, log);
              }}
              on:textClick={event => {
                methods.textClick(event);
              }}
              on:moreClick={event => {
                Interact.logOptions(log).then(() => {});
              }} />
            <!-- Show the Log Item -->
          {/each}

          <!--
          Search Results
          If Search Mode and We have Logs
        -->
        {:else if showSearch && state.searchTerm}
          <NLogListLoader
            term={state.searchTerm}
            limit={12}
            on:trackerClick={event => {
              methods.trackerTapped(event.detail.tracker, event.detail.log);
            }}
            on:textClick={event => {
              methods.textClick(event);
            }}
            on:moreClick={event => {
              Interact.logOptions(event.detail).then(() => {});
            }} />
        {/if}

        <!-- Show History if exists -->
        {#if $LedgerStore.memories.length > 0 && !showSearch && isToday}
          <div class="memories">
            {#each $LedgerStore.memories as log}
              <div class="memories-log-header">
                <button
                  class="btn btn-clear"
                  on:click={() => {
                    methods.goto(dayjs(log.end));
                  }}>
                  From {dayjs(log.end).fromNow()}
                  <NIcon name="chevronRight" className="fill-white" />
                </button>
              </div>
              <LogItem
                className="aged"
                {log}
                on:trackerClick={event => {
                  methods.trackerTapped(event.detail.tracker, log);
                }}
                on:textClick={event => {
                  methods.textClick(event);
                }}
                on:moreClick={event => {
                  Interact.logOptions(log).then(() => {});
                }} />
            {/each}
          </div>
        {/if}
        <!-- end history -->

      </div>
    {/if}
    {#if locations.length && !loading && !state.searchTerm}
      {#if !state.showAllLocations}
        <div
          class="mini-map closed"
          on:click={() => {
            state.showAllLocations = !state.showAllLocations;
          }}>
          <NMap {locations} />
        </div>
      {:else}
        <div class="mini-map opened">
          <NMap {locations} />
          <button
            class="btn btn-icon btn-round map-btn close-btn"
            on:click={() => {
              state.showAllLocations = !state.showAllLocations;
            }}>
            <NIcon name="closeFilled" size="48" />
          </button>

        </div>
      {/if}
    {/if}
    {#if !isToday && !searchMode}
      <button
        class="btn btn-sm btn-light btn-round today-btn"
        on:click={() => {
          methods.goto(dayjs());
        }}>
        {Lang.t('general.today')}
      </button>
    {/if}
  </main>
  <!-- end header-content content -->

</NLayout>

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
