<script lang="ts">
  //Vendors
  import dayjs, { Dayjs } from 'dayjs'

  // Modules
  import type TrackerConfig from '../../modules/tracker/tracker'
  import type TrackableElement from '../../modules/trackable-element/trackable-element'
  import type { ITimeSpanUnit } from './statsV5'
  import StatsV5, { timeSpans } from './statsV5'

  // import { strToColor } from "../../components/dymoji/dymoji";

  // Utils
  // import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import tick from '../../utils/tick/tick'
  import Storage from '../../modules/storage/storage'

  import extractor from '../../utils/extract/extract'

  // Components
  import Modal2 from '../../components/modal/modal2.svelte'
  import NButtonGroup from '../../components/button-group/button-group.svelte'
  import NToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import NSpinner from '../../components/spinner/spinner.svelte'
  import NBarChart from '../../components/charts/bar-chart-2.svelte'
  import NLogList from '../../components/log-list/log-list.svelte'
  import NIcon from '../../components/icon/icon.svelte'

  // Containers
  import NMap from '../../domains/map/map.svelte'

  // Stores
  import { LedgerStore } from '../ledger/LedgerStore'
  import { Interact } from '../../store/interact'
  import { UserStore } from '../../store/user-store'
  import { Lang } from '../../store/lang'
  import { TrackerStore } from '../../store/tracker-store'

  import StatsOverview from './stats-overview.svelte'
  import StatsCompare from './stats-compare.svelte'
  import Button from '../../components/button/button.svelte'
  import Text from '../../components/text/text.svelte'
  import StatsTime from './stats-time.svelte'
  import NextPrevCal from '../../components/next-prev-cal/next-prev-cal.svelte'
  import { SearchStore } from '../../store/search-store'
  import NDate from '../../utils/ndate/ndate'
  import Streak from './steak/streak.svelte'

  import Card from '../../components/card/card.svelte'
  import Panel from '../../components/panel/panel.svelte'

  import { StatsStore, closeStats } from './StatsStore'

  /**
   * Time Spans available for stats - holding of various
   * units and formats
   **/

  /**
   * View Management
   * Available view, labels, and whatnot
   * **/
  const dataViews = {
    overview: {
      id: 'overview',
      icon: 'home',
      label: Lang.t('general.home', 'Home'),
    },
    compare: {
      id: 'compare',
      icon: 'beaker',
      label: Lang.t('stats.compare', 'Relate'),
    },
    map: { id: 'map', icon: 'map', label: Lang.t('general.map', 'Map') },
    time: { id: 'time', icon: 'time', label: Lang.t('stats.time', 'Time') },
    streak: {
      id: 'streak',
      icon: 'calendar',
      label: Lang.t('stats.streak', 'Streak'),
    },
    logs: {
      id: 'logs',
      icon: 'annotation',
      label: Lang.t('general.logs', 'Logs'),
      focused: true,
    },
  }

  let showModal = false

  /**
   * Remember View Settings
   * A fast way to store UI state in localstorage
   * Good for remembering what they did last
   * **/
  const viewMemory = new Storage.SideStore('stats-memory')
  function remember(key: string, value?: any) {
    let base = `${getLastTerm()}-${key}`
    if (key && value !== undefined) {
      viewMemory.put(base, value)
      return value
    } else {
      return viewMemory.get(base)
    }
  }

  type StatusModalProps = {
    currentTerm?: string // what's the search term @person #tracker +context
    currentColor: string // Default color
    date: Dayjs // Setup the date
    timeSpan: string
    dataView: string
    timeOption: Array<any>
    viewOption: Array<any>
    loading: boolean
    stats: any
    compare: Array<any>
    selected: { index: any; rows: any; date: any }
    lookupStack: Array<any>
    related: Array<any>
    trackableElement: TrackableElement
    tracker: TrackerConfig
    showAnimation: boolean
    range?: any
  }

  const state: StatusModalProps = {
    currentColor: '#444',
    date: dayjs(),
    timeSpan: remember('timeSpan') || 'w',
    dataView: remember('dataView') || 'overview',
    timeOption: [],
    viewOption: [],
    loading: true,
    range: undefined,
    stats: null,
    compare: [],
    selected: { index: undefined, rows: null, date: null },
    lookupStack: [],
    related: [],
    showAnimation: false,
    trackableElement: undefined,
    tracker: undefined,
  }

  function setTimeView(option) {
    remember('timeSpan', option.id)
    state.timeSpan = option.id
  }

  function setView(option) {
    remember('dataView', option.id)
    state.dataView = option.id
  }

  function getTimeSpan(): ITimeSpanUnit {
    return timeSpans[state.timeSpan]
  }

  function getTimeViewButtons() {
    return
  }

  $: timeViewButtons = Object.keys(timeSpans).map((optionId) => {
    let option = timeSpans[optionId]
    return {
      label: option.label,
      active: state.timeSpan === optionId,
      click: () => {
        setTimeView(option)
      },
    }
  })

  $: logViewButtons = [
    {
      label: `Only ${state.currentTerm}`,
      id: 'focused',
      active: dataViews.logs.focused,
      click() {
        dataViews.logs.focused = true
        if (state.selected.index) {
          setSelected(state.selected)
        }
      },
    },
    {
      label: `All Logs`,
      id: 'all',
      active: !dataViews.logs.focused,
      click() {
        dataViews.logs.focused = false
        if (state.selected) {
          setSelected(state.selected)
        }
      },
    },
  ]

  /**
   * Generate the btn group buttons
   * **/
  function getDataViewButtons() {
    return Object.keys(dataViews)
      .map((optionId) => {
        let option = dataViews[optionId]
        if ((option.excludeFrom || []).indexOf(state.timeSpan) == -1) {
          return {
            label: option.label,
            icon: option.icon,
            active: state.dataView === optionId,
            click: () => {
              setView(option)
            },
          }
        } else {
          return null
        }
      })
      .filter((row) => row)
  }

  // Close the stat window
  function close() {
    Interact.closeStats()
  }

  // Back from the stack of stats
  function back() {
    Interact.update((state) => {
      state.stats.terms.pop()
      return state
    })
    main()
  }

  // Generate a Search term for a text and type
  // for example turn tracker + water into #water
  function getSearchTerm(type, text): string {
    let response = ''
    switch (type) {
      case 'tracker':
        response = `#${text}`
        break
      case 'person':
        response = `@${text}`
        break
      case 'context':
        response = `+${text}`
        break
      default:
        response = text
        break
    }
    return response
  }

  // function getTitle(): string {
  //   return getLastTerm()
  // }

  /**
   * Get the proper From Date to display
   * BUG: This might have a probelm
   * **/
  function getFromDate(): Dayjs {
    let timespan: ITimeSpanUnit = getTimeSpan()
    let fromDate = getToDate()
      .subtract(timespan.count || 1, timespan.unit)
      .startOf('day')
    // If its week or month, add a day to the start - #bug maybe?
    fromDate =
      ['week'].indexOf(timespan.unit) > -1 ? fromDate.add(1, 'day') : fromDate
    return fromDate
  }

  /**
   * Get End Date
   * Returns a Dayjs version of the date
   * **/
  function getToDate(): Dayjs {
    let toDate = dayjs(state.date).endOf('day')
    return toDate
  }

  /**
   * Get a Trackable Element
   * from a String.
   * **/
  // function getTrackableElement(str): TrackableElement {
  //   let type = extractor.toElement(str);
  //   if (type.type == "tracker") {
  //     type.obj = $TrackerStore.trackers[type.id];
  //   }
  //   return type;
  // }

  function onMoreTap() {
    let buttons = [
      {
        title: Lang.t('stats.streak', 'Streak'),
        icon: 'calendar',
        click: () => {
          Interact.openStreak(state.currentTerm)
        },
      },
      {
        title: `${Lang.t('general.edit')} ${state.currentTerm}`,
        icon: 'edit',
        click: () => {
          if (state.trackableElement.type == 'tracker') {
            Interact.editTracker(TrackerStore.byTag(state.trackableElement.id))
          } else if (state.trackableElement.type == 'person') {
            Interact.person(state.trackableElement.id)
          }
        },
      },
      {
        title: `${Lang.t('general.search')} ${state.currentTerm}`,
        click() {
          close()
          SearchStore.search(
            state.trackableElement.prefix + state.trackableElement.id,
          )
        },
        icon: 'search',
      },
    ]
    Interact.popmenu({ title: `${Lang.t('general.options')}`, buttons })
  }

  function onCalendarTap() {
    let buttons = []

    const gotoToday = {
      title: Lang.t('general.today', 'Today'),
      click: () => {
        changeDate(dayjs())
      },
    }
    const startOfMonth = {
      title: Lang.t('time.start-of-month', 'Start of month'),
      click: () => {
        changeDate(state.date.startOf('month').subtract(1, 'day'))
      },
    }
    const startOfYear = {
      title: Lang.t('time.start-of-year', 'Start of year'),
      click: () => {
        changeDate(state.date.startOf('year'))
      },
    }
    const startOfWeek = {
      title: Lang.t('time.start-of-week', 'Start of week'),
      click: () => {
        // TODO: Bug getting the wrong start of the week
        let date: Dayjs = NDate.setFirstDayOfWeek(
          $UserStore.meta.firstDayOfWeek,
        ).getFirstDayOfWeek()
        changeDate(date)
      },
    }

    if (dayjs().format('DD-MM-YYYY') !== state.date.format('DD-MM-YYYY')) {
      buttons.push(gotoToday)
    }
    buttons.push(startOfWeek)
    buttons.push(startOfMonth)
    buttons.push(startOfYear)

    //state.trackableElement
    Interact.popmenu({ title: Lang.t('general.goto', 'Go to...'), buttons })
  }

  function getLastTerm() {
    let lastTerm = $Interact.stats.terms[$Interact.stats.terms.length - 1]
    return lastTerm
  }

  async function getStats() {
    state.loading = true
    let queryPayload: any = {
      search: state.trackableElement,
      start: getFromDate(),
      end: getToDate(),
    }
    // if day - normalize start and end
    queryPayload.start = getFromDate()
    queryPayload.end = getToDate()

    // Get Logs from the Ledger Store
    let results = await LedgerStore.query(queryPayload)

    // Prep Stats
    const statsV5 = new StatsV5({})

    // Generate Stats
    state.stats = statsV5.generate({
      rows: results,
      fromDate: getFromDate(),
      toDate: getToDate(),
      mode: state.timeSpan,
      math: state.tracker.math,
      trackableElement: state.trackableElement,
    })

    // See if we have any saved compares

    state.related = statsV5.getRelated()
    await tick(500)
    // state.compare = state.compare;

    state.loading = false
  } // end getStats()

  function getDayRange(): string {
    return state.date.format(`ddd ${dateFormat}`)
  }

  function loadPreviousDate(): void {
    state.date = dayjs(state.date).subtract(1, getTimeSpan().unit)
    lastTimeSpan = null
    console.log({ state })
  }

  function loadNextDate(): void {
    state.date = dayjs(state.date).add(1, getTimeSpan().unit)
    lastTimeSpan = null
  }

  function changeDate(date): void {
    state.date = date
    lastTimeSpan = null
  }

  function getWeekRange(): string {
    const from = getFromDate()
    const to = getToDate()
    if (to.format('MMM') !== from.format('MMM')) {
      return `${from.format(dateFormatShort)} - ${to.format(dateFormat)}`
    } else {
      return `${from.format(dateFormatShort)} - ${to.format(
        `${dateFormatShort} YYYY`,
      )}`
    }
  }

  // function getCalendarData() {
  //   let rows = state.stats.rows
  //     .filter((row) => {
  //       return new Date(row.end).getMonth() == state.date.toDate().getMonth()
  //     })
  //     .map((row) => {
  //       row.start = new Date(row.start)
  //       row.end = new Date(row.end)
  //       row.repeat = 'never'
  //       return row
  //     })
  //   return rows
  // }

  function getLocations() {
    return state.stats.rows
      .map((row) => {
        if (row.lat) {
          return {
            lat: row.lat,
            lng: row.lng,
            name: row.location,
            log: row,
          }
        } else {
          return null
        }
      })
      .filter((row) => row)
  }

  function getMonthRange() {
    const from = getFromDate()
    const to = getToDate()
    return `${from.add(1, 'day').format(dateFormatShort)} - ${to.format(
      dateFormat,
    )}`
  }

  function getYearRange() {
    const from = getFromDate()
    const to = getToDate()
    return `${from.add(1, 'month').format(dateFormat)} - ${to.format(
      dateFormat,
    )}`
  }

  function gettimeRangeText(): string {
    let range
    switch (state.timeSpan) {
      case 'd':
        range = getDayRange()
        break
      case 'w':
        range = getWeekRange()
        break
      case 'm':
        range = getMonthRange()
        break
      case 'q':
        range = getMonthRange()
        break
      case 'y':
        range = getYearRange()
        break
    }
    return range
  }

  // function clearSelected() {
  //   state.selected = { index: undefined, rows: null, date: null }
  // }

  /**
   * Set Selected ({point})
   * User Selected a Specific Date from the Cart
   */

  async function setSelected(selected) {
    if (selected && state.selected !== selected) {
      try {
        _setSelected(selected)
      } catch (e) {
        Interact.error(e.message)
      }
    }
  }

  async function _setSelected(selected) {
    Interact.focusDate(selected)
    state.selected = selected
  }

  async function main() {
    await tick(10)
    // Get term from Interact Store
    // Why hard coded to the first item? Previous nomie supported multiple
    // trackables to stack on top of eachother, I've since
    // pulled it since it wasn't really useful
    state.currentTerm = $StatsStore.trackables[0].raw
    // Get range and view options
    if (state.currentTerm) {
      if ($StatsStore.date) {
        state.date = dayjs($StatsStore.date)
      }
      state.range = gettimeRangeText()
      state.viewOption = getDataViewButtons()
      // Get trackable element from the latest term
      state.trackableElement = extractor.toElement(state.currentTerm)
      // Get Tracker - make a fake one if a person, or context
      state.tracker = TrackerStore.byTag(state.trackableElement.id)
      state.currentColor = state.tracker.color
      getStats()
    }
  }

  /** Reactive Functions and Variables **/
  let lastTimeSpan = state.timeSpan
  $: if (state.timeSpan && state.timeSpan !== lastTimeSpan) {
    lastTimeSpan = state.timeSpan
    main()
  }

  /**
   * IMPORTANT
   * When the term changes - we must show the new stats
   * Don't sleep on this one.
   */
  let lastTerms
  $: if ($Interact.stats.terms.join(',') !== lastTerms) {
    lastTerms = $Interact.stats.terms.join(',')
    main()
    state.showAnimation = true
    setTimeout(() => {
      showModal = true
    }, 200)
    setTimeout(() => {
      state.showAnimation = false
    }, 200)
    setTimeout(() => {
      state.showAnimation = false
    }, 1000)
  }

  $: if ($Interact.stats.terms.length === 0 && lastTerms) {
    setTimeout(() => {
      showModal = false
    }, 200)
  }

  let lastDataView = state.dataView
  $: if (state.dataView && state.dataView != lastDataView) {
    lastDataView = state.dataView
    state.viewOption = getDataViewButtons()
  }

  $: timeFormat = $UserStore.meta.is24Hour ? 'HH:mm' : 'h:mm a'
  $: dateFormat = $UserStore.meta.is24Hour ? 'Do MMM YYYY' : 'MMM Do YYYY'
  $: dateFormatShort = $UserStore.meta.is24Hour ? 'Do MMM' : 'MMM Do'

  function onSwipeDown(e) {
    close()
  }
</script>

<style global lang="postcss">
  .stats-modal {
    z-index: 1301 !important;
  }
  .chart-item {
    position: relative;
  }
  .stats-modal .n-modal {
    max-width: 500px !important;
  }
</style>

<Modal2
  visible={$StatsStore.showModal}
  id="stats-modal"
  tappable
  on:close={close}
  on:swipeDown={onSwipeDown}>
  <Panel className="h-full">
    <header slot="header" class="box-shadow-float">
      {#if $Interact.stats.terms.length > 1}
        {#each $Interact.stats.terms as term}
          <div class="mock-header">
            <span>{term}</span>
          </div>
        {/each}
      {/if}

      <NToolbarGrid>
        <div slot="left" class="truncate">
          <Button icon color="transparent" on:click={closeStats}>
            <NIcon name="close" className="text-primary-500" />
          </Button>
        </div>

        <h1 class="line-clamp-1 ntitle">{state.currentTerm}</h1>

        <Button icon on:click={onMoreTap} slot="right" className="mr-2">
          <NIcon name="more" className="text-primary-500" />
        </Button>
      </NToolbarGrid>
      <div class="flex px-2 pb-2">
        <NButtonGroup size="sm" buttons={timeViewButtons} />
      </div>

      <div class="flex px-3 pt-2 pb-3 n-toolbar">
        <div class="text-sm dark:text-gray-300 line-clamp-1">{state.range}</div>
        <NextPrevCal
          on:next={loadNextDate}
          on:previous={loadPreviousDate}
          on:calendar={onCalendarTap} />
      </div>

      {#if state.loading}
        <div class="flex items-center justify-center h-50vh">
          <NSpinner size={46} />
        </div>
      {/if}

      {#if state.stats && !state.loading}
        <div class="px-2 pb-1 main-chart">
          <NBarChart
            height={140}
            ignoreZero={state.tracker.ignore_zeros}
            color={state.currentColor}
            labels={state.stats.chart.values.map((point) => point.x)}
            points={state.stats.chart.values}
            on:swipeLeft={loadNextDate}
            on:swipeRight={loadPreviousDate}
            on:more={(evt) => {
              Interact.onThisDay(evt.detail.date.toDate())
            }}
            xFormat={(x, index) => {
              return x
            }}
            yFormat={(y) => {
              return state.tracker.displayValue(y)
            }}
            on:tap={(event) => {
              setSelected(event.detail)
            }}
            activeIndex={state.selected.index} />
        </div>
      {/if}

    </header>

    <div slot="footer" class="p-2 bg-gray-200 w-100 dark:bg-gray-800">
      <NButtonGroup inverse buttons={state.viewOption} />
    </div>

    <main class="relative min-h-full bg-gray-200 dark:bg-gray-800">
      {#if !state.loading}
        {#if state.dataView === 'compare'}
          <div class="p-2 lg:p-4">
            <StatsCompare
              {remember}
              fromDate={getFromDate()}
              toDate={getToDate()}
              timeSpan={state.timeSpan}
              stats={state.stats}
              on:dateSelected={(evt) => {
                setSelected(evt.detail)
              }} />
          </div>
          <!-- selected={state.selected} -->
        {/if}
        {#if state.dataView === 'streak'}
          {#if state.trackableElement}
            <Card className="p-3">
              {#if state.timeSpan !== 'd'}
                <Streak
                  showDetail={true}
                  term={undefined}
                  element={state.trackableElement}
                  selectedDate={state.date}
                  view={timeSpans[state.timeSpan].streakUnit} />
              {:else}
                <Text faded>
                  Streak view currently unavailable at the day level
                </Text>
              {/if}
            </Card>
          {/if}
        {/if}
        {#if state.dataView === 'map'}
          <NMap
            small
            locations={getLocations()}
            className="z-0 flex-grow flex-shrink" />
        {/if}
        {#if state.stats}
          {#if state.dataView === 'overview'}
            <StatsOverview stats={state.stats} tracker={state.tracker} />
            <!-- end over view -->
          {:else if state.dataView === 'time'}
            <div class="p-2 lg:p-40">
              <StatsTime
                color={state.currentColor}
                term={state.currentTerm}
                stats={state.stats} />
            </div>
          {:else if state.dataView === 'logs'}
            {#if state.timeSpan == 'y'}
              <div class="p-4 text-sm text-center text-inverse-2">
                Logs not yet available for a full year
              </div>
            {:else}
              <div class="p-4">
                <NLogList
                  fullDate
                  compact
                  logs={state.selected.rows || state.stats.rows}
                  style="min-height:100%"
                  className="bg-bg flex-grow flex-shrink" />
              </div>
            {/if}
          {/if}
        {/if}
      {/if}
    </main>
  </Panel>
</Modal2>
