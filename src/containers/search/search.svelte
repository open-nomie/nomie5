<script lang="ts">
  // svelte
  import { navigate, Router, Route } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";
  // components
  import Icon from "../../components/icon/icon.svelte";

  import _ from "lodash";

  // Utils
  import dayjs from "dayjs";

  // Stores
  import { Lang } from "../../store/lang";

  import Button from "../../components/button/button.svelte";
  import { SearchStore, SearchTerm } from "../../store/search-store";
  import type { SearchModes } from "../../store/search-store";
  import SearchHistory from "./search-history.svelte";
  import SearchTrackers from "./search-trackers.svelte";
  import SearchPeople from "./search-people.svelte";
  import SearchRecent from "./search-recent.svelte";
  import Modal from "../../components/modal/modal.svelte";

  export const location = undefined;
  export const style = undefined;

  export const className = "";
  // export let view: SearchModes = "history";
  // export let term: string = undefined;

  // const SEARCHES_PATH = `${global.data_root}/searches`;

  // let searchInput;

  // let logResults: Array<any> = [];

  let placeholder: string = "Search...";

  let searchMode: SearchModes = "history";
  // const setView = (view: SearchModes) => {
  //   console.log("Setting View to ", view);
  //   // searchMode = view;
  //   placeholder = `${Lang.t("general.search", "Search")} ${_.capitalize(view)}...`;
  // };

  $: if ($SearchStore.view && $SearchStore.show === true) {
    console.log("Search setting view");
    placeholder = `${Lang.t("general.search", "Search")} ${_.capitalize($SearchStore.view)}...`;
    // setView(view);
  }

  function back() {
    SearchStore.close();
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
      <div class="filler btn-group compact px-2" style="box-shadow:none;">
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
    {#if $SearchStore.view === 'history' && $SearchStore.show}
      <SearchHistory term={($SearchStore.active || {}).term} />
    {:else if $SearchStore.view === 'trackers' && $SearchStore.show}
      <SearchTrackers term={($SearchStore.active || {}).term} />
    {:else if $SearchStore.view === 'people' && $SearchStore.show}
      <SearchPeople term={($SearchStore.active || {}).term} />
    {/if}
    {#if !$SearchStore.active && $SearchStore.show}
      <SearchRecent />
    {/if}
  </main>
  <div slot="footer" />
</Modal>
