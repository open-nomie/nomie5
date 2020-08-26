<script>
  //Vendors
  import { onMount } from "svelte";
  import { navigate, Router, Route } from "svelte-routing";
  import dayjs from "dayjs";

  // Modules
  import Tracker from "../../modules/tracker/tracker";
  import NLog from "../../modules/nomie-log/nomie-log";
  import StatsV5 from "../../modules/stats/statsV5";
  import StatsRef from "../../modules/stats/stats-ref";

  import TimeOfDay from "../../components/time-of-day/time-of-day.svelte";
  import DayOfWeek from "../../components/day-of-week/day-of-week.svelte";

  // import { strToColor } from "../../components/dymoji/dymoji";

  // Utils
  // import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import tick from "../../utils/tick/tick";
  import math from "../../utils/math/math";
  import Storage from "../../modules/storage/storage";
  import DataDistance from "../../modules/data-distance/data-distance";

  import extractor from "../../utils/extract/extract";

  // Components
  import NModal from "../../components/modal/modal.svelte";
  import Dymoji from "../../components/dymoji/dymoji.svelte";
  import NButtonGroup from "../../components/button-group/button-group.svelte";
  import HScroller from "../../components/h-scroller/h-scroller.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NSpinner from "../../components/spinner/spinner.svelte";
  import NBarChart from "../../components/charts/bar-chart-2.svelte";
  import NLogList from "../../components/log-list/log-list.svelte";
  import NTimeGrid from "../../components/day-time-grid/day-time-grid.svelte";
  import NIcon from "../../components/icon/icon.svelte";

  // Containers
  import NMap from "../../containers/map/map.svelte";

  // Stores
  import { LedgerStore } from "../../store/ledger";
  import { Interact } from "../../store/interact";
  import { UserStore } from "../../store/user-store";
  import { Lang } from "../../store/lang";
  import { TrackerStore } from "../../store/tracker-store";
  import { PeopleStore } from "../../store/people-store";

  import StatsOverview from "./stats-overview.svelte";
  import StatsCompare from "./stats-compare.svelte";
  import Button from "../../components/button/button.svelte";
  import Text from "../../components/text/text.svelte";
  import NPaths from "../../paths";
  import StatsTime from "./stats-time.svelte";
  import regex from "../../utils/regex";
  import NextPrevCal from "../../components/next-prev-cal/next-prev-cal.svelte";

  export const timeSpans = {
    d: { id: "d", label: "D", title: "Day", unit: "day" },
    w: { id: "w", label: "W", title: "Week", unit: "week" },
    m: { id: "m", label: "M", title: "Month", unit: "month" },
    q: { id: "q", label: "3M", title: "Quarter", unit: "month", count: 3 },
    y: { id: "y", label: "Y", title: "Year", unit: "year" },
  };

  const dataViews = {
    overview: { id: "overview", label: "Home" },
    compare: { id: "compare", label: "Compare" },
    map: { id: "map", label: "Map" },
    time: { id: "time", label: "Time" },
    logs: { id: "logs", label: "Logs", focused: true },
  };

  const types = {
    tracker: { prefix: "#" },
    person: { prefix: "@" },
    context: { prefix: "+" },
    location: { prefix: "" },
  };

  const viewMemory = new Storage.SideStore("stats-memory");

  function remember(key, value) {
    let base = `${getLastTerm()}-${key}`;
    if (key && value !== undefined) {
      viewMemory.put(base, value);
      return value;
    } else {
      return viewMemory.get(base);
    }
  }

  const state = {
    currentTerm: null,
    currentColor: "#444",
    date: dayjs(),
    timeSpan: remember("timeSpan") || "w",
    dataView: remember("dataView") || "overview",
    timeOption: [],
    viewOption: [],
    loading: true,
    stats: null,
    compare: [],
    selected: { index: undefined, rows: null },
    lookupStack: [],
    related: [],
  };

  function setTimeView(option) {
    remember("timeSpan", option.id);
    state.timeSpan = option.id;
  }

  function setView(option) {
    remember("dataView", option.id);
    state.dataView = option.id;
  }

  function getTimeSpan() {
    return timeSpans[state.timeSpan];
  }

  function getTimeViewButtons() {
    return;
  }

  $: timeViewButtons = Object.keys(timeSpans).map((optionId) => {
    let option = timeSpans[optionId];
    return {
      label: option.label,
      active: state.timeSpan === optionId,
      click: () => {
        setTimeView(option);
      },
    };
  });

  $: logViewButtons = [
    {
      label: `Only ${state.currentTerm}`,
      id: "focused",
      active: dataViews.logs.focused,
      click() {
        dataViews.logs.focused = true;
        if (state.selected) {
          setSelected(state.selected);
        }
      },
    },
    {
      label: `All Logs`,
      id: "all",
      active: !dataViews.logs.focused,
      click() {
        dataViews.logs.focused = false;
        if (state.selected) {
          setSelected(state.selected);
        }
      },
    },
  ];

  function getDataViewButtons() {
    return Object.keys(dataViews)
      .map((optionId) => {
        let option = dataViews[optionId];
        if ((option.excludeFrom || []).indexOf(state.timeSpan) == -1) {
          return {
            label: option.label,
            active: state.dataView === optionId,
            click: () => {
              setView(option);
            },
          };
        } else {
          return null;
        }
      })
      .filter((row) => row);
  }

  function close() {
    Interact.closeStats();
  }

  function back() {
    Interact.update((state) => {
      state.stats.terms.pop();
      return state;
    });
    main();
  }

  function getSearchTerm(type, text) {
    let response = "";
    switch (type) {
      case "tracker":
        response = `#${text}`;
        break;
      case "person":
        response = `@${text}`;
        break;
      case "context":
        response = `+${text}`;
        break;
      default:
        response = text;
        break;
    }
    return response;
  }

  function getTitle() {
    return getLastTerm();
  }

  function getFromDate() {
    let timespan = getTimeSpan();
    return getToDate().subtract(timespan.count || 1, timespan.unit);
  }

  function getToDate() {
    return dayjs(state.date);
  }

  function getTrackableElement(str) {
    let type = extractor.toElement(str);
    if (type.type == "tracker") {
      type.obj = $TrackerStore.trackers[type.id];
    }
    return type;
  }

  function onMoreTap() {
    let buttons = [
      {
        title: "View Streak",
        click: () => {
          Interact.openStreak(state.currentTerm);
        },
      },
      {
        title: `Edit ${state.currentTerm}`,
        click: () => {
          if (state.trackableElement.type == "tracker") {
            Interact.editTracker(TrackerStore.byTag(state.trackableElement.id));
          } else if (state.trackableElement.type == "person") {
            Interact.person(state.trackableElement.id);
          }
        },
      },
      {
        title: `Search for ${state.currentTerm}`,
        click() {
          close();
          navigate(NPaths.routes.search(state.trackableElement.prefix + state.trackableElement.id));
        },
      },
    ];
    Interact.popmenu({ title: "Options", buttons });
  }

  function onCalendarTap() {
    let buttons = [];

    const gotoToday = {
      title: "Today",
      click: () => {
        changeDate(dayjs());
      },
    };
    const startOfMonth = {
      title: "Start of month",
      click: () => {
        changeDate(state.date.startOf("month").subtract(1, "day"));
      },
    };
    const startOfYear = {
      title: "Start of year",
      click: () => {
        changeDate(state.date.startOf("year"));
      },
    };
    const startOfWeek = {
      title: "Start of week",
      click: () => {
        let date = state.date.startOf("week");
        if (!$UserStore.meta.is24Hour) {
          date = date.subtract(1, "day");
        }
        changeDate(date);
      },
    };

    if (dayjs().format("DD-MM-YYYY") !== state.date.format("DD-MM-YYYY")) {
      buttons.push(gotoToday);
    }
    buttons.push(startOfWeek);
    buttons.push(startOfMonth);
    buttons.push(startOfYear);

    //state.trackableElement
    Interact.popmenu({ title: "Go to...", buttons });
  }

  function getLastTerm() {
    let lastTerm = $Interact.stats.terms[$Interact.stats.terms.length - 1];
    return lastTerm;
  }

  async function getStats() {
    state.loading = true;
    let queryPayload = {
      search: state.trackableElement,
      start: getFromDate(),
      end: getToDate(),
    };
    // if day - normalize start and end
    if (state.timeSpan == "d") {
    }
    queryPayload.start = dayjs(getFromDate()).startOf("day");
    queryPayload.end = dayjs(getToDate()).endOf("day");

    // Get Logs from the Ledger Store
    let results = await LedgerStore.query(queryPayload);
    // Prep Stats
    const statsV5 = new StatsV5();

    // Generate Stats
    state.stats = statsV5.generate({
      rows: results,
      fromDate: getFromDate(),
      toDate: getToDate(),
      mode: state.timeSpan,
      math: state.tracker.math,
      trackableElement: state.trackableElement,
    });

    // See if we have any saved compares

    state.related = statsV5.getRelated();
    await tick(100);
    // state.compare = state.compare;

    state.loading = false;
  } // end getStats()

  function getDayRange() {
    return state.date.format(`ddd ${dateFormat}`);
  }

  function loadPreviousDate() {
    state.date = dayjs(state.date).subtract(1, getTimeSpan().unit);
    lastTimeSpan = null;
  }

  function loadNextDate() {
    state.date = dayjs(state.date).add(1, getTimeSpan().unit);
    lastTimeSpan = null;
  }

  function changeDate(date) {
    state.date = date;
    lastTimeSpan = null;
  }

  function getWeekRange() {
    const from = getFromDate();
    const to = getToDate();
    if (to.format("MMM") !== from.format("MMM")) {
      return `${from.format(dateFormatShort)} - ${to.format(dateFormat)}`;
    } else {
      return `${from.format(dateFormatShort)} - ${to.format(`${dateFormatShort} YYYY`)}`;
    }
  }

  function getCalendarData() {
    let rows = state.stats.rows
      .filter((row) => {
        return new Date(row.end).getMonth() == state.date.toDate().getMonth();
      })
      .map((row) => {
        row.start = new Date(row.start);
        row.end = new Date(row.end);
        row.repeat = "never";
        return row;
      });
    return rows;
  }

  function getLocations() {
    return state.stats.rows
      .map((row) => {
        if (row.lat) {
          return {
            lat: row.lat,
            lng: row.lng,
            name: row.location,
            log: row,
          };
        } else {
          return null;
        }
      })
      .filter((row) => row);
  }

  function getMonthRange() {
    const from = getFromDate();
    const to = getToDate();
    return `${from.add(1, "day").format(dateFormatShort)} - ${to.format(dateFormat)}`;
  }

  function getYearRange() {
    const from = getFromDate();
    const to = getToDate();
    return `${from.add(1, "month").format(dateFormat)} - ${to.format(dateFormat)}`;
  }

  function gettimeRangeText() {
    let range;
    switch (state.timeSpan) {
      case "d":
        range = getDayRange();
        break;
      case "w":
        range = getWeekRange();
        break;
      case "m":
        range = getMonthRange();
        break;
      case "q":
        range = getMonthRange();
        break;
      case "y":
        range = getYearRange();
        break;
    }
    return range;
  }

  function clearSelected() {
    state.selected = { index: undefined, rows: null };
  }

  /**
   * Set Selected ({point})
   * User Selected a Specific Date from the Cart
   */

  async function setSelected(selected) {
    if (selected && state.selected !== selected) {
      try {
        _setSelected(selected);
      } catch (e) {
        Interact.error(e.message);
      }
    }
  }
  async function _setSelected(selected) {
    state.selected = selected;

    let payload = {
      start: dayjs(state.selected.date).startOf("day"),
      end: dayjs(state.selected.date).endOf("day"),
      limit: 100,
    };
    // if day - normalize start and end
    if (state.timeSpan == "d") {
      payload.start = dayjs(state.selected.date).startOf("hour");
      payload.end = dayjs(state.selected.date).endOf("hour");
    } else if (state.timeSpan == "w" || state.timeSpan == "m") {
      payload.start = dayjs(state.selected.date).startOf("day");
      payload.end = dayjs(state.selected.date).endOf("day");
    } else if (state.timeSpan == "q") {
      payload.end = dayjs(state.selected.date).endOf("month");
      payload.start = dayjs(payload.end).subtract(3, "month").startOf("month");
    } else if (state.timeSpan == "y") {
      payload.start = dayjs(state.selected.date).startOf("month");
      payload.end = dayjs(state.selected.date).endOf("month");
    }

    let rows = await LedgerStore.query(payload);

    if (dataViews.logs.focused) {
      state.selected.rows = rows.filter((row) => {
        return row.note.match(regex.escape(state.trackableElement.toSearchTerm()));
      });
    } else {
      state.selected.rows = rows;
    }
    return state.selected.rows;
  }

  async function main() {
    // Get term from Interact Store
    state.currentTerm = $Interact.stats.terms[$Interact.stats.terms.length - 1];
    // Get range and view options
    state.range = gettimeRangeText();
    state.viewOption = getDataViewButtons();
    // Get trackable element from the latest term
    state.trackableElement = extractor.toElement(state.currentTerm);
    // Get Tracker - make a fake one if a person, or context
    state.tracker = TrackerStore.byTag(state.trackableElement.id);
    state.currentColor = state.tracker.color;
    getStats();
  }

  onMount(() => {
    main();
  });

  /** Reactive Functions and Variables **/
  let lastTimeSpan = state.timeSpan;
  $: if (state.timeSpan && state.timeSpan !== lastTimeSpan) {
    lastTimeSpan = state.timeSpan;
    main();
  }

  /**
   * IMPORTANT
   * When the term changes - we must show the new stats
   * Don't sleep on this one.
   */
  let lastTerms;
  $: if ($Interact.stats.terms.join(",") !== lastTerms) {
    lastTerms = $Interact.stats.terms.join(",");
    main();
    state.showAnimation = true;
    setTimeout(() => {
      state.showAnimation = false;
    }, 200);
    setTimeout(() => {
      state.showAnimation = false;
    }, 1000);
  }

  let lastDataView = state.dataView;
  $: if (state.dataView && state.dataView != lastDataView) {
    lastDataView = state.dataView;
    state.viewOption = getDataViewButtons();
  }

  $: timeFormat = $UserStore.meta.is24Hour ? "HH:mm" : "h:mm a";
  $: dateFormat = $UserStore.meta.is24Hour ? "Do MMM YYYY" : "MMM Do YYYY";
  $: dateFormatShort = $UserStore.meta.is24Hour ? "Do MMM" : "MMM Do";

  function onSwipeDown(e) {
    close();
  }
</script>

<style lang="scss">
  :global(.stats-modal) {
    z-index: 1300 !important;
  }

  .n-list {
    max-width: 100vw;
    overflow: hidden;
  }

  :global(.chart-item) {
    position: relative;
  }

  .time-range {
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
    line-height: 1rem;
  }
  :global(.stats-modal .n-modal) {
    max-width: 500px !important;
  }
</style>

<NModal className="stats-modal" bodyClass="bg-solid-1 " fullscreen closeOnBackgroundTap on:close={close} on:swipeDown={onSwipeDown}>
  <header slot="raw-header" class="box-shadow-float">
    {#if $Interact.stats.terms.length > 1}
      {#each $Interact.stats.terms as term}
        <div class="mock-header mock-header">
          <span>{term}</span>
        </div>
      {/each}
    {/if}
    <div class="mock-card-animation animate up {state.showAnimation ? 'visible' : 'hidden'}" />
    <NToolbarGrid>
      <div slot="left" className="truncate" style="min-width:100px;">
        {#if $Interact.stats.terms.length == 1}
          <button class="btn btn-clear tap-icon clickable" on:click={close}>
            <NIcon name="close" />
          </button>
        {:else}
          <button class="btn btn-clear tap-icon clickable pl-1" on:click={back}>
            <NIcon name="arrowBack" size="28" />
            <small class="text-sm text-inverse-2 ml-1 truncate" style="max-width:60px;">
              {$Interact.stats.terms[$Interact.stats.terms.length - 2]}
            </small>
          </button>
        {/if}
      </div>

      <h1 class="title truncate" slot="main">{state.currentTerm}</h1>

      <div slot="right" style="min-width:100px" class="toolbar-buttons align-right">
        <button class="btn btn-clear tap-icon clickable" on:click={onMoreTap}>
          <NIcon name="more" />
        </button>
      </div>
    </NToolbarGrid>
    <div class="n-row pb-2 px-2">
      <NButtonGroup size="sm" buttons={timeViewButtons} />
    </div>

    <div class="n-toolbar n-row px-3 pt-2 pb-3">
      <Text size="sm" bold className="filler" truncate>{state.range}</Text>

      <NextPrevCal on:next={loadNextDate} on:previous={loadPreviousDate} on:calendar={onCalendarTap} />

      <!-- <Button color="circle" className="tap-icon" delay={0} on:click={loadPreviousDate}>
        <NIcon name="chevronLeft" size={24} />
      </Button>
      <Button color="none" shape="circle" delay={0} className="tap-icon" on:click={onCalendarTap}>
        <NIcon name="calendar" size={24} className={isToday ? '' : 'fill-red'} />
      </Button>
      <Button color="none" shape="circle" delay={0} className="tap-icon" on:click={loadNextDate}>
        <NIcon name="chevronRight" size={24} />
      </Button>

      <Button color="clear" className="px-1" on:click={loadPreviousDate}>
        <NIcon name="chevronLeft" className="fill-primary-bright" />
      </Button>
      <Button color="clear" className="px-1" on:click={onCalendarTap}>
        <NIcon name="calendar" className="fill-primary-bright" />
      </Button>
      <Button color="clear" className="px-1" on:click={loadNextDate}>
        <NIcon name="chevronRight" className="fill-primary-bright" />
      </Button> -->
    </div>

    {#if state.loading}
      <div class="container n-panel center-all" style="height:140px;">
        <div>
          <NSpinner size={46} />
        </div>
      </div>
    {/if}

    {#if state.stats && !state.loading}
      <div class="main-chart px-2 pb-1">
        <NBarChart
          height={140}
          color={state.currentColor}
          labels={state.stats.chart.values.map((point) => point.x)}
          points={state.stats.chart.values}
          on:swipeLeft={loadNextDate}
          on:swipeRight={loadPreviousDate}
          on:more={(evt) => {
            Interact.onThisDay(evt.detail.date.toDate());
          }}
          xFormat={(x, index) => {
            return x;
          }}
          yFormat={(y) => {
            return state.tracker.displayValue(y);
          }}
          on:tap={(event) => {
            setSelected(event.detail);
          }}
          activeIndex={state.selected.index} />
      </div>
    {/if}

  </header>

  <div slot="footer" class="w-100">
    <NButtonGroup inverse color={state.currentColor} buttons={state.viewOption} />
  </div>

  {#if !state.loading}
    {#if state.dataView == 'compare'}
      <StatsCompare
        {remember}
        fromDate={getFromDate()}
        toDate={getToDate()}
        timeSpan={state.timeSpan}
        stats={state.stats}
        selected={state.selected}
        on:dateSelected={(evt) => {
          setSelected(evt.detail);
        }} />
    {/if}
    {#if state.dataView == 'map'}
      <NMap small locations={getLocations()} className="flex-grow flex-shrink" />
    {/if}
    {#if state.stats}
      {#if state.dataView == 'overview'}
        <StatsOverview stats={state.stats} />
        <!-- end over view -->
      {:else if state.dataView == 'time'}
        <StatsTime color={state.currentColor} term={state.currentTerm} stats={state.stats} />
      {:else if state.dataView == 'logs'}
        {#if state.timeSpan == 'y'}
          <div class="p-4 text-sm text-center text-inverse-2">Logs not yet available for a full year</div>
        {:else}
          {#if state.selected.rows}
            <NToolbar className="text-center mt-2">
              <div class="filler" />
              <NButtonGroup buttons={logViewButtons} />
              <button class="btn btn-badge btn-xs clickable ml-2" on:click={clearSelected}>
                {state.selected.point.x}
                <NIcon name="close" size="22" />
              </button>
              <div class="filler" />
            </NToolbar>
          {/if}

          <NLogList
            compact
            limit={30}
            on:textClick={(evt) => {
              if (evt.detail.type == 'tracker') {
                Interact.openStats(`#${evt.detail.id}`);
              } else {
                Interact.openStats(`${evt.detail.raw}`);
              }
            }}
            on:trackerClick={(evt) => {
              Interact.openStats(`#${evt.detail.tag}`);
            }}
            logs={state.selected.rows || state.stats.rows}
            style="min-height:100%"
            className="bg-solid-1 flex-grow flex-shrink" />
        {/if}
      {/if}
    {/if}
  {/if}
</NModal>
