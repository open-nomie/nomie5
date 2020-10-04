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
  import Modal from "../../components/modal/modal.svelte";

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
    clearSearch() {
      window.history.replaceState({}, document.title, window.location.href.split("?")[0]);
      SearchStore.clear();
    },
  };

  function back() {
    if ($SearchStore.active) {
      SearchStore.clear();
    } else {
      SearchStore.close();
      // window.history.back();
    }
  }

  onMount(() => {
    window.scrollTo(0, 0);
  });
</script>

<style lang="scss" type="text/scss">
  :global(.search-modal) {
    z-index: 1300 !important;
  }
</style>

<Modal show={$SearchStore.show} fullscreen bodyClass="bg-bg" className="search-modal">
  <div slot="raw-header">
    <nav class="n-row px-2 py-1">
      <div class="left" style="width:40px;">
        <Button color="transparent" shape="circle" icon className="tap-icon mr-2" on:click={back}>
          <Icon name="close" />
        </Button>
      </div>
      <div class="filler btn-group compact px-2">
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
  </div>
  <main>
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
  <div slot="footer" />
</Modal>
