<script>
  // Svelte
  import { createEventDispatcher, onMount } from "svelte";

  // Modules
  import NomieLog from "../../modules/nomie-log/nomie-log";
  import Tracker from "../../modules/tracker/tracker";

  // components
  import NItem from "../list-item/list-item.svelte";
  import NBall from "../tracker-ball/ball.svelte";
  import Dymoji from "../dymoji/dymoji.svelte";
  import LocationBadge from "../location-badge/location-badge.svelte";
  import NIcon from "../icon/icon.svelte";
  import NPoints from "../points/points.svelte";
  import NText from "../text/text.svelte";
  import NNoteTextualizer from "../note-textualizer/note-textualizer.svelte";

  import NTrackerSmallBlock from "../tracker-ball/tracker-small-block.svelte";

  // utils
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import time from "../../utils/time/time";

  import { TrackerStore } from "../../store/tracker-store";
  import { UserStore } from "../../store/user-store";
  import { Interact } from "../../store/interact";
  import { PeopleStore } from "../../store/people-store";

  // vendors
  import dayjs from "dayjs";
  import Text from "../text/text.svelte";
  import TrackableElement from "../../modules/trackable-element/trackable-element";
  import { getEmojiFromScore } from "../../utils/positivity/positivity";
  import Button from "../button/button.svelte";

  // props
  export let log = undefined;
  // export let trackers = {};
  export let className = "";
  export let focus = false;
  export let fullDate = false;
  export let hideMore = undefined;

  // consts
  const dispatch = createEventDispatcher();

  let displayLog;
  let logMeta;

  let trackers = $TrackerStore.trackers;

  let state = {
    showPhoto: false,
  };

  $: if (log) {
    displayLog = new NomieLog(log);
    logMeta = displayLog.getMeta();
    logMeta.trackers = logMeta.trackers.map((trackerElement) => {
      trackerElement.obj = TrackerStore.getByTag(trackerElement.id);
      return trackerElement;
    });
  }

  $: fullDate = log && new Date(log.end).toDateString() !== new Date().toDateString() ? true : false;

  let dtFormat;

  $: if ($UserStore.meta.is24Hour) {
    dtFormat = {
      date: "ddd Do MMM YYYY",
      time: "H:mm",
    };
  } else {
    dtFormat = {
      date: "ddd MMM Do YYYY",
      time: "h:mma",
    };
  }

  function shouldShowValue(trackerElement) {
    if (trackerElement.obj.type == "picker") {
      return false;
    } else if (trackerElement.obj.type == "tick") {
      return trackerElement.value !== 1;
    } else {
      return true;
    }
  }
</script>

<style lang="scss">
  .divider {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .n-row.context {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .more-button {
    margin-right: -8pt;
  }
</style>

<!--glow glow-{time.dateToDesc(displayLog.end)}-->
{#if displayLog}
  <NItem className="{className} n-item-log">
    <!-- Show the Trackers within this Log Item -->
    <div class="n-row time-row">
      <div class="time truncate">
        <div class="filler">
          {#if displayLog.lat}
            <button
              style="display:inline-flex; margin-left:-4px; padding-left:4px;"
              on:click={(event) => {
                Interact.showLocations([displayLog]);
                event.stopPropagation();
              }}
              class="btn btn-sm btn-clear text-normal location-badge truncate">
              <LocationBadge location={displayLog} />
            </button>
          {/if}
          <Text inline size="sm" className="" faded>{time.fromNow(logMeta.endDate)}</Text>
        </div>
        <Text size="sm" medium>
          {logMeta.endDate.format(`${dtFormat.time}`)}
          <Text inline size="sm" faded>{logMeta.endDate.format(`${dtFormat.date}`)}</Text>
        </Text>
      </div>
      <div class="filler" />
      <!-- If they have location-->

      <!-- SCORE display -->
      {#if displayLog.score}
        <div class="score-mark {displayLog.score > 0 ? 'positive' : 'negative'}">{getEmojiFromScore(displayLog.score, true)}</div>
      {/if}

      {#if hideMore !== true}
        <Button
          shape="circle"
          color="transparent"
          on:click={(event) => {
            Interact.logOptions(displayLog);
          }}
          className="ml-2"
          style="margin-right:-10px;">
          <NIcon name="more" className="fill-primary-bright" size="32" />
        </Button>
      {/if}

    </div>
    <!-- Process the Note Content wi th the Textualizer 
    This really isn't special right now -->
    {#if displayLog.note.length}
      <NNoteTextualizer
        on:textClick={(evt) => {
          dispatch('textClick', evt.detail);
        }}
        note={displayLog.note}
        {trackers}
        className={logMeta.trackers.length ? '' : 'pb-2'} />
    {/if}

    {#if logMeta.trackers.length || logMeta.people.length}
      <div class="tracker-grid n-row">
        {#each displayLog.people as person}
          <NTrackerSmallBlock
            truncate={true}
            element={person}
            on:click={() => {
              Interact.openStats(`@${person.id}`);
              dispatch('personClick', { person: person, log });
            }}>
            <span slot="emoji" class="emoji">
              {#if $PeopleStore.people[person.id]}
                <NBall size="40" radius="0.3" avatar={$PeopleStore.people[person.id].avatar} username={person.id} className="ml-2" />
              {:else}
                <NBall size="40" username={person.id} className="ml-2" radius="0.3" />
              {/if}
            </span>
          </NTrackerSmallBlock>
        {/each}
        {#each logMeta.trackers.filter((trk) => {
          if (focus) {
            return trk.id == focus;
          } else {
            return true;
          }
        }) as trackerElement}
          <NTrackerSmallBlock
            truncate
            element={trackerElement}
            on:click={() => {
              Interact.openStats(`#${trackerElement.id}`);
              dispatch('trackerClick', { tracker: trackerElement.obj, log });
            }} />
        {/each}
      </div>
    {/if}
    {#if logMeta.context.length}
      <div class="context n-row">
        {#each logMeta.context as context}
          <button
            class="btn btn-badge btn-xs faded"
            on:click={() => {
              Interact.openStats(context.raw);
              dispatch('contextClick', { context: context, log });
            }}>
            +{context.id}
          </button>
        {/each}
      </div>
    {/if}

  </NItem>
{/if}
