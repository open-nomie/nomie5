<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

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
  import NCameraImage from "../camera/image.svelte";

  import NTrackerSmallBlock from "../tracker-ball/tracker-small-block.svelte";

  // utils
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import time from "../../utils/time/time";

  import { TrackerStore } from "../../store/tracker-store";
  import { UserStore } from "../../store/user";
  import { Interact } from "../../store/interact";
  import { PeopleStore } from "../../store/people-store";

  // vendors
  import dayjs from "dayjs";

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

  $: timeFormat = $UserStore.meta.is24Hour ? "HH:mm" : "h:mm a";

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
  .log-photo-wrapper {
    margin-left: -20px;
    margin-right: -20px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-faded-1);
    margin-bottom: 20px;
  }

  .n-row.context {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .score-mark {
    position: absolute;
    bottom: 16px;
    right: 16px;
    width: 4px;
    border-radius: 2px;
    height: 4px;
    &.positive {
      background-color: var(--color-green);
    }
    &.negative {
      background-color: var(--color-red);
    }
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
      <div class="time truncate" style="max-width:60%;">
        <div class="day-time truncate">{logMeta.endDate.format(`ddd ${timeFormat}`)}</div>
        <div class="date-ago truncate">
          {logMeta.endDate.format('MMM Do YYYY')}
          <span class="ago">{time.fromNow(logMeta.endDate)} ago</span>
        </div>
      </div>

      <div class="filler" />
      <!-- If they have location-->
      {#if displayLog.lat}
        <button
          on:click={(event) => {
            Interact.showLocations([displayLog]);
            event.stopPropagation();
          }}
          class="btn btn-xs btn-badge btn-primary text-white location-badge truncate">
          <LocationBadge location={displayLog} />
        </button>
      {/if}

      <!-- SCORE display -->
      {#if displayLog.score}
        <div class="score-mark {displayLog.score > 0 ? 'positive' : 'negative'}" />
      {/if}

      {#if hideMore !== true}
        <button
          on:click={(event) => {
            Interact.logOptions(displayLog);
          }}
          class="btn btn-clear btn-sm more-button clickable ml-1">
          <NIcon name="more" className="fill-primary-bright" size="32" />
        </button>
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

    {#if logMeta.trackers.length || logMeta.people.length || logMeta.context.length}
      <div class="tracker-grid n-row">
        {#each displayLog.people as person}
          <NTrackerSmallBlock
            truncate={true}
            element={person}
            on:click={() => {
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
              dispatch('trackerClick', { tracker: trackerElement.obj, log });
            }} />
        {/each}
      </div>
      {#if logMeta.context.length}
        <div class="context n-row px-2 pb-2">
          {#each logMeta.context as context}
            <button
              class="btn btn-badge faded"
              on:click={() => {
                dispatch('contextClick', { context: context, log });
              }}>
              +{context.id}
            </button>
          {/each}
        </div>
      {/if}
    {/if}
    <!-- <div class="trackers-list">

     
      {#each logMeta.trackers.filter(trk => {
        if (focus) {
          return trk.id == focus;
        } else {
          return true;
        }
      }) as trackerElement}
        <NItem
          className="clickable bottom-line"
          on:click={event => {
            event.preventDefault();
            event.stopPropagation();
            dispatch('trackerClick', { tracker: trackerElement.obj, log });
            return false;
          }}>
          <div class="emoji" slot="left">
            {(trackerElement.obj || {}).emoji || '⚪️'}
          </div>
          <div>{(trackerElement.obj || {}).label || trackerElement.id}</div>
          <div class="value" slot="right">
            {NomieUOM.format(trackerElement.value, (trackerElement.obj || {}).uom)}
          </div>
        </NItem>
      {/each}
    </div> -->

  </NItem>
{/if}
