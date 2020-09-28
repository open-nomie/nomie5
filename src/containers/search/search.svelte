<script lang="ts">
  // svelte
  import { navigate, Router, Route } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";
  // components
  import NItem from "../../components/list-item/list-item.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import NLogListLoader from "../../components/log-list/log-list-loader.svelte";
  import Spinner from "../../components/spinner/spinner.svelte";
  import LogItem from "../../components/list-item-log/list-item-log.svelte";
  import NSearchBar from "../../components/search-bar/search-bar.svelte";

  import config from "../../config/appConfig";

  import _ from "lodash";

  // Containers
  import NMap from "../../containers/map/map.svelte";
  import NLayout from "../../containers/layout/layout.svelte";
  // Utils
  import dayjs from "dayjs";
  import tick from "../../utils/tick/tick";

  // Stores
  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";

  import { Device } from "../../store/device-store";
  import Storage from "../../modules/storage/storage";
  import { getURLParams } from "../../utils/url-parser/url-parser";
  import global from "../../config/appConfig";
  import Text from "../../components/text/text.svelte";
  import Button from "../../components/button/button.svelte";
  import { SearchStore, SearchTerm } from "../../store/search-store";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Toolbar from "../../components/toolbar/toolbar.svelte";
  import SearchHistory from "./search-history.svelte";
  import SearchTrackers from "./search-trackers.svelte";
  import SearchPeople from "./search-people.svelte";
  import SearchRecent from "./search-recent.svelte";

  export const location = undefined;
  export const style = undefined;

  export const className = "";
  export const view: SearchModes = "history";
  export const term: string = undefined;

  // const SEARCHES_PATH = `${global.data_root}/searches`;

  // let searchInput;

  // let logResults: Array<any> = [];

  let placeholder: string = "Search...";

  let searchMode: SearchModes = "history";
  const setView = (view: SearchModes) => {
    searchMode = view;
    placeholder = `${Lang.t("general.search", "Search")} ${_.capitalize(view)}...`;
  };
  $: if (view) {
    setView(view);
  }

  let searchTerm: SearchTerm;
  const state = {
    date: dayjs(new Date()),
    searchTerm: searchTerm,
    editMode: false,
    showAllLocations: false,
  }; // Assign State to compiled history page

  // $: state.searchTerm = $SearchStore.active;

  let refreshing: boolean = false;

  let loading: boolean = true;

  let mode = "view";

  // let dayScore = 0;

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

</style>

<main class="n-panel search-container column fixed">
  <section class="n-panel header column stiff">
    <nav class="n-row px-2 py-1">
      <div class="left" style="width:40px;">
        <Button color="transparent" shape="circle" icon className="tap-icon mr-2" on:click={back}>
          <Icon name="close" />
        </Button>
      </div>
      <div class="filler btn-group compact px-2 py-1">
        <Button
          size="sm"
          on:click={() => {
            SearchStore.view('history');
          }}
          className={$SearchStore.view == 'history' ? 'active' : ''}>
          {Lang.t('general.history', 'History')}
        </Button>
        <Button
          size="sm"
          on:click={() => {
            SearchStore.view('trackers');
          }}
          className={$SearchStore.view == 'trackers' ? 'active' : ''}>
          {Lang.t('general.trackers', 'Trackers')}
        </Button>
        <Button
          size="sm"
          on:click={() => {
            SearchStore.view('people');
          }}
          className={$SearchStore.view == 'people' ? 'active' : ''}>
          {Lang.t('general.people', 'People')}
        </Button>
      </div>
      <div style="width:40px" />
    </nav>
  </section>

  {#if $SearchStore.view === 'history'}
    <SearchHistory {term} />
  {:else if $SearchStore.view === 'trackers'}
    <SearchTrackers {term} />
  {:else if $SearchStore.view === 'people'}
    <SearchPeople {term} />
  {/if}

  {#if !$SearchStore.active}
    <SearchRecent />
  {/if}

</main>
<!-- end header-content header -->

<!-- 

  <div class="container p-0">
    {#if state.searchTerm && state.searchTerm.term}
      <NLogListLoader
        fullDate={true}
        showTimeDiff={true}
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
            Nomie will search 6 months at a time, starting from the most recent records. Use AND and OR to refine your search.
          </Text>
        </div>
      </div>
    {/if}
  </div> -->

<!-- end header-content content -->
