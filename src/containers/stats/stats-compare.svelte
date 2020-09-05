<script lang="ts">
  import type { ITracker } from "../../modules/tracker/tracker";
  import type { IStats } from "../../modules/stats/statsV5";
  import ListItem from "../../components/list-item/list-item.svelte";
  import BarChart from "../../components/charts/bar-chart-2.svelte";
  import { Interact } from "../../store/interact";
  import Icon from "../../components/icon/icon.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { Lang } from "../../store/lang";
  import { TrackerStore } from "../../store/tracker-store";
  import { UserStore } from "../../store/user-store";
  import StatsRef from "../../modules/stats/stats-ref";
  import extract from "../../utils/extract/extract";
  import tick from "../../utils/tick/tick";
  import dataDistance from "../../modules/data-distance/data-distance";
  import math from "../../utils/math/math";
  import Button from "../../components/button/button.svelte";
  import Spinner from "../../components/spinner/spinner.svelte";
  import Text from "../../components/text/text.svelte";

  const dispatch = createEventDispatcher();

  export let stats: IStats;
  export let fromDate: any;
  export let toDate: any;
  export let timeSpan: string;
  export let remember: Function;
  export let selected: any;

  const state = {
    compare: [],
    selected: {
      index: null,
    },
  };

  let lastTracker;

  onMount(() => {
    loadSavedCompares();
  });

  async function compareTracker() {
    let trackers: any = await Interact.select("tracker", true);
    if (trackers.length) {
      for (var i = 0; i < trackers.length; i++) {
        const tracker = trackers[i];
        const compareObj = await getTrackerStats(tracker);
        state.compare.push(compareObj);
      }
      state.compare = state.compare;
      rememberCompare();
    }
  }

  function rememberCompare() {
    let comparing = state.compare.map((statRef) => statRef.getSearchTerm());
    remember("compare", comparing);
  }

  async function loadSavedCompares() {
    let savedCompares = remember("compare");
    // If we do - then lets load them each up
    if (state.compare.length == 0 && savedCompares) {
      // Loop over compares
      (savedCompares || [])
        .filter((row) => row)
        .forEach((searchTerm) => {
          let type = extract.toElement(searchTerm);
          type.obj = type.type == "tracker" ? TrackerStore.byTag(type.id) : {};
          state.compare.push(
            new StatsRef({
              id: `compare-${Math.random()}`,
              type: type.type,
              key: type.id,
              math: type.obj.math || "sum",
              label: type.id,
              base: type.obj,
              is24Hour: $UserStore.meta.is24Hour,
            })
          );
        });
    }
    // Put it here to show its loading
    state.compare = state.compare;
    // Get Stats for Compares
    for (let i = 0; i < state.compare.length; i++) {
      let stats = await state.compare[i].getStats(timeSpan, fromDate, toDate);
    }
    state.compare = state.compare;
  } // end load saved compares

  async function comparePerson() {
    let people: any = await Interact.select("person", true);
    if (people.length) {
      for (var i = 0; i < people.length; i++) {
        const person = people[i];
        let compareObj = new StatsRef({
          type: "person",
          key: person.username,
          label: person.displayName,
          base: person,
          is24Hour: $UserStore.meta.is24Hour,
        });
        await compareObj.getStats(timeSpan, fromDate, toDate);
        state.compare.push(compareObj);
      }
      state.compare = state.compare;
      rememberCompare();
    }
  }

  async function compareContext() {
    let contexts: any = await Interact.select("context", true);
    if (contexts.length) {
      for (var i = 0; i < contexts.length; i++) {
        const context = contexts[i];
        let compareObj = new StatsRef({
          type: "context",
          key: context,
          label: context,
          base: context,
          is24Hour: $UserStore.meta.is24Hour,
        });
        await compareObj.getStats(timeSpan, fromDate, toDate);
        state.compare.push(compareObj);
      }
      state.compare = state.compare;
      rememberCompare();
    }
  }

  async function compareSearchTerm() {
    let item: any = await Interact.prompt("Term", null);
    if (item) {
      let compareObj = new StatsRef({
        type: "search",
        key: item,
        label: item,
        base: item,
        is24Hour: $UserStore.meta.is24Hour,
      });
      await compareObj.getStats(timeSpan, fromDate, toDate);
      state.compare.push(compareObj);
    }
    state.compare = state.compare;
    rememberCompare();
  }

  async function compareType() {
    let types = ["Tracker", "Person", "Context", "Search Term", "Pick for me"];
    Interact.popmenu({
      buttons: types.map((type) => {
        return {
          title: `${type}...`,
          async click() {
            switch (type) {
              case "Tracker":
                await compareTracker();
                break;
              case "Person":
                await comparePerson();
                break;
              case "Context":
                await compareContext();
                break;
              case "Search Term":
                await compareSearchTerm();
                break;
              case "Pick for me":
                await findRelatedTrackers();
                break;
            }
          },
        };
      }),
    });
  }

  async function getTrackerStats(tracker) {
    let compareObj = new StatsRef({
      type: "tracker",
      key: tracker.tag,
      label: tracker.label,
      base: tracker,
      is24Hour: $UserStore.meta.is24Hour,
    });
    await compareObj.getStats(timeSpan, fromDate, toDate);
    return compareObj;
  }

  /**
   * RSquared
   * A crazy ass function!!!
   * This will load up the the stats for EVERY tracker
   * for the current time period, and run a
   * RSquared distance function on each to identify
   * any that have simular patterns.
   */
  async function findRelatedTrackers() {
    Interact.blocker("Looking for related...");
    // Clear Compare
    state.compare = [];
    await tick(40);
    let compareItems = {};
    let trackerTags = Object.keys($TrackerStore.trackers);
    let activeTrackerValues = stats.chart.values.map((point) => point.y);
    // Loop over trackers
    for (var i = 0; i < trackerTags.length; i++) {
      let tag = trackerTags[i]; // get tag
      let tracker = $TrackerStore.trackers[tag]; // get tracker
      let results: any = await getTrackerStats(tracker); // get stats
      let compareValues = results.stats.chart.values.map((point) => point.y); // get y values
      let distance = await dataDistance.score(activeTrackerValues, compareValues); // calculate distance
      results.distance = distance;
      compareItems[tag] = {
        stats: results,
        distance: distance,
      };
    }
    // Generate Results
    let maxScore = 0;
    let results = Object.keys(compareItems)
      .map((tag) => {
        return {
          tag,
          stats: compareItems[tag].stats,
          value: compareItems[tag].distance,
        };
      })
      // Remove any 0 values (exact match)
      .filter((r) => r.value && !isNaN(r.value))
      .sort((a, b) => {
        if (a.value > maxScore) {
          maxScore = a.value;
        }
        // Sort by Lowest value
        return a.value > b.value ? -1 : 1;
      })
      // Remove anything over 5000 and only 5
      .filter((r, index) => {
        if (index < 11) {
          return true;
        } else {
          return false;
        }
      })
      .map((r) => {
        r.stats.distance = math.percentage(maxScore, r.value);
        return r;
      });

    // Loop over results
    for (var i = 0; i < results.length; i++) {
      let tag = results[i].tag;
      let tracker = $TrackerStore.trackers[tag];
      if (tracker) {
        let stats = compareItems[tag].stats;
        state.compare.push(stats);
      }
    }
    // Hit it again for svelte array
    state.compare = state.compare;
    // Save trackers for later
    rememberCompare();
    // Close blocker
    Interact.stopBlocker();
  }

  function removeCompare(compare) {
    state.compare = state.compare.filter((row) => {
      return row != compare;
    });
    rememberCompare();
  }
</script>

<style lang="scss">
  :global(.chart-item.solo.n-item) {
    margin: 8pt 0;
    width: calc(100% - 0px);
    border-radius: 0px;
    padding: 8px 0;
    padding-right: 8px;
  }

  :global(.chart-item) {
    position: relative;
    .btn-close {
      position: absolute;
      top: 5px;
      left: 6px;
      padding: 0;
      height: 20px;
      width: 20px;
      border: solid 1px var(--color-solid-2);
      background-color: var(--color-solid);
      svg {
        height: 18px;
        width: 18px;
      }
    }
  }

  .distance {
    font-size: 12px;
    color: var(--color-solid-3);
    position: absolute;
    top: 10px;
    right: 16px;
    text-align: center;
  }
  :global(.chart-item .btn-close svg) {
    fill: var(--color-inverse) !important;
  }
</style>

{#if stats}
  <div class="charts">

    {#each state.compare as compare (compare.id)}
      {#if compare.stats}
        <ListItem className="solo chart-item">

          {#if compare.distance}
            <div class="distance">
              <strong>{compare.distance.toFixed(0)}</strong>
            </div>
          {/if}

          <BarChart
            height={120}
            title={`${compare.getSearchTerm()}`}
            color={compare.getTracker().color}
            labels={compare.stats.chart.values.map((point) => point.x)}
            points={compare.stats.chart.values}
            on:swipeLeft={() => {
              dispatch('nextDate');
            }}
            on:swipeRight={() => {
              dispatch('previousDate');
            }}
            on:more={(evt) => {
              Interact.onThisDay(evt.detail.date.toDate());
            }}
            on:titleClick={(event) => {
              Interact.openStats(compare.getSearchTerm());
            }}
            on:tap={(event) => {
              dispatch('dateSelected', event.detail);
            }}
            activeIndex={selected.index}
            yFormat={(y) => {
              return compare.getTracker().displayValue(y);
            }} />
          <!--  -->

          <button
            class="btn btn-clear btn-close"
            on:click={() => {
              removeCompare(compare);
            }}>
            <Icon name="close" size="16" />
          </button>
        </ListItem>
      {:else}
        <ListItem className="solo chart-item">
          <div slot="left" class="pl-3">
            <Spinner size={18} />
          </div>
          <Text size="sm">${compare.getSearchTerm()} {Lang.t('general.loading', 'Loading')}</Text>
        </ListItem>
      {/if}
    {/each}
  </div>

  {#if state.compare.length == 0}
    <div class="p-2" />
  {/if}

  <div class="p-2 pt-2 n-row">
    <Button className="mr-1" block color="light" on:click={findRelatedTrackers}>{Lang.t('stats.find-related', 'Auto Compare')}...</Button>
    <Button className="ml-1" block color="light" on:click={compareType}>{Lang.t('stats.select-comparison', 'Select Manually')}...</Button>
  </div>
{/if}
