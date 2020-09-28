<script lang="ts">
  import type { t } from "i18next";
  import LogListLoader from "../../components/log-list/log-list-loader.svelte";
  import SearchBar from "../../components/search-bar/search-bar.svelte";
  import Text from "../../components/text/text.svelte";
  import type { ITrackers } from "../../modules/import/import";
  import type NLog from "../../modules/nomie-log/nomie-log";
  import TrackableElement from "../../modules/trackable-element/trackable-element";
  import type TrackerConfig from "../../modules/tracker/tracker";
  import TrackerInputer from "../../modules/tracker/tracker-inputer";
  import { ActiveLogStore } from "../../store/active-log";
  import { Interact } from "../../store/interact";
  import { LedgerStore } from "../../store/ledger";
  import { SearchStore, SearchTerm } from "../../store/search-store";
  import { TrackerStore } from "../../store/tracker-store";
  import TrackerList from "../board/trackers.svelte";
  export let term: string;

  let trackers: Array<TrackerConfig> = [];

  function change(evt: CustomEvent) {
    term = evt.detail;
    if ((evt.detail || "").length) {
      trackers = Object.keys($TrackerStore.trackers)
        .map((tag: string) => {
          return $TrackerStore.trackers[tag];
        })
        .filter((tracker: TrackerConfig) => {
          return tracker.label.search(term.toLowerCase()) > -1 || tracker.tag.search(term.toLowerCase()) > -1;
        });
      trackers = trackers;
    } else {
    }
  }

  function more(evt: CustomEvent) {
    const tracker: TrackerConfig = evt.detail;
    Interact.elementOptions(tracker.getTrackableElement());
  }
  async function trackerTap(evt: CustomEvent) {
    const tracker: TrackerConfig = evt.detail;
    console.log("tapped passing to interact", tracker);

    SearchStore.save(
      new SearchTerm({
        term: `#${tracker.tag}`,
        type: "trackers",
      })
    );

    await Interact.trackerTap(tracker, $TrackerStore.trackers);
    console.log("did it finish?");
  }
</script>

<section class="n-panel stiff">
  <SearchBar compact className="filler" searchTerm={term || ''} placeholder="Search Trackers..." on:change={change} />
  <!-- 
  on:clear={methods.clearSearch}
  on:search={methods.onSearchEnter}  -->
</section>
{#if term}
  <section class="search-results trackers n-panel scroll-y column">
    {#if trackers.length}
      <TrackerList view="list" {trackers} on:tap={trackerTap} on:more={more} />
    {/if}
  </section>
{/if}
