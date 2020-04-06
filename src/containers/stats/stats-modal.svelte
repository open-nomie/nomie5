<script>
  //Vendors
  import { onMount } from "svelte";
  import { navigate, Router, Route } from "svelte-routing";
  import dayjs from "dayjs";

  // Modules
  import Tracker from "../../modules/tracker/tracker";
  import NLog from "../../modules/nomie-log/nomie-log";
  import StatsProcessor from "../../modules/stats/stats";
  import StatsV5 from "../../modules/stats/statsV5";

  // Utils
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import math from "../../utils/math/math";

  // Components
  import NModal from "../../components/modal/modal.svelte";
  import NButtonGroup from "../../components/button-group/button-group.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NSpinner from "../../components/spinner/spinner.svelte";
  import NKVBlock from "../../components/kv-block/kv-block.svelte";
  import NBarChart from "../../components/charts/bar-chart.svelte";
  import NLogList from "../../components/log-list/log-list.svelte";
  import NTimeGrid from "../../components/day-time-grid/day-time-grid.svelte";

  // Containers
  import NMap from "../../containers/map/map.svelte";

  // Stores
  import { LedgerStore } from "../../store/ledger";
  import { Interact } from "../../store/interact";
  import { UserStore } from "../../store/user";
  import { NomieAPI } from "../../store/napi";
  import { TrackerStore } from "../../store/trackers";

  const timeSpans = {
    d: { id: "d", label: "D", title: "Day", unit: "day" },
    w: { id: "w", label: "W", title: "Week", unit: "week" },
    m: { id: "m", label: "M", title: "Month", unit: "month" },
    y: { id: "y", label: "Y", title: "Year", unit: "year" }
  };

  const dataViews = {
    overview: { id: "overview", label: "Overview" },
    map: { id: "map", label: "Map" },
    time: { id: "time", label: "Time" },
    logs: { id: "logs", label: "Logs", excludeFrom: ["y"] }
  };

  const types = {
    tracker: { prefix: "#" },
    person: { prefix: "@" },
    context: { prefix: "+" },
    location: { prefix: "" }
  };

  const state = {
    date: dayjs(),
    timeSpan: "w",
    dataView: "overview",
    timeOption: [],
    viewOption: [],
    loading: true,
    stats: null
  };

  function setTimeView(option) {
    state.timeSpan = option.id;
  }

  function setView(option) {
    state.dataView = option.id;
  }

  function getTimeSpan() {
    return timeSpans[state.timeSpan];
  }

  function getTimeViewButtons() {
    return Object.keys(timeSpans).map(optionId => {
      let option = timeSpans[optionId];
      return {
        label: option.label,
        active: state.timeSpan === optionId,
        click: () => {
          setTimeView(option);
        }
      };
    });
  }

  function getScore() {
    let scores = [];
    state.stats.rows.forEach(row => {
      let score = row.score || row.calculateScore();
      scores.push(score);
    });
    let score = math.sum(scores);
    let final = 0;

    if (score > 0) {
      return `${score} 😄`;
    } else if (score < 0) {
      return `${score} 😞`;
    } else {
      return `0 😐`;
    }
  }

  function getDataViewButtons() {
    return Object.keys(dataViews)
      .map(optionId => {
        let option = dataViews[optionId];
        if ((option.excludeFrom || []).indexOf(state.timeSpan) == -1) {
          return {
            label: option.label,
            active: state.dataView === optionId,
            click: () => {
              setView(option);
            }
          };
        } else {
          return null;
        }
      })
      .filter(row => row);
  }

  function close() {
    Interact.closeStats();
  }

  function getTitle() {
    let title = "Stats";
    switch ($Interact.stats.activeType) {
      case "tracker":
        title = `#${$Interact.stats.activeTag}`;
        break;
      case "person":
        title = `@${$Interact.stats.activeTag}`;
        break;
      case "context":
        title = `+${$Interact.stats.activeTag}`;
        break;
      case "location":
        title = `Location`;
        break;
    }
    return title;
  }

  function getFromDate() {
    let timespan = getTimeSpan();
    return getToDate().subtract(1, timespan.unit);
  }

  function getToDate() {
    return dayjs(state.date);
  }

  function getQueryTerm() {
    if (types.hasOwnProperty($Interact.stats.activeType)) {
      return `${types[$Interact.stats.activeType].prefix}${$Interact.stats.activeTag}`;
    } else {
      return $Interact.stats.activeTag;
    }
  }

  function onMoreTap() {
    let buttons = [];
    const startOfMonth = {
      title: "Go to start of month",
      click: () => {
        changeDate(state.date.startOf("month"));
      }
    };
    const startOfYear = {
      title: "Go to start of year",
      click: () => {
        changeDate(state.date.startOf("year"));
        state.date = state.date.startOf("year");
      }
    };
    buttons.push(startOfMonth);
    buttons.push(startOfYear);
    if (["d", "w", "m"].indexOf(state.timeSpan) > -1) {
    }
    Interact.popmenu({ title: "More", buttons });
  }

  function getTracker() {
    if ($Interact.stats.activeType == "tracker") {
      return TrackerStore.getByTag($Interact.stats.activeTag);
    } else {
      return new Tracker({
        tag: $Interact.stats.activeTag,
        math: "sum",
        type: $Interact.stats.activeType
      });
    }
  }

  async function getStats() {
    state.loading = true;
    let payload = {
      search: getQueryTerm(),
      start: getFromDate(),
      end: getToDate()
    };
    let results = await LedgerStore.query(payload);
    const statsV5 = new StatsV5();

    state.stats = statsV5.generate({
      rows: results,
      fromDate: getFromDate(),
      toDate: getToDate(),
      mode: state.timeSpan,
      tracker: getTracker()
    });

    console.log("These Stats", state.stats);

    state.loading = false;
  }

  function getDayRange() {
    return state.date.format("ddd MMM D, YYYY");
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
      return `${from.format("MMM D")} - ${to.format("MMM D YYYY")}`;
    } else {
      return `${from.format("MMM D")} - ${to.format("D YYYY")}`;
    }
  }

  function getCalendarData() {
    let rows = state.stats.rows
      .filter(row => {
        return new Date(row.end).getMonth() == state.date.toDate().getMonth();
      })
      .map(row => {
        row.start = new Date(row.start);
        row.end = new Date(row.end);
        row.repeat = "never";
        return row;
      });
    return rows;
  }

  function getLocations() {
    return state.stats.rows
      .map(row => {
        if (row.lat) {
          return {
            lat: row.lat,
            lng: row.lng,
            name: row.location
          };
        } else {
          return null;
        }
      })
      .filter(row => row);
  }

  function formatValue(value, includeUnit) {
    let tracker = getTracker();
    return tracker.displayValue(value, includeUnit);
  }

  function getMonthRange() {
    const from = getFromDate();
    const to = getToDate();
    return `${from.format("MMM D")} - ${to.format("MMM D YYYY")}`;
  }

  function getTimeGridRows() {}

  function getYearRange() {
    const from = getFromDate();
    const to = getToDate();
    return `${from.format("MMM D YYYY")} - ${to.format("MMM D YYYY")}`;
  }

  function getDateRangeText() {
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
      case "y":
        range = getYearRange();
        break;
    }
    return range;
  }

  async function main() {
    state.range = getDateRangeText();
    state.timeOption = getTimeViewButtons();
    state.viewOption = getDataViewButtons();
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

  let lastDataView = state.dataView;
  $: if (state.dataView && state.dataView != lastDataView) {
    lastDataView = state.dataView;
    state.viewOption = getDataViewButtons();
  }

  $: timeFormat = $UserStore.meta.is24Hour ? "HH:mm" : "h:mm a";
  $: dateFormat = $UserStore.meta.is24Hour ? "DD/MM/YYYY" : "MMM Do YYYY";
</script>

<style>
  .n-list {
    max-width: 100vw;
    overflow: hidden;
  }
  .time-range {
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
    line-height: 1rem;
  }
</style>

<NModal className="stats-modal" fullscreen>
  <header slot="raw-header" class="box-shadow-float">
    <NToolbarGrid>
      <button
        class="btn btn-clear zmdi zmdi-close"
        on:click={close}
        slot="left" />
      <h1 class="title" slot="main">{getTitle()}</h1>
      <button
        class="btn btn-clear zmdi zmdi-more"
        slot="right"
        on:click={onMoreTap} />
    </NToolbarGrid>
    <div class="n-row pb-2 px-2">
      <NButtonGroup size="sm" buttons={state.timeOption} />
    </div>

    <NToolbarGrid>
      <button class="btn btn-clear" slot="left" on:click={loadPreviousDate}>
        <i class="zmdi zmdi-chevron-left" />
      </button>
      <div class="time-range" slot="main">{state.range}</div>
      <button class="btn btn-clear" slot="right" on:click={loadNextDate}>
        <i class="zmdi zmdi-chevron-right" />
      </button>
    </NToolbarGrid>

    {#if state.stats && !state.loading}
      <NBarChart
        height={120}
        color={getTracker().color}
        labels={state.stats.chart.values.map(point => point.x)}
        points={state.stats.chart.values}
        on:tap={event => {
          let newDate;
          state.date = dayjs(event.detail.point.date);
          console.log('Tapped Date');
        }}
        activeIndex={0} />
    {/if}
  </header>

  <div slot="footer" class="w-100">
    <NButtonGroup buttons={state.viewOption} />
  </div>

  {#if state.loading}
    <div class="container n-panel center-all">
      <div style="margin-top:-50px;">
        <NSpinner size={46} />
      </div>
    </div>
  {:else}
    <div class="container d-flex" style="min-height:100%">
      {#if state.stats}
        {#if state.dataView == 'overview'}
          <div class="overview py-2 flex-grow flex-shrink">
            {#if state.stats.math == 'sum'}
              <NItem>
                <NKVBlock
                  label="Total"
                  value={formatValue(state.stats.sum)}
                  type="row" />
              </NItem>
            {/if}
            <NItem className="py-0">
              <NKVBlock
                label="Avg"
                value={formatValue(state.stats.avg)}
                type="row" />
            </NItem>
            {#if state.stats.max.value > state.stats.min.value}
              <NItem>
                <NKVBlock
                  label="Range"
                  className="filler"
                  value={`${formatValue(state.stats.min.value, false)} to ${formatValue(state.stats.max.value)}`}
                  type="row" />
              </NItem>
              <!-- <NItem>
                <NKVBlock
                  label="Variance"
                  className="filler"
                  value={`${formatValue(state.stats.max.value - state.stats.min.value)}`}
                  type="row" />
              </NItem> -->
            {/if}
            <NItem>
              <NKVBlock
                label="Score"
                className="filler"
                value={getScore()}
                type="row" />
            </NItem>
          </div>
        {:else if state.dataView == 'time'}
          <NTimeGrid
            color={getTracker().color}
            rows={state.stats.rows}
            className="flex-grow flex-shrink"
            style="min-height:100%" />
        {:else if state.dataView == 'logs'}
          <NLogList
            compact
            logs={state.stats.rows}
            style="min-height:100%"
            className="bg-solid-1 p-2 flex-grow flex-shrink" />
        {:else if state.dataView == 'map'}
          <NMap
            small
            locations={getLocations()}
            className="flex-grow flex-shrink"
            style=" min-height:100%; height:100%" />
        {/if}
      {/if}
    </div>
  {/if}
</NModal>
