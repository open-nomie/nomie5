<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  // Modules
  import NomieLog from "../../modules/nomie-log/nomie-log";
  import Tracker from "../../modules/tracker/tracker";

  // components
  import NItem from "../list-item/list-item.svelte";
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
  export let showMore = true;
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
    margin-left: 10px;
    margin-right: -10px;
    margin-top: -10px;
    font-size: 32px;
    height: 30px;
    min-width: 40px;
    line-height: 30px;
  }
  .time {
    font-size: 0.9rem;
  }
</style>

<!--glow glow-{time.dateToDesc(displayLog.end)}-->
{#if displayLog}
  <NItem className="{className} my-3 mx-2 border pb-0 n-item-log">
    <!-- Show the Trackers within this Log Item -->
    <div class="n-row time-row">
      <div class="time truncate">

        <div class="text-sm text-inverse-1 font-bold ">
          {dayjs(displayLog.end).format(`ddd ${timeFormat}`)}
        </div>
        <div class="text-xs text-inverse-2">
          {dayjs(displayLog.end).format('MMM Do YYYY')}
          <span class="text-faded-2">{time.fromNow(displayLog.end)} ago</span>
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
          class="btn btn-sm btn-clear pl-2 pr-2 ">
          <i class="zmdi zmdi-globe text-primary-bright" />
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
      {#if showMore === true}
        <button
          on:click={event => {
            dispatch('moreClick', displayLog);
          }}
          class="btn btn-sm btn-clear pl-2 pr-2 more-button"
          style="">
          <i
            class="zmdi zmdi-more text-primary-bright"
            style="height:30px; line-height:30px;" />
        </button>
      {/if}
    </div>
    <!-- Process the Note Content with the Textualizer 
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
          borderBottom
          className="pl-0 clickable"
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
