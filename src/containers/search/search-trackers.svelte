<script lang="ts">
  import LogListLoader from "../../components/log-list/log-list-loader.svelte";
  import SearchBar from "../../components/search-bar/search-bar.svelte";
  import Text from "../../components/text/text.svelte";
  import type NLog from "../../modules/nomie-log/nomie-log";
  import { Interact } from "../../store/interact";
  import { TrackerStore } from "../../store/tracker-store";
  export let term: string;
  let results: Array<NLog> = [];
</script>

<section class="n-panel stiff">
  <SearchBar compact showClose={false} className="filler" searchTerm={term || ''} placeholder="Search Trackers..." />
  <!-- 
  on:clear={methods.clearSearch}
  on:search={methods.onSearchEnter}  -->
</section>
{#if term}
  <section class="search-results trackers n-panel scroll-y column">Tracker Results</section>
{:else}
  <section class="search-results trackers n-panel empty center-all column px-4">
    <Text size="lg" className="mb-2" center>Search for Trackers</Text>
    <Text size="sm" faded center className="mb-4">Search through your {Object.keys($TrackerStore.trackers).length} trackers</Text>
  </section>
{/if}
