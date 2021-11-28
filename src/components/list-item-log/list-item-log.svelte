<script lang="ts">
  // Svelte
  import { createEventDispatcher } from 'svelte'

  // Modules
  import NLog from '../../modules/nomie-log/nomie-log'

  // components
  import NItem from '../list-item/list-item.svelte'
  import LocationBadge from '../location-badge/location-badge.svelte'
  import NIcon from '../icon/icon.svelte'
  import NNoteTextualizer from '../note-textualizer/note-textualizer.svelte'

  import NTrackerSmallBlock from '../tracker-small-block/tracker-small-block.svelte'

  // utils
  import time from '../../utils/time/time'

  import { TrackerStore } from '../../store/tracker-store'
  import { UserStore } from '../../store/user-store'
  import { Interact } from '../../store/interact'

  // vendors
  import dayjs from 'dayjs'
  import Text from '../text/text.svelte'
  import { getEmojiFromScore } from '../../utils/positivity/positivity'
  import Button from '../button/button.svelte'

  // props
  export let log = undefined
  // export let trackers = {};
  export let className = ''
  export let focus = false
  export let fullDate = false
  export let hideMore = undefined
  export let moreOveride = false
  export let hideDelete = false

  // consts
  const dispatch = createEventDispatcher()

  let displayLog: NLog
  let logMeta = undefined

  let trackers = $TrackerStore.trackers

  let state = {
    showPhoto: false,
  }

  $: if (log && log !== displayLog) {
    displayLog = new NLog(log)
    logMeta = displayLog.getMeta()
    logMeta.trackers = logMeta.trackers.map((trackerElement) => {
      trackerElement.obj = TrackerStore.getByTag(trackerElement.id)
      return trackerElement
    })
  }

  let dtFormat

  $: if ($UserStore.meta.is24Hour) {
    dtFormat = {
      date: 'ddd Do MMM YYYY',
      time: 'H:mm',
    }
  } else {
    dtFormat = {
      date: 'ddd MMM Do YYYY',
      time: 'h:mma',
    }
  }
</script>

<style global>
  .n-item-log .divider {
    font-size: 0.9em;
    font-weight: 500;
  }
  .n-item-log .n-row.context {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .n-item-log .more-button {
    margin-right: -8pt;
  }
</style>

<!--glow glow-{time.dateToDesc(displayLog.end)}-->
{#if displayLog}
  <article
    class="{className} shadow-md rounded-xl py-2 bg-white dark:bg-black
    text-gray-900 dark:text-gray-100 grid grid-flow-row gap-2">
    <!-- Show the Trackers within this Log Item -->
    <header class="flex flex-shrink-0 w-full px-4 time-row">
      <div class="flex items-center flex-grow flex-shrink space-x-2">
        {#if displayLog.lat}
          <LocationBadge
            location={displayLog}
            on:click={(event) => {
              Interact.showLocations([displayLog])
              event.stopPropagation()
            }} />
        {/if}
        <section
          aria-label="When it happened"
          class="text-xs text-gray-500 line-clamp-1">
          <span class="mr-1 text-gray-700 dark:text-gray-300">
            {time.fromNow(logMeta.endDate)}
          </span>
          <span class="">
            {logMeta.endDate.format(`${dtFormat.time}`)}
            {#if fullDate}{logMeta.endDate.format(`${dtFormat.date}`)}{/if}
          </span>
        </section>
      </div>
      <!-- If they have location-->

      <!-- SCORE display -->
      {#if displayLog.score}
        <div
          class="score-mark flex text-2xl items-center pl-1 {displayLog.score > 0 ? 'positive' : 'negative'}">
          {getEmojiFromScore(displayLog.score, true)}
        </div>
      {/if}

      <slot name="more" />

      {#if hideMore !== true}
        <Button
          shape="round"
          color="transparent"
          on:click={(event) => {
            if (moreOveride) {
              dispatch('more', displayLog)
            } else {
              Interact.logOptions(displayLog, { hideDelete })
            }
          }}
          className="ml-2"
          style="margin-right:-10px;">
          <NIcon name="more" className="fill-primary-bright" size={24} />
        </Button>
      {/if}

    </header>
    <!-- Process the Note Content wi th the Textualizer 
    This really isn't special right now -->
    {#if displayLog.hasNote}
      <div class="px-2">
        <NNoteTextualizer
          on:textClick={(evt) => {
            dispatch('textClick', evt.detail)
          }}
          bind:note={displayLog.note}
          {trackers}
          className="px-3 pb-3 rounded-lg {logMeta.trackers.length ? '' : ''}" />
      </div>
    {/if}

    <slot />

    <!-- Loop over Trackers used -->
    {#if logMeta.trackers.length || logMeta.people.length}
      <div class="grid w-full grid-cols-2 gap-2 px-4 pb-4 lg:grid-cols-4">
        {#each displayLog.people as person}
          <NTrackerSmallBlock
            compact
            element={person}
            on:click={() => {
              Interact.elementOptions(person)
            }} />
        {/each}
        {#each logMeta.trackers.filter((trk) => {
          if (focus) {
            return trk.id == focus
          } else {
            return true
          }
        }) as trackerElement}
          <NTrackerSmallBlock
            className="bg-gray-100 dark:bg-gray-900"
            element={trackerElement}
            on:click={() => {
              Interact.elementOptions(trackerElement)
            }} />
        {/each}
      </div>
    {/if}
    {#if logMeta.context.length}
      <div class="flex px-4 pb-4 space-x-2 context">
        {#each logMeta.context as context}
          <Button
            size="xs"
            className="bg-gray-200 dark:bg-gray-900 shadow-md rounded-full"
            color="blue"
            on:click={() => {
              Interact.openStats(context.raw, displayLog.endDayjs())
              dispatch('contextClick', { context: context, log })
            }}>
            <span class="text-sm text-black dark:text-gray-100">
              +{context.id}
            </span>
          </Button>
        {/each}
      </div>
    {/if}

  </article>
{/if}
