<script>
  /**
   * History Tab
   * A big collection of all things history
   *
   * TODO: Have it react when the ledger change, not a hard refresh
   */

  // svelte
  import { navigate, Router, Route } from "svelte-routing";
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
  import { UserStore } from "../store/user-store";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/tracker-store";
  import { LedgerStore } from "../store/ledger";
  import { Lang } from "../store/lang";

  import { HistoryPage } from "../store/history-page";
  import { Device } from "../store/device-store";
  import Storage from "../modules/storage/storage";
  import { getURLParams } from "../utils/url-parser/url-parser";
  import global from "../../config/global";
  import Icon from "../components/icon/icon.svelte";
  import Text from "../components/text/text.svelte";

  /**
   * I've messed this all up again. but it's faster and more responsivle
   * TODO: refactor so it's clean and using the proper amount of Store vs local
   */
  const SEARCHES_PATH = `${global.data_root}/searches`;

  let searchInput;
  let appTitle = null;
  let showSearch = false;

  let lastSearches = [];

  const state = {
    date: dayjs(new Date()),
    logs: [],
    trackers: {},
    ledger: null,
    searchTerm: "",
    searchResults: null,
    searchMode: false,
    selected: {},
    selectCount: 0,
    editMode: false,

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
  // let dayScore = 0;

  $: appTitle = `🔍 Search ${state.searchTerm}`;

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
      Interact.elementOptions(trackableElement);
    },

    clearSearch() {
      showSearch = false;
      state.searchTerm = "";
    },

    searchChange(evt) {
      state.searchTerm = evt.detail;
      showSearch = false;
      window.scrollTo(0, 0);
      if (lastSearches.indexOf(state.searchTerm) == -1) {
        lastSearches.push(state.searchTerm);
        Storage.local.put(SEARCHES_PATH, lastSearches);
      }
    },
    async onSearchEnter(evt) {
      methods.searchChange(evt);
      await tick(100);
      window.scrollTo(0, 0);
      showSearch = true;
    },
  };

  function back() {
    if (state.searchTerm && state.searchTerm.length) {
      methods.clearSearch();
    } else {
      navigate("/history");
    }
  }

  async function refresh() {
    refreshing = true;
    refreshing = false;
  }

  // If a new Log is added, or changed update the list.
  let onLogUpdate;
  let onLogSaved;
  let onLogsDeleted;

  function deleteSearch(term) {
    lastSearches = lastSearches.filter((t) => {
      return t !== term;
    });
    Storage.local.put(SEARCHES_PATH, lastSearches);
  }

  // WHen mounted.
  onMount(() => {
    console.log(Storage.local);
    lastSearches = Storage.local.get(SEARCHES_PATH) || [];

    const urlParams = getURLParams(window.location.href);
    if (urlParams.q) {
      state.searchTerm = decodeURIComponent(urlParams.q);
    }
    window.scrollTo(0, 0);
    refresh();
  });
  onDestroy(() => {});
</script>

<style lang="scss" type="text/scss">
  .map-btn {
    position: absolute;
    left: 10px;
    bottom: 10px;
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 12px;
  }

  .page-search {
    .show-map {
      height: 200px;
      min-height: 200px;
      max-height: 400px;
    }
  }

  :global(.page-search .n-item .n-item:last-child) {
    border-bottom: none !important;
  }
</style>

<NLayout pageTitle={appTitle} showTabs={false}>

  <header slot="header">
    <div class="n-row container">
      <button class="btn btn-clear btn-icon tap-icon pr-1" on:click={back}>
        {#if state.searchTerm && state.searchTerm.length > 0}
          <NIcon name="close" />
        {:else}
          <NIcon name="arrowBack" />
        {/if}
      </button>
      <div class="filler">
        <!-- on:change={methods.searchChange} -->
        <NSearchBar
          showClose={false}
          className="filler"
          searchTerm={state.searchTerm}
          placeholder="Search History..."
          on:clear={methods.clearSearch}
          on:search={methods.onSearchEnter} />
      </div>

    </div>

    <!-- hasResults={(searchLogs || []).length > 0} -->

  </header>
  <!-- end header-content header -->

  <main slot="content" class="page page-search">

    <div class="container p-0">
      {#if state.searchTerm && state.searchTerm.length}
        <NLogListLoader
          term={state.searchTerm}
          limit={20}
          on:textClick={(event) => {
            methods.textClick(event);
          }}
          on:moreClick={(event) => {
            Interact.logOptions(event.detail).then(() => {});
          }} />
      {:else}
        {#if lastSearches.length}
          <NItem itemDivider compact className="bg-transparent">Previous Searches</NItem>
          {#each lastSearches as term}
            <NItem
              bottomLine
              on:click={() => {
                state.searchTerm = term;
                methods.onSearchEnter({ detail: term });
              }}>
              <Text>{term}</Text>
              <button
                class="btn btn-clear"
                slot="right"
                on:click|preventDefault={() => {
                  deleteSearch(term);
                }}>
                <Icon name="closeOutline" className="fill-inverse-2" />
              </button>
            </NItem>
          {/each}
        {/if}
        <div class="empty-notice">Search to begin</div>
      {/if}

      <!-- end history -->

    </div>

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

  </main>
  <!-- end header-content content -->

</NLayout>
