<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "../../components/icon/icon.svelte";
  import _ from "lodash";
  import ListItem from "../../components/list-item/list-item.svelte";
  import Text from "../../components/text/text.svelte";
  import type TrackerConfig from "../../modules/tracker/tracker";
  import type { ITracker } from "../../modules/tracker/tracker";
  import { LastUsed } from "../../store/last-used";
  import { LedgerStore } from "../../store/ledger";
  import type { IToday } from "../../store/ledger";
  import ShortcutButton from "../../components/shortcut-button/shortcut-button.svelte";
  import Counter from "../../components/counter/counter.svelte";
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import math from "../../utils/math/math";
  import time from "../../utils/time/time";

  const dispatch = createEventDispatcher();

  export let trackers: Array<ITracker>;
  export let hideMore: boolean = false;

  export let view: "list" | "detail" | "button" | string = localStorage.getItem("board-view") || "detail";

  function getLastUsed(tracker) {
    if ($LastUsed[tracker.tag]) {
      return time.fromNow($LastUsed[tracker.tag].date);
    } else {
      return undefined;
    }
  }

  function getTotalTaps(tracker): number {
    let values = $LedgerStore.today[tracker.tag] ? $LedgerStore.today[tracker.tag].values : [];
    return values.length;
  }

  function getTodaysValue(tracker): string | number {
    let value = null;
    // Does this tracker exist in today's map?
    if ($LedgerStore.today.hasOwnProperty(tracker.tag)) {
      // What type of Math should we do?
      if (tracker.math === "sum") {
        // Sum it up!
        value = math.round(math.sum($LedgerStore.today[tracker.tag].values));
      } else {
        // Round things!
        value = math.round(math.average($LedgerStore.today[tracker.tag].values));
      }
    }
    return value ? NomieUOM.format(value, tracker.uom) : null;
  }
</script>

<style lang="scss">
  :global(.tracker-list-item .highlight) {
    position: absolute;
    left: 3px;
    top: 6px;
    bottom: 6px;
    width: 3px;
    border-radius: 2px;
  }
  :global(.tracker-list-item.no-value) {
    background-color: transparent;
    .highlight {
      display: none;
    }
  }
</style>

{#if view == 'list'}
  {#each trackers as tracker}
    <ListItem
      clickable
      className="tracker-{tracker.tag} tracker-list-item flex-shrink-off {getTodaysValue(tracker) ? 'has-value' : 'no-value'}"
      compact
      on:click={() => {
        dispatch('tap', tracker);
      }}>

      <div class="highlight" style="background-color:{tracker.color}" />

      <span slot="left">
        <Text size="xxl">{tracker.emoji}</Text>
      </span>
      <div>
        <Text size="md">{tracker.label}</Text>
        {#if getLastUsed(tracker)}
          <Text size="sm" faded>{getLastUsed(tracker) || undefined}</Text>
        {/if}
      </div>
      <span slot="right" class="mr-2">
        <Text>{getTodaysValue(tracker) || ''}</Text>
        {#if tracker.started}
          <Counter started={tracker.started} color={tracker.color} />
        {/if}
      </span>
      <span slot="right">
        {#if !hideMore}
          <button
            class="btn btn-icon btn-light"
            on:click|preventDefault|stopPropagation={() => {
              dispatch('more', tracker);
            }}>
            <Icon name="more" />
          </button>
        {/if}
      </span>
    </ListItem>
  {/each}
{:else if view == 'detail'}
  <div class="trackers n-grid">
    {#each trackers as tracker}
      <ShortcutButton
        title={tracker.label}
        subtitle={!tracker.started ? getLastUsed(tracker) : null}
        emoji={tracker.emoji}
        value={getTodaysValue(tracker)}
        taps={getTotalTaps(tracker)}
        color={tracker.color}
        className="tracker-{tracker.tag}"
        {hideMore}
        on:click={() => {
          dispatch('tap', tracker);
        }}
        on:more={() => {
          dispatch('more', tracker);
        }}>
        <div slot="subtitle">
          {#if tracker.started}
            <Counter started={tracker.started} color={tracker.color} />
          {/if}
        </div>
      </ShortcutButton>
    {/each}
  </div>
{/if}
