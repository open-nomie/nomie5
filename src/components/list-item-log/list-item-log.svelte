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

  import { TrackerStore } from "../../store/trackers";
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
  export let hideMore = false;
  // consts
  const dispatch = createEventDispatcher();

  let displayLog;

  let trackers = $TrackerStore;

  let state = {
    showPhoto: false
  };

  $: if (log) {
    displayLog = new NomieLog(log);
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
          {dayjs(displayLog.end).format(`ddd ${timeFormat}`)}
        </div>
        <div class="date-ago truncate">
          {dayjs(displayLog.end).format('MMM Do YYYY')}
          <span class="ago">{time.fromNow(displayLog.end)} ago</span>
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
      <!-- <div class="time-ago text-faded-2 ml-3">
        {time.fromNow(displayLog.end)}
      </div> -->
      <!-- Janky - fix this -->
      {#if hideMore != true}
        <button
          on:click={event => {
            dispatch('moreClick', displayLog);
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
        on:textClick={evt => {
          dispatch('textClick', evt.detail);
        }}
        note={displayLog.note}
        {trackers}
        className={displayLog.trackersArray().length ? '' : 'pb-2'} />
    {/if}
    <div class="trackers-list">
      <!-- Loop over the trackers within this log -->
      {#each displayLog.trackersArray().filter(trk => {
        if (focus) {
          return trk.tag == focus;
        } else {
          return true;
        }
      }) as tracker (`${tracker.tag}-${displayLog._id}`)}
        <!-- Tracker List Item  -->
        <NItem
          className="clickable bottom-line"
          on:click={event => {
            event.preventDefault();
            event.stopPropagation();
            dispatch('trackerClick', { tracker, log });
            return false;
          }}>
          <div class="emoji" slot="left">
            {(trackers[tracker.tag] || {}).emoji || '⚪️'}
          </div>
          <div>{(trackers[tracker.tag] || {}).label || tracker.tag}</div>
          <div class="value" slot="right">
            {NomieUOM.format(tracker.value, (trackers[tracker.tag] || {}).uom)}
          </div>
        </NItem>
      {/each}
    </div>

  </NItem>
{/if}
