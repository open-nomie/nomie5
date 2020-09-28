<script lang="ts">
  import LogListLoader from "../../components/log-list/log-list-loader.svelte";
  import SearchBar from "../../components/search-bar/search-bar.svelte";
  import type NLog from "../../modules/nomie-log/nomie-log";
  import { Interact } from "../../store/interact";
  export let term: string;
  let results: Array<NLog> = [];
</script>

<section class="n-panel stiff">
  <SearchBar compact showClose={false} className="filler" searchTerm={term || ''} placeholder="Search People..." />
  <!-- 
  on:clear={methods.clearSearch}
  on:search={methods.onSearchEnter}  -->
</section>
<section class="n-panel scroll-y column">
  {#if term}
    <div class="search-results people">Show Results</div>
  {:else}
    <div class="search-results people empty">No Results</div>
  {/if}

</section>
