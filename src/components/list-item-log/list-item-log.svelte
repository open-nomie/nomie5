<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  // components
  import NItem from "../list-item/list-item.svelte";
  import NText from "../text/text.svelte";
  import NNoteTextualizer from "../note-textualizer/note-textualizer.svelte";

  // utils
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";

  // vendors
  import dayjs from "dayjs";

  // props
  export let log = undefined;
  export let trackers = {};
  export let className = "";
  export let focus = false;

  // consts
  const dispatch = createEventDispatcher();
</script>

{#if log}
  <NItem className="{className} my-3 mx-2 border pb-0 n-item-log">
    <!-- Show the Trackers within this Log Item -->
    <div class="n-row my-2 pr-3 time-row">
      <NText size="md" bold>
        {dayjs(log.end).format('h:mm a ddd MMM D YYYY')}
      </NText>

      <!-- If they have location-->
      {#if log.lat}
        <button
          on:click={event => {
            dispatch('locationClick', {
              location: log.location,
              lat: log.lat,
              lng: log.lng
            });
            event.stopPropagation();
          }}
          class="btn btn-sm btn-clear pl-2 pr-2 ">
          <i class="zmdi zmdi-globe text-primary-bright" />
        </button>
      {/if}
      <div class="filler" />
      <!-- Janky - fix this -->
      <button
        on:click={event => {
          dispatch('moreClick', log);
        }}
        class="btn btn-sm btn-clear pl-2 pr-2 "
        style="margin-right:-20px; margin-top:-6px; font-size:32px; height:30px;
        line-height:30px;">
        <i
          class="zmdi zmdi-more text-primary-bright"
          style="height:30px; line-height:30px;" />
      </button>
    </div>
    <!-- Process the Note Content with the Textualizer 
    This really isn't special right now -->
    <NNoteTextualizer
      note={log.note}
      {trackers}
      className={log.trackersArray().length ? '' : 'pb-2'} />

    <div class="trackers-list">
      <!-- Loop over the trackers within this log -->
      {#each log.trackersArray().filter(trk => {
        if (focus) {
          return trk.tag == focus;
        } else {
          return true;
        }
      }) as tracker (`${tracker.tag}-${log._id}`)}
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
