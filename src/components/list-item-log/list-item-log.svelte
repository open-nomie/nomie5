<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  // Modules
  import NomieLog from "../../modules/nomie-log/nomie-log";
  import Tracker from "../../modules/tracker/tracker";

  // components
  import NItem from "../list-item/list-item.svelte";
  import NIcon from "../icon/icon.svelte";
  import NPoints from "../points/points.svelte";
  import NText from "../text/text.svelte";
  import NNoteTextualizer from "../note-textualizer/note-textualizer.svelte";
  import NCameraImage from "../camera/image.svelte";

  // utils
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import time from "../../utils/time/time";

  import { TrackerStore } from "../../store/tracker-store";
  import { UserStore } from "../../store/user";
  import { Interact } from "../../store/interact";

  // vendors
  import dayjs from "dayjs";

  // props
  export let log = undefined;
  // export let trackers = {};
  export let className = "";
  export let focus = false;
  export let fullDate = false;
  // export let hideMore = false;
  // consts
  const dispatch = createEventDispatcher();

  let displayLog;
  let logMeta;

  let trackers = $TrackerStore.trackers;

  let state = {
    showPhoto: false
  };

  $: if (log) {
    displayLog = new NomieLog(log);
    logMeta = displayLog.getMeta();
    logMeta.trackers = logMeta.trackers.map(trackerElement => {
      trackerElement.obj = TrackerStore.getByTag(trackerElement.id);
      return trackerElement;
    });
  }

  $: fullDate =
    log && new Date(log.end).toDateString() !== new Date().toDateString()
      ? true
      : false;

  $: timeFormat = $UserStore.meta.is24Hour ? "HH:mm" : "h:mm a";
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
        <div class="day-time truncate">
          {logMeta.endDate.format(`ddd ${timeFormat}`)}
        </div>
        <div class="date-ago truncate">
          {logMeta.endDate.format('MMM Do YYYY')}
          <span class="ago">{time.fromNow(logMeta.endDate)} ago</span>
        </div>
      </div>

      <div class="filler" />
      <!-- If they have location-->
      {#if displayLog.lat}
        <button
          on:click={event => {
            Interact.showLocations([displayLog]);
            event.stopPropagation();
          }}
          class="btn btn-sm btn-clear pl-2 pr-2 clickable">
          <NIcon name="pin" className="fill-primary-bright" size="16" />
        </button>
      {/if}

      <!-- SCORE display -->
      {#if displayLog.score}
        <NPoints points={displayLog.score} />
      {/if}

      <button
        on:click={event => {
          Interact.logOptions(displayLog);
        }}
        class="btn btn-clear btn-sm more-button clickable ml-1">
        <NIcon name="more" className="fill-primary-bright" size="32" />
      </button>

    </div>
    <!-- Process the Note Content wi th the Textualizer 
    This really isn't special right now -->
    {#if displayLog.note.length}
      <NNoteTextualizer
        on:textClick={evt => {
          dispatch('textClick', evt.detail);
        }}
        note={displayLog.note}
        {trackers}
        className={logMeta.trackers.length ? '' : 'pb-2'} />
    {/if}
    <div class="trackers-list">
      <!-- Loop over the trackers within this log -->
      {#each logMeta.trackers.filter(trk => {
        if (focus) {
          return trk.id == focus;
        } else {
          return true;
        }
      }) as trackerElement}
        <!-- Tracker List Item  -->
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
    </div>

  </NItem>
{/if}
