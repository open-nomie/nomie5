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
  import ButtonGroup from "../../components/button-group/button-group.svelte";

  export const location = undefined;
  export const style = undefined;

  export const className = "";

  function back() {
    SearchStore.close();
  }
</script>

<style lang="postcss" global>
  .search-modal {
    z-index: 1300 !important;
  }
</style>

<Modal show={$SearchStore.show} fullscreen bodyClass="bg-bg" className="search-modal" ariaLabel="Search">
  <div slot="raw-header">
    <nav class="flex px-2 py-1">
      <div class="left" style="width:40px;">
        <Button color="transparent" shape="circle" icon className="tap-icon mr-2" on:click={back}>
          <Icon name="close" />
        </Button>
      </div>
      <ButtonGroup>
        <Button
          on:click={() => {
            SearchStore.view('history');
          }}
          className={$SearchStore.view == 'history' ? 'active' : ''}>
          {Lang.t('general.history', 'History')}
        </Button>
        <Button
          on:click={() => {
            SearchStore.view('trackers');
          }}
          className={$SearchStore.view == 'trackers' ? 'active' : ''}>
          {Lang.t('general.trackers', 'Trackers')}
        </Button>
        <Button
          on:click={() => {
            SearchStore.view('people');
          }}
          className={$SearchStore.view == 'people' ? 'active' : ''}>
          {Lang.t('general.people', 'People')}
        </Button>
      </ButtonGroup>
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
