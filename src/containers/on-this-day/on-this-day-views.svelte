<script lang="ts">
  import Button from "../../components/button/button.svelte";

  import Card from "../../components/card/card.svelte";
  import ListItemLog from "../../components/list-item-log/list-item-log.svelte";
  import ShortcutUserButton from "../../components/shortcut-button/shortcut-user-button.svelte";
  import TrackerSmallBlock from "../../components/tracker-small-block/tracker-small-block.svelte";
  import type NLog from "../../modules/nomie-log/nomie-log";
  import TrackableElement from "../../modules/trackable-element/trackable-element";
  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";
  import { PeopleStore } from "../../store/people-store";
  import { TrackerStore } from "../../store/tracker-store";
  import Empty from "../empty/empty.svelte";
  import Map from "../map/map.svelte";
  import { getContext, getNotes, getPeople, processTrackers } from "./on-this-day-helpers";
  import type { OTDViewOption, TrackerProcessedConfig } from "./on-this-day-helpers";
  import type Person from "../../modules/person/person";
  import { getTrackersAndValuesFromLogs } from "../../store/ledger/ledger-tools";
  import ShortcutButton from "../../components/shortcut-button/shortcut-button.svelte";
  import Grid from "../../components/grid/grid.svelte";
  import { Device } from "../../store/device-store";

  export let view: OTDViewOption = "notes";
  export let logs: Array<NLog> = [];

  let trackers: Array<TrackerProcessedConfig> = [];
  let notes: Array<NLog> = [];
  let people: Array<Person> = [];
  let context: Array<string> = [];

  let lastLogs: string;

  let columns: number = 3;

  $: if ($Device.width < 400) {
    columns = 2;
  } else if ($Device.width < 700) {
    columns = 3;
  } else if ($Device.width > 900) {
    columns = 3;
  }

  $: if (logs && logs.length && lastLogs !== logs.map((l) => l._id).join(",")) {
    lastLogs = logs.map((l) => l._id).join(",");
    let trackersUsed = getTrackersAndValuesFromLogs(logs);
    notes = getNotes(logs);
    people = getPeople(logs, $PeopleStore.people);
    context = getContext(logs);
    trackers = processTrackers(trackersUsed, $TrackerStore.trackers);
  }
</script>

{#if view === 'trackers'}
  <div class="p-3">
    <Grid gap={0} {columns}>
      {#each trackers as tracker (tracker.tag)}
        <TrackerSmallBlock
          solo
          className="m-1"
          element={{ id: tracker.tag, value: tracker.value, type: 'tracker', obj: tracker.tracker }}
          on:click={() => {
            Interact.elementOptions(new TrackableElement({ id: tracker.tag, value: tracker.value, type: 'tracker', obj: tracker.tracker }));
          }} />
      {/each}
    </Grid>
  </div>
{:else if view === 'all'}
  {#if !logs.length}
    <slot name="empty" />
  {:else}
    <div class="p-1">
      {#each logs as note}
        <!-- Loop over the logs for this day -->
        <ListItemLog
          log={note}
          on:textClick={(evt) => {
            if (evt.detail.type == 'tracker' && !evt.detail.obj) {
              evt.detail.obj = TrackerStore.getByTag(evt.detail.id);
            }
            Interact.elementOptions(evt.detail);
          }} />
      {/each}
    </div>
  {/if}
{:else if view === 'notes'}
  {#if !notes.length}
    <Empty title={Lang.t('on-this-day.no-notes', 'No Notes on this Day')} emoji="✍🏽" />
  {:else}
    <div class="p-1">
      {#each notes as note}
        <ListItemLog log={note} />
      {/each}
    </div>
  {/if}
{:else if view === 'people'}
  {#if !people.length}
    <Empty title={Lang.t('on-this-day.no-people', 'No People on this Day')} emoji="👨‍👩‍👧" />
  {:else}
    <div class="n-grid mt-3">
      {#each people as person}
        <ShortcutUserButton
          {person}
          on:click={() => {
            Interact.elementOptions(new TrackableElement({ id: person.username, raw: `@${person.username}`, type: 'person' }));
          }}
          on:more={() => {
            Interact.elementOptions(new TrackableElement({ id: person.username, raw: `@${person.username}`, type: 'person' }));
          }} />
      {/each}
    </div>
  {/if}
{:else if view === 'context'}
  {#if !context.length}
    <Empty title={Lang.t('on-this-day.no-context', 'No Context on this Day')} emoji="🤷‍♂️" />
  {:else}
    <div class="n-grid mt-3">
      {#each context as context}
        <Button
          shape="round"
          size="lg"
          color="light"
          className="m-2"
          on:click={() => {
            Interact.elementOptions(new TrackableElement({ id: context, raw: context, type: 'context' }));
          }}>
          {context}
        </Button>
      {/each}
    </div>
  {/if}
{:else if view === 'locations'}
  <Map records={logs} style="height:100%;" />
{/if}
