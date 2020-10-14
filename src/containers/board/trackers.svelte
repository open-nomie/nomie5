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
  import { UserStore } from "../../store/user-store";
  import TrackerButton from "../../components/classic-button/classic-button.svelte";
  import ScoreTracker from "../../modules/scoring/score-tracker";
  import { Lang } from "../../store/lang";
  import Button from "../../components/button/button.svelte";

  const dispatch = createEventDispatcher();

  export let trackers: Array<ITracker>;
  export let hideMore: boolean = false;
  export let hideAdd: boolean = false;
  export let view: "list" | "detail" | "button" | string = localStorage.getItem("board-view") || "button";

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

  function getHoursUsed(tracker) {
    if ($LedgerStore.today.hasOwnProperty(tracker.tag)) {
      return $LedgerStore.today[tracker.tag].hours;
    } else {
      return [];
    }
  }

  function getPositivity(tracker) {
    let value = getTodaysValue(tracker, false);
    value = value || 0;
    return ScoreTracker(value, tracker);
  }

  function getTodaysValue(tracker, format: boolean = true): string | number {
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
    if (format) {
      return value ? NomieUOM.format(value, tracker.uom) : null;
    } else {
      return value;
    }
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
      className="tracker-{tracker.tag} py-2 tracker-list-item flex-shrink-off {getTodaysValue(tracker) ? 'has-value' : 'no-value'}"
      compact={$UserStore.localSettings.compactButtons}
      on:click={(evt) => {
        if (['svg'].indexOf(evt.detail.target.tagName) == -1) {
          dispatch('tap', tracker);
        }
      }}>
      <div class="highlight" style="background-color:{tracker.color}" />
      <div slot="left" class="n-row justify-content-center truncate pr-0">
        <Text
          center
          style="color:{tracker.color}; width:40px; white-space:pre; max-width:40px; min-width:40px; overflow:visible"
          size={$UserStore.localSettings.compactButtons ? 'xl' : 'xxl'}>
          {tracker.emoji}
        </Text>
      </div>
      <div>
        <Text size="md" leading2>{tracker.label}</Text>
        {#if getLastUsed(tracker)}
          <Text size={$UserStore.localSettings.compactButtons ? 'xs' : 'sm'} faded leading2>{getLastUsed(tracker) || undefined}</Text>
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
          <Button
            shape="circle"
            color="light"
            style="z-index:1000"
            on:click={(evt) => {
              dispatch('more', tracker);
            }}>
            <Icon name="more" size="18" className="prevent fill-inverse-1" />
          </Button>
        {/if}
      </span>
    </ListItem>
  {/each}
  {#if !hideAdd}
    <ListItem
      compact={$UserStore.localSettings.compactButtons}
      clickable
      title={Lang.t('tracker.add-tracker')}
      on:click={() => dispatch('add')}
      className="tracker-add py-3 tracker-list-item flex-shrink-off no-value">
      <div slot="left">
        <Text style="width:40px;" center size={$UserStore.localSettings.compactButtons ? 'xl' : 'xxl'}>➕</Text>
      </div>
    </ListItem>
  {/if}
{:else if view == 'detail'}
  <div class="trackers n-grid">
    {#each trackers as tracker}
      <ShortcutButton
        compact={$UserStore.localSettings.compactButtons}
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
    {#if !hideAdd}
      <ShortcutButton
        compact={$UserStore.localSettings.compactButtons}
        title={Lang.t('tracker.add-tracker')}
        emoji="➕"
        className="tracker-add"
        hideMore={true}
        on:click={() => {
          dispatch('add');
        }} />
    {/if}
  </div>
{:else if view == 'button'}
  <div class="trackers n-grid">
    {#each trackers as tracker}
      <TrackerButton
        {tracker}
        value={getTodaysValue(tracker)}
        hoursUsed={getHoursUsed(tracker)}
        positivity={getPositivity(tracker)}
        on:click={() => {
          dispatch('tap', tracker);
        }}
        on:longpress={() => {
          dispatch('more', tracker);
        }} />
    {/each}
    {#if !hideAdd}
      <TrackerButton
        tracker={{ tag: 'add', label: Lang.t('tracker.add-tracker'), emoji: '➕' }}
        on:click={(evt) => {
          dispatch('add', evt);
        }} />
    {/if}
  </div>
{/if}

<!--    className={`${state.addedTrackers.indexOf(tracker.tag) > -1 ? 'added pulse' : ''} ${state.savingTrackers.indexOf(tracker.tag) > -1 ? 'wiggle saving' : ''}`} -->
