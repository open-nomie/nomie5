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

  import { strToColor } from "../../components/dymoji/dymoji";

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
  import NIcon from "../../components/icon/icon.svelte";

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

  class CompareModel {
    constructor(starter = {}) {
      this.type = starter.type;
      this.key = starter.key;
      this.base = starter.base;
      this.label = starter.label;
      this.stats = null;
    }

    getTracker() {
      // We have to force everything to kinda a tracker
      if (this.type == "tracker") {
        return this.base;
      } else {
        return new Tracker({
          math: "sum",
          tag: this.key,
          color: strToColor(this.key)
        });
      }
    }

    async getStats() {
      let searchTerm = getSearchTerm(this.type, this.key);
      let payload = {
        search: searchTerm,
        start: getFromDate(),
        end: getToDate()
      };

      let results = await LedgerStore.query(payload);
      const statsV5 = new StatsV5({ is24Hour: $UserStore.meta.is24Hour });
      this.stats = statsV5.generate({
        rows: results,
        fromDate: getFromDate(),
        toDate: getToDate(),
        mode: state.timeSpan,
        tracker: this.getTracker()
      });

      //

      return this.stats;
    }
  }

  const state = {
    date: dayjs(),
    timeSpan: "w",
    dataView: "overview",
    timeOption: [],
    viewOption: [],
    loading: true,
    stats: null,
    compare: []
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
    let title = getSearchTerm(
      $Interact.stats.activeType,
      $Interact.stats.activeTag
    );
    return title;
  }

  function getFromDate() {
    let timespan = getTimeSpan();
    return getToDate().subtract(1, timespan.unit);
  }

  function getToDate() {
    return dayjs(state.date);
  }

  function removeCompare(compare) {
    state.compare = state.compare.filter(row => {
      return row != compare;
    });
  }

  function getQueryTerm() {
    if (types.hasOwnProperty($Interact.stats.activeType)) {
      return `${types[$Interact.stats.activeType].prefix}${$Interact.stats.activeTag}`;
    } else {
      return $Interact.stats.activeTag;
    }
  }

  async function compareTracker() {
    let item = await Interact.select("tracker");
    if (item) {
      let compareObj = new CompareModel({
        type: "tracker",
        key: item.tag,
        label: item.label,
        base: item
      });
      await compareObj.getStats();
      state.compare.push(compareObj);
    }
    state.compare = state.compare;
  }

  async function comparePerson() {
    let item = await Interact.select("person");
    if (item) {
      let compareObj = new CompareModel({
        type: "person",
        key: item.username,
        label: item.displayName,
        base: item
      });
      await compareObj.getStats();
      state.compare.push(compareObj);
    }
    state.compare = state.compare;
  }

  async function compareContext() {
    let item = await Interact.select("context");
    if (item) {
      let compareObj = new CompareModel({
        type: "context",
        key: item,
        label: item,
        base: item
      });
      await compareObj.getStats();
      state.compare.push(compareObj);
    }
    state.compare = state.compare;
  }

  async function compareSearchTerm() {
    let item = await Interact.prompt("Term");
    if (item) {
      let compareObj = new CompareModel({
        type: "search",
        key: item,
        label: item,
        base: item
      });
      await compareObj.getStats();
      state.compare.push(compareObj);
    }
    state.compare = state.compare;
  }

  async function compareType() {
    let types = ["Tracker", "Person", "Context", "Search Term"];
    Interact.popmenu({
      buttons: types.map(type => {
        return {
          title: `${type}...`,
          click() {
            switch (type) {
              case "Tracker":
                compareTracker();
                break;
              case "Person":
                comparePerson();
                break;
              case "Context":
                compareContext();
                break;
              case "Search Term":
                compareSearchTerm();
                break;
            }
          }
        };
      })
    });
  }

  function onMoreTap() {
    let buttons = [];
    const compare = {
      title: "Compare to...",
      click() {
        compareType();
      }
    };
    const startOfMonth = {
      title: "Start of month",
      click: () => {
        changeDate(state.date.startOf("month"));
      }
    };
    const startOfYear = {
      title: "Start of year",
      click: () => {
        changeDate(state.date.startOf("year"));
      }
    };
    const startOfWeek = {
      title: "Start of week",
      click: () => {
        changeDate(state.date.startOf("week"));
      }
    };
    buttons.push(compare);
    if (state.timeSpan == "m") {
      buttons.push(startOfMonth);
    } else if (state.timeSpan == "y") {
      buttons.push(startOfYear);
    } else if (state.timeSpan == "w") {
      buttons.push(startOfWeek);
    }

    if (["d", "w", "m"].indexOf(state.timeSpan) > -1) {
    }
    Interact.popmenu({ title: "Stat Options", buttons });
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
    const statsV5 = new StatsV5({ is24Hour: $UserStore.meta.is24Hour });
    state.stats = statsV5.generate({
      rows: results,
      fromDate: getFromDate(),
      toDate: getToDate(),
      mode: state.timeSpan,
      tracker: getTracker()
    });

    for (let i = 0; i < state.compare.length; i++) {
      await state.compare[i].getStats();
    }

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

<style lang="scss">
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
  .compare-chart {
    position: relative;
    .btn-close {
      position: absolute;
      top: -6px;
      right: 0px;
    }
  }
</style>

<NModal className="stats-modal" bodyClass="bg-solid-1" fullscreen>
  <header slot="raw-header" class="box-shadow-float">
    <NToolbarGrid>
      <button class="btn btn-clear tap-icon" on:click={close} slot="left">
        <NIcon name="close" />
      </button>
      <h1 class="title" slot="main">{getTitle()}</h1>
      <button class="btn btn-clear tap-icon" slot="right" on:click={onMoreTap}>
        <NIcon name="more" />
      </button>
    </NToolbarGrid>
    <div class="n-row pb-2 px-2">
      <NButtonGroup size="sm" buttons={state.timeOption} />
    </div>

    <NToolbarGrid>
      <button
        class="btn btn-clear text-primary-bright"
        slot="left"
        on:click={loadPreviousDate}>
        <NIcon name="chevronLeft" className="fill-primary-bright" />
        Prev
      </button>
      <div class="time-range" slot="main">{state.range}</div>
      <button
        class="btn btn-clear text-primary-bright"
        slot="right"
        on:click={loadNextDate}>
        Next
        <NIcon name="chevronRight" className="fill-primary-bright" />
      </button>
    </NToolbarGrid>

    {#if state.stats && !state.loading}
      <div class="main-chart px-2 pb-1">
        <NBarChart
          height={110}
          color={getTracker().color}
          labels={state.stats.chart.values.map(point => point.x)}
          points={state.stats.chart.values}
          on:swipeLeft={loadNextDate}
          on:swipeRight={loadPreviousDate}
          xFormat={(x, index) => {
            return x;
          }}
          yFormat={y => {
            return getTracker().displayValue(y);
          }}
          on:tap={event => {
            let newDate;
            state.date = dayjs(event.detail.point.date);
          }}
          activeIndex={0} />
      </div>
      {#each state.compare as compare}
        <div class="compare-chart px-2 py-1">
          <NBarChart
            height={90}
            title={getSearchTerm(compare.type, compare.label)}
            color={compare.getTracker().color}
            labels={compare.stats.chart.values.map(point => point.x)}
            points={compare.stats.chart.values}
            on:swipeLeft={loadNextDate}
            on:swipeRight={loadPreviousDate}
            xFormat={(x, index) => {
              return x;
            }}
            yFormat={y => {
              return compare.getTracker().displayValue(y);
            }}
            activeIndex={0} />
          <button
            class="btn btn-clear btn-close"
            on:click={() => {
              removeCompare(compare);
            }}>
            <NIcon name="closeFilled" size="16" />
          </button>
        </div>
      {/each}
    {/if}

  </header>

  <div slot="footer" class="w-100">
    <NButtonGroup
      inverse
      color={getTracker().color}
      buttons={state.viewOption} />
  </div>

  {#if state.loading}
    <div class="container n-panel center-all">
      <div style="margin-top:-50px;">
        <NSpinner size={46} />
      </div>
    </div>
  {:else}
    {#if state.dataView == 'map'}
      <NMap
        small
        locations={getLocations()}
        className="flex-grow flex-shrink" />
    {/if}
    {#if state.stats}
      {#if state.dataView == 'overview'}
        <div class="overview py-2 flex-grow flex-shrink">
          {#if state.stats.math == 'sum'}
            <NItem className="bg-transparent">
              <NKVBlock
                inverse
                label="Total"
                value={formatValue(state.stats.sum)}
                type="row" />
            </NItem>
          {/if}
          <NItem className="py-0 bg-transparent">
            <NKVBlock
              inverse
              label="Avg"
              value={formatValue(state.stats.avg)}
              type="row" />
          </NItem>
          {#if state.stats.max.value > state.stats.min.value}
            <NItem className="bg-transparent">
              <NKVBlock
                inverse
                label="Range"
                value=""
                className="filler"
                type="row">
                <div slot="value">
                  {formatValue(state.stats.min.value, false)}
                  <span class="text-faded-2 font-weight-normal">to</span>
                  {formatValue(state.stats.max.value)}
                </div>
              </NKVBlock>
            </NItem>
            <!-- <NItem>
                <NKVBlock
                  label="Variance"
                  className="filler"
                  value={`${formatValue(state.stats.max.value - state.stats.min.value)}`}
                  type="row" />
              </NItem> -->
          {/if}
          <NItem className="bg-transparent">
            <NKVBlock
              inverse
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
          hideMore
          logs={state.stats.rows}
          style="min-height:100%"
          className="bg-solid-1 p-2 flex-grow flex-shrink" />
      {/if}
    {/if}
  {/if}
</NModal>
