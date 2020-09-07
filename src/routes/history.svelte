<script>
  /**
   * History Tab
   * A big collection of all things history
   *
   * TODO: Have it react when the ledger change, not a hard refresh
   */

  // svelte
  import { navigate } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";

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
  import OfflineQueue from "../components/offline-queue/offline-queue.svelte";

  import config from "../config/appConfig";

  // Containers
  import NMap from "../containers/map/map.svelte";
  import NLayout from "../containers/layout/layout.svelte";
  // Utils
  import dayjs from "dayjs";
  import tick from "../utils/tick/tick";

  // Stores
  import { UserStore } from "../store/user-store";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/tracker-store";
  import { LedgerStore } from "../store/ledger";
  import { Lang } from "../store/lang";

  import { HistoryPage } from "../store/history-page";
  import { Device } from "../store/device-store";
  import Storage from "../modules/storage/storage";
  import Text from "../components/text/text.svelte";
  import Button from "../components/button/button.svelte";
  import NextPrevCal from "../components/next-prev-cal/next-prev-cal.svelte";

  export let location;
  export let style = undefined;

  let datePicker;
  let searchInput;
  let appTitle = null;
  let showSearch = false;

  const state = {
    date: dayjs(new Date()),
    time_format: config.book_time_format,
    logs: [],
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
      lng: null,
    },
    locations: [],
    loading: true,
    showAllLocations: false,
  }; // Assign State to compiled history page

  let refreshing = false;

  let local = {
    showDatePicker: false,
    datePickerValue: null,
    searchMode: false,
  };

  // $: searchMode = (state.searchTerm || "").length ? true : false;
  let searchMode = false;
  $: if (state.searchTerm && !searchMode) {
    searchMode = true;
  }

  let logs = []; // holder of the logs
  let searchLogs = undefined; // hodler of searched logs
  let loading = true;
  let book = undefined;
  let locations = [];
  let dayScore = 0;

  // Used for checking things
  const checks = {
    list_date: {},
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
  const filterActiveDate = (log) => {
    return log.end >= state.date.startOf("day").toDate().getTime() && log.end <= state.date.endOf("day").toDate().getTime();
  };

  $: appTitle = `History ${state.date.format("YYYY-MM-DD")}`;

  $: if (searchLogs || logs) {
    locations = (searchLogs || logs)
      .filter((log) => {
        return log.lat;
      })
      .map((log) => {
        return {
          lat: log.lat,
          lng: log.lng,
          name: log.location,
          log: log,
        };
      });
  }

  // Methods
  const methods = {
    async textClick(event) {
      let trackableElement = event.detail;
      Interact.elementOptions(trackableElement);
    },
    async getLogs(fresh) {
      fresh = fresh ? fresh : false;
      loading = true;
      // Query the Ledger for Posts on this day.
      let canLookup = true;
      if (Storage.getEngine().name == "Blockstack" && $Device.offline == true) {
        canLookup = false;
      }
      if (canLookup) {
        logs = await LedgerStore.query({
          start: state.date.startOf("day").toDate(),
          end: state.date.endOf("day").toDate(),
          fresh: fresh,
        });
        loading = false;
      } else {
        loading = false;
      }

      return logs || [];
    },
    clearLocation() {
      state.location.name = null;
      state.location.lat = null;
      state.location.lng = null;
    },
    previous() {
      methods.getDate(state.date.subtract(1, "day"));
    },
    getDate(date) {
      state.date = date;
      methods.getLogs();
      methods.scrollTop();
    },
    next() {
      methods.getDate(state.date.add(1, "day"));
    },
    scrollTop() {
      document.getElementById("nomie-main").scrollTo(0, 0);
    },
    goto(date) {
      state.date = date;
      methods.getLogs();
      methods.scrollTop();
    },
    search() {
      navigate("/search");
    },
    // searchChange(evt) {
    //   state.searchTerm = evt.detail;
    //   showSearch = false;
    //   window.scrollTo(0, 0);
    // },
    // async onSearchEnter(evt) {
    //   await tick(100);
    //   window.scrollTo(0, 0);
    //   showSearch = true;
    // },
    trackerTapped(tracker, log) {
      Interact.openStats(`#${tracker.tag}`);
    },
    personTapped(person, log) {
      Interact.openStats(`@${person.id}`);
    },
    contextTapped(context, log) {
      Interact.openStats(`+${context.id}`);
    },
    showLogOptions(log) {
      Interact.logOptions(log).then((action) => {
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
          unit: "day",
        },
        {
          time: 180,
          title: "6 Months Back",
          unit: "day",
        },
        {
          time: 1,
          title: "1 Year Back",
          unit: "year",
        },
        {
          time: 2,
          title: "2 Years Back",
          unit: "year",
        },
        {
          time: -1,
          title: "Select Date...",
          unit: "day",
        },
      ];

      if (!isToday) {
        ranges.unshift({
          days: 0,
          title: "Go to Today",
        });
      }

      Interact.popmenu({
        buttons: ranges.map((range) => {
          return {
            title: range.title,
            click: async () => {
              if (range.time == -1) {
                let date = await Interact.selectDate();
                if (date) {
                  methods.goto(dayjs(date));
                }
              } else if (range.time === undefined || range.time === 0) {
                methods.goto(dayjs(new Date()));
              } else {
                methods.goto(state.date.subtract(range.time || 0, range.unit || "day"));
              }
            },
          };
        }),
      });
    },
  };

  async function refresh() {
    refreshing = true;
    await tick(500);
    await methods.getLogs(true);
    await LedgerStore.getMemories();
    refreshing = false;
  }

  // If a new Log is added, or changed update the list.
  let onLogUpdate;
  let onLogSaved;
  let onLogsDeleted;

  // WHen mounted.
  onMount(() => {
    if ((state.searchTerm || "").length > 1 && !searchLogs) {
      methods.refreshSearch();
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("scrolled");
    refresh();

    onLogUpdate = LedgerStore.hook("onLogUpdate", async (log) => {
      await tick(600);
      refresh();
    });

    onLogSaved = LedgerStore.hook("onLogSaved", async (log) => {
      await tick(600);
      refresh();
    });

    onLogsDeleted = LedgerStore.hook("onLogsDeleted", async () => {
      await tick(600);
      refresh();
    });
  });
  onDestroy(() => {
    // Unsubscribe
    onLogSaved();
    onLogUpdate();
    onLogsDeleted();
  });
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

  .history-title {
    transition: all 0.2s ease-in-out;
    padding-left: 4px;
  }

  :global(.scrolled .history-title.hide-scrolled) {
    opacity: 0;
  }
  :global(body .history-title.show-scrolled) {
    opacity: 0;
  }
  :global(.scrolled .history-title.show-scrolled) {
    opacity: 1;
  }

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

<NLayout pageTitle={appTitle} {style}>

  <header slot="header">
    <NToolbar className="container px-2">
      <Button color="none" shape="circle" className="tap-icon" on:click={methods.search}>
        <NIcon name="search" size={24} />
      </Button>
      <div class=" filler pl-2 truncate history-title show-scrolled">
        <Text>
          {#if refreshing}
            <Spinner size="16" />
          {/if}
          {state.date.format('ddd')} {state.date.format($UserStore.meta.is24Hour ? 'Do MMM YYYY' : 'MMM Do YYYY')}
        </Text>

        <!-- end text middle -->
      </div>
      <NextPrevCal on:previous={methods.previous} on:next={methods.next} on:calendar={methods.selectDate} {isToday} />
    </NToolbar>

  </header>
  <!-- end header-content header -->

  <main slot="content" class="page page-history flex-column">

    <div class="container p-0 px-1">
      <Text size="xl" bold className="history-title px-2 mt-2">
        {state.date.format($UserStore.meta.is24Hour ? 'ddd Do MMM YYYY' : 'ddd MMM Do YYYY')}
      </Text>

      <OfflineQueue />
      {#if loading}
        <div class="empty-notice">
          <Spinner />
        </div>
      {:else if logs.length === 0 && !showSearch}
        {#if !searchMode}
          <div class="empty-notice" style="height:30vh;">{Lang.t('history.no-records-found')}</div>
        {/if}
        <!-- If Logs and Not refreshing  -->
      {:else}
        <!-- Loop over logs -->
        {#each logs as log, index}
          <LogItem
            {log}
            on:textClick={(event) => {
              methods.textClick(event);
            }} />
        {/each}

        <!--
          on:trackerClick={(event) => {
              methods.trackerTapped(event.detail.tracker, log);
            }}
            on:personClick={(event) => {
              methods.personTapped(event.detail.person, log);
            }}
            on:contextClick={(event) => {
              methods.contextTapped(event.detail.context, log);
            }}
            
            on:moreClick={(event) => {
              Interact.logOptions(log).then(() => {});
            }} 
        -->

        <!--
          Search Results
          If Search Mode and We have Logs
        -->
      {/if}

    </div>

    <div class="bg-primary-bright mt-3">
      <div class="container p-0">
        <!-- Show History if exists -->
        {#if $LedgerStore.memories.length > 0 && !showSearch && isToday}
          <div class="memories">
            {#each $LedgerStore.memories as log}
              <div class="memories-log-header">
                <Button
                  color="transparent"
                  on:click={() => {
                    methods.goto(dayjs(log.end));
                  }}>
                  From {dayjs(log.end).fromNow()}
                  <NIcon name="chevronRight" className="fill-white" />
                </Button>
              </div>
              <LogItem
                fullDate
                className="aged"
                {log}
                on:textClick={(event) => {
                  methods.textClick(event);
                }} />
            {/each}
          </div>
        {/if}
        <!-- end history -->
      </div>
    </div>

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

  <div slot="bottom" class="map-base">
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
        <div class="content-map">
          <NMap {locations} />
          <Button
            color="light"
            shape="circle"
            on:click={() => {
              state.showAllLocations = !state.showAllLocations;
            }}>
            <NIcon name="closeFilled" size="32" />
          </Button>

        </div>
      {/if}
    {/if}

  </div>
  <!-- end header-content content -->

</NLayout>

{#if state.location.lat}
  <NModal show={true} title={state.location.name || 'Location'}>
    <NMap locations={[state.location]} />
    <button class="btn btn-lg btn-primary btn-block mb-0" on:click={methods.clearLocation} slot="footer">Close</button>
  </NModal>
{/if}

{#if local.showDatePicker}
  <NModal show={true} title={'Select a Date'}>
    <NDatePicker
      on:change={(event) => {
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
