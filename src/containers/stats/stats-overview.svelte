<script lang="ts">
  import type { IStats } from "../../modules/stats/statsV5";
  import ListItem from "../../components/list-item/list-item.svelte";
  import type Tracker from "../../modules/tracker/tracker";
  import HScroller from "../../components/h-scroller/h-scroller.svelte";
  import math from "../../utils/math/math";

  export let stats: IStats;
  export let tracker: Tracker;

  function formatValue(value: number, includeUnit?: boolean) {
    if (tracker) {
      return tracker.displayValue(value, includeUnit);
    }
    return value;
  }
  function getScore() {
    let score = stats._stats.getScore();
    return `${score.score} ${score.emoji}`;
  }
</script>

{#if stats}
  <div class="overview py-2 flex-grow flex-shrink">
    {#if stats.math == 'sum'}
      <ListItem className="solo" title="Total">
        <div slot="right" class="text-lg text-inverse">{formatValue(stats.sum)}</div>
      </ListItem>
    {/if}
    <ListItem className="solo" title="Average">
      <div slot="right" class="text-lg text-inverse">{formatValue(stats.avg)}</div>
    </ListItem>
    {#if stats.max.value > stats.min.value}
      <ListItem className="solo" title="Range">
        <div slot="right" class="text-lg text-inverse value">
          {formatValue(stats.min.value, false)}
          <span class="text-faded-2 font-weight-normal">to</span>
          {formatValue(stats.max.value)}
        </div>
      </ListItem>
    {/if}
    <ListItem className="solo" title="Score">
      <div slot="right" class="text-lg text-inverse">{getScore()}</div>
    </ListItem>

    <!-- {#if state.related.length}
    <HScroller className="related-items p-2 px-3">
      {#each state.related as item}
        {#if item.search != state.currentTerm}
          <button
            class="btn btn-badge"
            on:click={() => {
              Interact.openStats(item.search);
            }}>
            {#if item.type == 'person'}
              <Dymoji person={$PeopleStore.people[item.value]} className="mr-2" size={20} radius={0.3} />
            {/if}
            {#if item.type == 'tracker'}{TrackerStore.byTag(item.value).emoji}{/if}
            {item.search}
            <span class="count">{item.count}</span>
          </button>
        {/if}
      {/each}
    </HScroller>
  {/if} -->

  </div>
{/if}
