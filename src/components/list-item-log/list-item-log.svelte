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

  // vendors
  import dayjs from "dayjs";

  // props
  export let log = undefined;
  export let trackers = {};
  export let className = "";
  export let focus = false;
  export let fullDate = false;
  export let show24Hour = false;
  // consts
  const dispatch = createEventDispatcher();

  let displayLog;

  let state = {
    showPhoto: false
  };

  $: if (log) {
    displayLog = new NomieLog(log);
  }

  $: timeFormat = show24Hour ? "HH:mm" : "h:mm a";
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
</style>

{#if displayLog}
  <NItem
    className="{className} my-3 mx-2 border pb-0 n-item-log glow glow-{time.dateToDesc(displayLog.end)}">
    <!-- Show the Trackers within this Log Item -->
    <div class="n-row my-2 pr-3 time-row">
      <NText size="md" bold>
        {dayjs(displayLog.end).format(fullDate ? `ddd MMM D YYYY ${timeFormat}` : timeFormat)}
      </NText>

      <!-- If they have location-->
      {#if displayLog.lat}
        <button
          on:click={event => {
            dispatch('locationClick', {
              location: displayLog.location,
              lat: displayLog.lat,
              lng: displayLog.lng
            });
            event.stopPropagation();
          }}
          class="btn btn-sm btn-clear pl-2 pr-2 ">
          <i class="zmdi zmdi-globe text-primary-bright" />
        </button>
      {/if}

      <div class="filler" />
      {#if displayLog.score}
        <NPoints points={displayLog.score} />
      {/if}
      <!-- Janky - fix this -->
      <button
        on:click={event => {
          dispatch('moreClick', displayLog);
        }}
        class="btn btn-sm btn-clear pl-2 pr-2 "
        style="margin-left:10px; margin-right:-20px; margin-top:-10px;
        font-size:32px; height:30px; line-height:30px;">
        <i
          class="zmdi zmdi-more text-primary-bright"
          style="height:30px; line-height:30px;" />
      </button>
    </div>
    {#if displayLog.photo}
      <div class="log-photo-wrapper">
        <NCameraImage path={displayLog.photo} display="div" height={300} />
      </div>
    {/if}
    <!-- Process the Note Content with the Textualizer 
    This really isn't special right now -->
    {#if displayLog.note.length}
      <NNoteTextualizer
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
          className="pl-0 large clickable"
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
