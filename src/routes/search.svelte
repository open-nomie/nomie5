<script lang="ts">
  // svelte
  import { navigate, Router, Route } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";
  // components
  import NItem from "../components/list-item/list-item.svelte";
  import Icon from "../components/icon/icon.svelte";
  import NLogListLoader from "../components/log-list/log-list-loader.svelte";
  import Spinner from "../components/spinner/spinner.svelte";
  import LogItem from "../components/list-item-log/list-item-log.svelte";
  import NSearchBar from "../components/search-bar/search-bar.svelte";

  import config from "../config/appConfig";

  // Containers
  import NMap from "../containers/map/map.svelte";
  import NLayout from "../containers/layout/layout.svelte";
  // Utils
  import dayjs from "dayjs";
  import tick from "../utils/tick/tick";

  // Stores
  import { Interact } from "../store/interact";
  import { Lang } from "../store/lang";

  import { Device } from "../store/device-store";
  import Storage from "../modules/storage/storage";
  import { getURLParams } from "../utils/url-parser/url-parser";
  import global from "../config/appConfig";
  import Text from "../components/text/text.svelte";
  import Button from "../components/button/button.svelte";
  import { SearchStore, SearchTerm } from "../store/search-store";

  export const location = undefined;
  export const style = undefined;

  export let term;
  /**
   * I've messed this all up again. but it's faster and more responsivle
   * TODO: refactor so it's clean and using the proper amount of Store vs local
   */
  const SEARCHES_PATH = `${global.data_root}/searches`;

  let searchInput;
  let appTitle = null;
  let showSearch = false;

  let logResults: Array<any> = [];

  let searchTerm: SearchTerm;

  const state = {
    date: dayjs(new Date()),
    searchTerm: searchTerm,
    editMode: false,
    showAllLocations: false,
  }; // Assign State to compiled history page

  $: state.searchTerm = $SearchStore.active;

  let refreshing = false;

  let loading = true;
  let book = undefined;
  let locations = [];
  let mode = "view";
  let refreshMap: boolean = false;
  // let dayScore = 0;

  $: appTitle = `🔍 Search ${(state.searchTerm || {}).term || ""}`;

  $: if (logResults) {
    refreshMap = true;
    setTimeout(() => {
      refreshMap = false;
    }, 12);
  }

  function toggleEditMode() {
    if (mode == "edit") {
      mode = "view";
    } else {
      mode = "edit";
    }
  }

  // Methods
  const methods = {
    async doSearch(event) {
      $SearchStore.active = null;
      let trackableElement = event.detail;
      tick(100);
      if (trackableElement.type == "tracker") {
        $SearchStore.active = new SearchTerm(`#${trackableElement.id}`);
      } else {
        $SearchStore.active = new SearchTerm(`${trackableElement.raw}`);
      }
      showSearch = true;
      methods.onSearchEnter(event);
    },
    async textClick(event) {
      let trackableElement = event.detail;
      Interact.elementOptions(trackableElement);
    },
    clearSearch() {
      window.history.replaceState({}, document.title, window.location.href.split("?")[0]);
      showSearch = false;
      $SearchStore.active = null;
    },
    searchChange(evt: string | any) {
      let term = typeof evt == "string" ? evt : evt.detail;
      SearchStore.search(term);
      window.scrollTo(0, 0);
    },
    async onSearchEnter(evt) {
      methods.searchChange(evt);
      await tick(100);
      window.scrollTo(0, 0);
      showSearch = true;
    },
  };

  function back() {
    if (state.searchTerm && state.searchTerm.term) {
      methods.clearSearch();
    } else {
      navigate("/history");
      // window.history.back();
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

  function deleteSearch(searchTerm: SearchTerm) {
    SearchStore.remove(searchTerm);
  }

  onMount(() => {
    window.scrollTo(0, 0);
  });
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
    <div class="n-row container h-100 px-2">
      <Button color="transparent" shape="circle" icon className="tap-icon mr-2" on:click={back}>
        {#if state.searchTerm && state.searchTerm.term}
          <Icon name="close" />
        {:else}
          <Icon name="arrowBack" />
        {/if}
      </Button>
      <div class="filler">
        <!-- on:change={methods.searchChange} -->
        <NSearchBar
          showClose={false}
          className="filler"
          searchTerm={(state.searchTerm || {}).term || ''}
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
      {#if state.searchTerm && state.searchTerm.term}
        <NLogListLoader
          bind:results={logResults}
          term={state.searchTerm.term}
          limit={20}
          className="bg-transparent"
          on:textClick={(event) => {
            methods.textClick(event);
          }}
          on:moreClick={(event) => {
            Interact.logOptions(event.detail).then(() => {});
          }} />
      {:else}
        {#if $SearchStore.saved.length}
          <NItem itemDivider compact className="bg-transparent">
            Previous Searches
            <div slot="right">
              {#if mode != 'edit'}
                <Button
                  color="transparent"
                  size="sm"
                  on:click={() => {
                    toggleEditMode();
                  }}>
                  {Lang.t('general.edit', 'Edit')}
                </Button>
              {:else}
                <Button
                  size="sm"
                  color="transparent"
                  className="text-red"
                  on:click={() => {
                    toggleEditMode();
                  }}>
                  {Lang.t('general.done', 'Done')}
                </Button>
              {/if}
            </div>
          </NItem>
          {#each $SearchStore.saved as searchTerm (searchTerm.term)}
            <NItem
              clickable={mode !== 'edit'}
              bottomLine
              on:click={(evt) => {
                if (mode == 'view') {
                  $SearchStore.active = searchTerm;
                  methods.onSearchEnter({ detail: searchTerm });
                }
              }}>
              <Text>{searchTerm.term}</Text>
              <div slot="right">
                {#if mode == 'edit'}
                  <Button
                    size="sm"
                    color="danger"
                    on:click={() => {
                      deleteSearch(searchTerm);
                    }}>
                    Delete
                  </Button>
                {/if}
              </div>
            </NItem>
          {/each}
        {/if}
        <div class="empty-notice">
          <div style="width:250px;">
            {#if !$SearchStore.saved.length}
              <Icon name="search" size="120" className="fill-primary-bright mb-4" />
            {/if}
            <Text size="lg" className="mb-2">History Search</Text>
            <Text size="sm" faded>
              Nome will search 6 months at a time, starting from the most recent records. Use AND and OR to refine your search.
            </Text>
          </div>
        </div>
      {/if}

      <!-- end history -->

    </div>
    {#if state.searchTerm && logResults.length && !refreshMap}
      {#if !state.showAllLocations}
        <div
          class="mini-map closed"
          on:click={() => {
            state.showAllLocations = !state.showAllLocations;
          }}>
          <NMap records={logResults} />
        </div>
      {:else}
        <div class="mini-map opened">
          <NMap records={logResults} />
          <Button
            color="light"
            shape="circle"
            on:click={() => {
              state.showAllLocations = !state.showAllLocations;
            }}>
            <Icon name="closeFilled" size="32" />
          </Button>
        </div>
      {/if}
    {/if}

  </main>
  <!-- end header-content content -->

</NLayout>
