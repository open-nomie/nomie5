<script lang="ts">
  import Container from './../components/container/container.svelte'

  /**
   * History Tab
   * A big collection of all things history
   *
   * TODO: Have it react when the ledger change, not a hard refresh
   */

  // svelte
  import { navigate } from 'svelte-routing'
  import { onMount, onDestroy } from 'svelte'

  // components
  import Icon from '../components/icon/icon.svelte'

  import Spinner from '../components/spinner/spinner.svelte'
  import LogItem from '../components/list-item-log/list-item-log.svelte'

  import OfflineQueue from '../components/offline-queue/offline-queue.svelte'

  import config from '../config/appConfig'

  // Containers
  import NMap from '../containers/map/map.svelte'
  import NLayout from '../containers/layout/layout.svelte'
  // Utils
  import dayjs from 'dayjs'
  import tick from '../utils/tick/tick'

  // Stores
  import { UserStore } from '../store/user-store'
  import { Interact } from '../store/interact'
  import { LedgerStore } from '../store/ledger'
  import { Lang } from '../store/lang'

  import { Device } from '../store/device-store'
  import Storage from '../modules/storage/storage'
  import Text from '../components/text/text.svelte'
  import Button from '../components/button/button.svelte'
  import NextPrevCal from '../components/next-prev-cal/next-prev-cal.svelte'
  import { SearchStore } from '../store/search-store'
  import NLog from '../modules/nomie-log/nomie-log'
  import Location from '../modules/locate/Location'
  import Empty from '../containers/empty/empty.svelte'
  import { ActiveLogStore } from '../store/active-log'
  import ButtonGroup from '../components/button-group/button-group.svelte'
  import Toolbar from '../components/toolbar/toolbar.svelte'
  import type { OTDViewOption } from '../containers/on-this-day/on-this-day-helpers'
  import { OTDViews } from '../containers/on-this-day/on-this-day-helpers'
  import OnThisDayViews from '../containers/on-this-day/on-this-day-views.svelte'
  import Swipeable from '../components/swipeable/swipeable.svelte'
  import { ChevronRight, X } from 'svelte-hero-icons'

  export const location = undefined
  export let style = undefined

  let appTitle = null
  let showSearch = false

  const state = {
    date: dayjs(new Date()),
    time_format: config.book_time_format,
    logs: [],
    ledger: null,
    locations: [],
    showAllLocations: false,
  } // Assign State to compiled history page

  let refreshing = false
  let logs = [] // holder of the logs
  let loading = true
  let locations = []

  /// Watchers for when we're in edit mode
  // and when we have selected more than one.

  let isToday = true
  let view: OTDViewOption = 'all'

  // If the date changes - check to see if it's still today
  let activeDate
  $: if (state.date && state.date !== activeDate) {
    activeDate = state.date
    isToday = new Date().toDateString() == state.date.toDate().toDateString()
  }

  $: appTitle = `History ${state.date.format('YYYY-MM-DD')}`

  function composeHere() {
    let logConfig = { end: undefined }
    if (!isToday) {
      logConfig.end = state.date.hour(dayjs().hour()).toDate().getTime()
    }
    let log = new NLog(logConfig)
    ActiveLogStore.journal(log)
  }

  // Methods
  const methods = {
    async textClick(event) {
      let trackableElement = event.detail
      Interact.elementOptions(trackableElement)
    },
    async getLogs(fresh?: boolean) {
      fresh = fresh === false ? false : true
      loading = true
      // Query the Ledger for Posts on this day.
      let canLookup = true
      if (Storage.getEngine().name == 'Blockstack' && $Device.offline == true) {
        canLookup = false
      }
      if (canLookup) {
        logs = await LedgerStore.query({
          start: state.date.startOf('day'),
          end: state.date.endOf('day'),
          fresh: fresh,
        })
      }
      logs = logs || []
      locations = logs
        .filter((log: NLog) => {
          return log.lat
        })
        .map((log: NLog) => {
          return new Location({
            lat: log.lat,
            lng: log.lng,
            name: log.location,
            log: log,
          })
        })
      loading = false
      return logs || []
    },

    previous() {
      methods.getDate(state.date.subtract(1, 'day'))
    },
    getDate(date) {
      state.date = date
      methods.getLogs()
      methods.scrollTop()
    },
    next() {
      methods.getDate(state.date.add(1, 'day'))
    },
    scrollTop() {
      document.getElementById('nomie-main').scrollTo(0, 0)
    },
    goto(date) {
      state.date = date
      methods.getLogs()
      methods.scrollTop()
    },
    search() {
      SearchStore.view('history')
    },
    trackerTapped(tracker, log) {
      Interact.openStats(`#${tracker.tag}`)
    },
    personTapped(person, log) {
      Interact.openStats(`@${person.id}`)
    },
    contextTapped(context, log) {
      Interact.openStats(`+${context.id}`)
    },
    showLogOptions(log) {
      Interact.logOptions(log)
    },
    selectDate() {
      let ranges: Array<any> = [
        {
          time: 30,
          title: '1 Month Back',
          unit: 'day',
        },
        {
          time: 90,
          title: '90 Days Back',
          unit: 'day',
        },
        {
          time: 180,
          title: '6 Months Back',
          unit: 'day',
        },
        {
          time: 1,
          title: '1 Year Back',
          unit: 'year',
        },
        {
          time: 2,
          title: '2 Years Back',
          unit: 'year',
        },
        {
          time: -1,
          divider: true,
          title: `${Lang.t('general.select-date', 'Select Date')}...`,
          unit: 'day',
        },
      ]

      if (!isToday) {
        ranges.unshift({
          days: 0,
          divider: true,
          title: `${Lang.t('history.go-to-today', 'Go to Today')}`,
        })
      }

      Interact.popmenu({
        buttons: ranges.map((range) => {
          return {
            title: range.title,
            divider: range.divider ? true : false,
            click: async () => {
              if (range.time == -1) {
                let date = await Interact.selectDate()
                if (date) {
                  methods.goto(dayjs(date))
                }
              } else if (range.time === undefined || range.time === 0) {
                methods.goto(dayjs(new Date()))
              } else {
                methods.goto(
                  state.date.subtract(range.time || 0, range.unit || 'day'),
                )
              }
            },
          }
        }),
      })
    },
  }

  async function refresh() {
    refreshing = true
    await tick(500)
    await methods.getLogs(true)
    await LedgerStore.getMemories()
    refreshing = false
  }

  // If a new Log is added, or changed update the list.
  let onLogUpdate
  let onLogSaved
  let onLogsDeleted

  // WHen mounted.
  onMount(() => {
    window.scrollTo(0, 0)
    document.body.classList.remove('scrolled')
    refresh()

    onLogUpdate = LedgerStore.hook('onLogUpdate', async (log) => {
      await tick(600)
      refresh()
    })

    onLogSaved = LedgerStore.hook('onLogSaved', async (log) => {
      await tick(600)
      refresh()
    })

    onLogsDeleted = LedgerStore.hook('onLogsDeleted', async () => {
      await tick(600)
      refresh()
    })
  })
  onDestroy(() => {
    // Unsubscribe
    onLogSaved()
    onLogUpdate()
    onLogsDeleted()
  })
</script>

<style global lang="postcss">
  .history-title {
    transition: all 0.2s ease-in-out;
    padding-left: 16px;
  }

  .scrolled .history-title.hide-scrolled {
    opacity: 0;
  }
  body .history-title.show-scrolled {
    opacity: 0;
  }
  .scrolled .history-title.show-scrolled {
    opacity: 1;
  }

  .close-btn {
    bottom: 20px !important;
    z-index: 10;
    position: absolute !important;
    right: 50%;
    margin-right: -16px;
  }
  .page-history .n-item .n-item:last-child {
    border-bottom: none !important;
  }
  .notification-badge {
    @apply w-4;
    @apply h-4;
    @apply rounded-full;
    @apply bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-50;
    @apply text-gray-700 dark:text-gray-300;
    @apply shadow-sm;
    @apply absolute;
    @apply top-0;
    @apply -right-3;
    @apply flex;
    @apply items-center;
    @apply justify-center;
    font-size: 9px;
    @apply font-bold;
  }
  .active .notification-badge {
    @apply bg-primary-500;
    @apply text-white;
  }
  .notification-badge[data-count='0'] {
    @apply hidden;
  }
  .notification-badge::after {
    content: attr(data-count);
  }
</style>

<NLayout pageTitle={appTitle} {style}>

  <header slot="header" class="items-center flex-column">
    <Container>
      <Toolbar className=" px-2 items-center">
        <Button icon on:click={methods.search}>
          <Icon className="text-primary-500" name="search" size={24} />
        </Button>
        <!-- <Button icon on:click={composeHere}>
          <Icon className="text-primary-500" name="compose" size={24} />
        </Button> -->
        {#if refreshing}
          <Spinner size={16} />
        {/if}
        <h1
          class="leading-none ntitle line-clamp-1"
          aria-label="Current Active Date">
          {state.date.format('ddd')}
          {state.date.format($UserStore.meta.is24Hour ? 'D MMM YYYY' : 'MMM D YYYY')}
        </h1>
        <NextPrevCal
          on:previous={methods.previous}
          on:next={methods.next}
          on:calendar={methods.selectDate}
          {isToday} />
      </Toolbar>
      {#if logs.length}
        <Toolbar>
          <ButtonGroup>
            {#each OTDViews as loopView}
              <Button
                className={view === loopView.view ? 'active' : ''}
                icon
                on:click={() => {
                  view = loopView.view
                }}>
                <div class="relative pt-1">
                  <Icon name={loopView.icon} size={28} />
                  <div
                    data-count={loopView.reduce(logs)}
                    class="notification-badge" />
                </div>
              </Button>
            {/each}
          </ButtonGroup>
        </Toolbar>
      {/if}
    </Container>
  </header>
  <!-- end header-content header -->

  <main slot="content" class="flex flex-col h-full page page-history">
    <div class="relative flex-grow min-h-full">
      <!-- {#if logs && logs.length}
        <Text size="xl" bold className="history-title pl-3 mt-2">
          {state.date.format($UserStore.meta.is24Hour ? 'ddd Do MMM YYYY' : 'ddd MMM Do YYYY')}
        </Text>
      {/if} -->

      <OfflineQueue />

      {#if loading}
        <div class="flex items-center justify-center w-full max-h-full h-75vh">
          <Spinner />
        </div>
      {:else if !loading && !logs.length}
        <Container className="flex items-center justify-center h-75vh">
          <Empty
            emoji="⏳"
            title={state.date.format($UserStore.meta.is24Hour ? 'ddd Do MMM YYYY' : 'ddd MMM Do YYYY')}
            description={`${Lang.t('history.empty-day', 'No data was found on this day')}`}
            buttonLabel={Lang.t('history.add-a-note', 'Add a Note...')}
            buttonClick={composeHere} />
        </Container>
      {:else}
        <OnThisDayViews {view} {logs} />
      {/if}
    </div>
    {#if $LedgerStore.memories.length > 0 && !showSearch && isToday && ['all', 'notes'].indexOf(view) > -1}
      <section class="mt-3 bg-primary-500">
        <Container className="px-4 pb-4">
          <!-- Show History if exists -->

          <div class="memories">
            {#each $LedgerStore.memories as log}
              <div class="py-3 text-center memories-log-header">
                <button
                  aria-label="View logs from {dayjs(log.end).format('ddd MM YYYY')}"
                  class="flex items-center justify-center w-full py-2 font-medium text-black bg-primary-500"
                  on:click={() => {
                    methods.goto(dayjs(log.end))
                  }}>
                  <span class="text-sm">{dayjs(log.end).fromNow()}</span>
                  <Icon icon={ChevronRight} className="fill-white" size={16} />
                </button>
              </div>
              <LogItem
                fullDate
                className="aged"
                {log}
                on:textClick={(event) => {
                  methods.textClick(event)
                }} />
            {/each}
          </div>

          <!-- end history -->
        </Container>
      </section>
    {/if}

  </main>

  <!-- end header-content content -->

</NLayout>

<!-- 
 <div slot="bottom" class="map-base">
    {#if locations.length && !loading}
      {#if !state.showAllLocations}
        <div
          class="mini-map closed"
          on:click={() => {
            state.showAllLocations = !state.showAllLocations
          }}>
          <NMap {locations} />
        </div>
      {:else}
        <div class="content-map">
          <NMap {locations} />
          <Button
            className="close-btn"
            color="dark"
            shape="circle"
            on:click={() => {
              state.showAllLocations = !state.showAllLocations
            }}>
            <Icon icon={X} size={32} />
          </Button>

        </div>
      {/if}
    {/if}

  </div> -->
