<script>
  /**
   * Stats Route
   * This is stupid big... still needs to be organized
   * SERIOUSLY BIG
   */

  //Vendors
  import { onMount } from "svelte";
  import { navigate, Router, Route } from "svelte-routing";
  import dayjs from "dayjs";

  // Utils
  import math from "../utils/math/math";
  import NomieUOM from "../utils/nomie-uom/nomie-uom";
  import Logger from "../utils/log/log";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  import CalendarMap from "../utils/calendar-map/calendar-map";
  import Storage from "../modules/storage/storage";
  import StatsProcessor from "../modules/stats/stats";

  // Components
  import NText from "../components/text/text.svelte";
  import NCell from "../components/cell/cell.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import BarChart from "../components/charts/bar-chart.svelte";
  import Tabs from "../components/board-tabs/board-tabs.svelte";
  import NPopcard from "../components/popcard/popcard.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NLogItem from "../components/list-item-log/list-item-log.svelte";
  import NTimeGrid from "../components/day-time-grid/day-time-grid.svelte";
  import KVBlock from "../components/kv-block/kv-block.svelte";

  // containers
  import NPage from "../containers/layout/page.svelte";
  import NMap from "../containers/map/map.svelte";
  import NCalendar from "../containers/calendar/sweet.svelte";

  //store
  import { BoardStore } from "../store/boards";
  import { UserStore } from "../store/user";
  import { TrackerStore } from "../store/trackers";
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { HistoryPage } from "../store/history-page";

  const console = new Logger("📊 Stats.svelte");
  const path = window.location.href.split("/");
  const mainTag = path[path.length - 1];

  // Local
  let refreshing = false;
  let rows = [];

  let state = {
    date: dayjs(), // default to today - use dayjs object
    tracker: $TrackerStore[mainTag] || new Tracker({ tag: mainTag }),
    initalized: false,
    tracker: null,
    year: {
      mode: "chart"
    },
    month: {
      mode: "chart"
    },
    day: {
      mode: "list"
    },
    overview: {
      mode: "time"
    },
    stats: null,
    // Holder of the comparable tracker
    // Current hack - tap the emoji in the title
    compare: {
      tracker: null,
      stats: null
    }
  };

  $: if (Object.keys($TrackerStore).length) {
    state.tracker = $TrackerStore[mainTag] || new Tracker({ tag: mainTag });
  }

  const methods = {
    getStats() {},
    showHistory() {
      navigate("/history");
      setTimeout(() => {
        $HistoryPage.date = state.date;
      }, 10);
    },
    getDayLogs() {
      return new Promise((resolve, reject) => {
        LedgerStore.query({
          start: state.date.startOf("day").toDate(),
          end: state.date.endOf("day").toDate()
        }).then(logs => {
          logs = logs.map(log => {
            log.expanded();
            return log;
          });
          resolve(logs);
        });
      });
    },
    load() {
      let tracker = $TrackerStore[mainTag] || new Tracker({ tag: mainTag });
      refreshing = true;
      methods.getStats(tracker).then(res => {
        rows = res.rows;
        state.stats = res.stats;

        if (state.compare.tracker) {
          methods.getStats(state.compare.tracker).then(compareRes => {
            state.compare.stats = compareRes.stats;
            state.compare.rows = compareRes.rows;
          });
        }

        refreshing = false;
      });
      // Get Logs for the year and tag
    },
    getStats(tracker) {
      return LedgerStore.search(
        `#${tracker.tag}`,
        state.date.format("YYYY")
      ).then(resRows => {
        // Expand Logs
        resRows = resRows.map(log => {
          log.expanded();
          return log;
        });
        // Initialize the Stats OverView
        let stats = new StatsProcessor(
          resRows,
          tracker,
          state.date,
          "getStats(" + tracker.tag + ")"
        );
        return {
          stats,
          rows: resRows
        };
      });
    },
    previous() {
      state.date = state.date.subtract(1, "year");
      methods.load();
    },
    next() {
      state.date = state.date.add(1, "year");
      methods.load();
    },
    setMode(unit, mode) {
      switch (unit) {
        case "day":
          state.day.mode = mode;
          break;
        case "month":
          state.month.mode = mode;
          break;
        case "year":
          state.year.mode = mode;
          break;
      }
    },
    compare() {
      Interact.selectTracker().then(tracker => {
        state.compare.tracker = tracker;
        methods.getStats(state.compare.tracker).then(compareRes => {
          state.compare.stats = compareRes.stats;
          state.compare.rows = compareRes.rows;
        });
      });
    },
    removeCompare() {
      state.compare.stats = null;
      state.compare.tracker = null;
      state.compare.rows = null;
    },
    previousMonth() {
      let thisYear = state.date.year();
      state.date = state.date.subtract(1, "month");
      if (state.date.year() !== thisYear) {
        methods.load();
      } else {
        methods.refresh();
      }
    },
    nextMonth() {
      let thisYear = state.date.year();
      state.date = state.date.add(1, "month");
      if (state.date.year() !== thisYear) {
        methods.load();
      } else {
        methods.refresh();
      }
    },
    previousDay() {
      let thisYear = state.date.year();
      state.date = state.date.subtract(1, "day");
      if (state.date.year() !== thisYear) {
        methods.load();
      } else {
        methods.refresh();
      }
    },
    nextDay() {
      let thisYear = state.date.year();
      state.date = state.date.add(1, "day");
      if (state.date.year() !== thisYear) {
        methods.load();
      } else {
        methods.refresh();
      }
    },

    refresh() {
      state.stats.gotoDate(state.date);
      if (state.compare.stats) {
        state.compare.stats.gotoDate(state.date);
      }
      refreshing = true;
      setTimeout(() => {
        refreshing = false;
      }, 1);
    },
    show(date) {
      state.date = date;
      this.refresh();
    },
    getValueMap(rows) {
      let valueMap = {};
      rows.forEach(row => {
        let dayKey = dayjs(row.end).format("YYYY-MM-DD");
        valueMap[dayKey] = valueMap[dayKey] || [];
        if (row.trackers[state.tracker.tag]) {
          valueMap[dayKey].push(row.trackers[state.tracker.tag].value);
        }
      });
      return valueMap;
    },
    /**
     * Get Chart Data - IMPORTANT and Sloppy
     * TODO: Needs to be refactored and cleaned up
     */
    aboveOrBelow(ths, tht) {
      return new Promise((resolve, reject) => {
        resolve({
          direction: ths > tht ? "above" : ths === tht ? "same" : "below",
          amount: math.round(100 - math.percentage(ths, tht))
        });
      });
    },
    getCalendarData(mode) {
      let rows = state.stats.getRows(mode).map(row => {
        row.start = new Date(row.start);
        row.end = new Date(row.end);
        row.repeat = "never";
        return row;
      });
      return rows;
    },
    getLocationSummary(type) {
      type = type || "year";
      let locations = {};
      state.stats.getRows(type).forEach(row => {
        if (row.lat) {
          let key = `${math.round(row.lat, 1000)},${math.round(row.lng, 1000)}`;
          locations[key] = locations[key] || { lat: row.lat, lng: row.lng };
        }
      });
      return Object.keys(locations).map(key => {
        return locations[key];
      });
    }
  };

  onMount(() => {
    methods.load();
  });
</script>

<style lang="scss">
  .data-blocks {
    display: flex;
    justify-content: space-between;
    align-items: space-evenly;
    flex-wrap: wrap;
  }
  .border-bottom {
    border-bottom: solid 1px var(--color-faded-1) !important;
  }

  .sticky-header {
    background: var(--color-bg);
    position: -webkit-sticky;
    position: sticky;
    top: 50px;
    z-index: 3000;
  }

  .subheader {
    background: var(--color-bg) !important;
  }

  .popcards {
    position: relative;
    min-height: 1200px;
    margin-right: 10px;
    margin-left: 10px;
    width: calc(100% - 20px);
    &:after {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 5px;
      content: ":)";
      text-align: center;
      color: var(--color-faded-2);
    }
  }
</style>

{#if state.stats !== null && state.tracker}
  <NPage className="stats">

    <div slot="header" class="n-row">
      <button
        class="btn btn-clear btn-icon zmdi zmdi-close"
        on:click={() => {
          window.history.back();
        }} />
      <h1 class="truncate" on:click={methods.compare}>
        {state.tracker.emoji} {state.tracker.label}
        {#if state.compare.tracker}
          <span class="">vs</span>
          {state.compare.tracker.emoji}
        {/if}
      </h1>
      <button
        class="btn btn-clear btn-icon zmdi zmdi-edit"
        on:click={() => {
          Interact.editTracker(state.tracker).then(() => {});
        }} />
    </div>

    <div slot="sub-header" class="n-row n-year-bar">
      <button class="btn btn-clear" on:click={methods.previous}>
        <i class="zmdi zmdi-chevron-left font-140 mr-2" />
        {state.date.subtract(1, 'year').format('YYYY')}
      </button>
      <h1 class="n-title filler text-center">{state.date.format('YYYY')}</h1>
      <button class="btn btn-clear" on:click={methods.next}>
        {state.date.add(1, 'year').format('YYYY')}
        <i class="zmdi zmdi-chevron-right font-140 ml-2" />
      </button>
    </div>

    <div class="pt-3 popcards">

      {#if state.compare.tracker}
        <div class="text-center p2 pt-1">
          <button class="btn btn-light btn-sm" on:click={methods.removeCompare}>
            Remove {state.compare.tracker.emoji} {state.compare.tracker.label}
          </button>
        </div>
      {/if}

      <!-- Year Card -->

      <NPopcard level={10} arrow={true}>
        <div class="n-row data-blocks py-2 px-3 border-bottom">
          {#if state.tracker.math === 'sum'}
            <KVBlock
              label="Total"
              value={NomieUOM.format(math.round(state.stats.results.year.sum, 1000), state.tracker.uom)} />
          {:else}
            <KVBlock
              label="Year Avg"
              value={NomieUOM.format(math.round(state.stats.results.year.avg, 1000), state.tracker.uom)} />
          {/if}
          {#if state.stats.results.year.max}
            <KVBlock
              onClick={() => {
                methods.show(state.stats.results.year.max.date);
              }}
              label="Max {(state.stats.results.year.max.date || dayjs()).format('MMM D')}"
              value={NomieUOM.format(math.round(state.stats.results.year.max.value, 10), state.tracker.uom)} />
          {/if}
          <!-- <KVBlock
            label="Month Avg"
            value={NomieUOM.format(math.round(state.stats.results.year.avg, 10), state.tracker.uom)} /> -->
        </div>
        <!-- Compare If Needed-->
        {#if state.compare.stats}
          <div class="n-row data-blocks py-2 px-3 border-bottom">
            {#if state.compare.tracker.math === 'sum'}
              <KVBlock
                label="{state.compare.tracker.emoji} Total"
                value={NomieUOM.format(math.round(state.compare.stats.results.year.sum, 1000), state.compare.tracker.uom)} />
            {:else}
              <KVBlock
                label="{state.compare.tracker.emoji} Year Avg"
                value={NomieUOM.format(math.round(state.compare.stats.results.year.avg, 1000), state.compare.tracker.uom)} />
            {/if}
            {#if state.compare.stats.results.year.max}
              <KVBlock
                onClick={() => {
                  methods.show(state.compare.stats.results.year.max.date);
                }}
                label="{state.compare.tracker.emoji} Max {(state.compare.stats.results.year.max.date || dayjs()).format('MMM D')}"
                value={NomieUOM.format(math.round(state.compare.stats.results.year.max.value, 10), state.compare.tracker.uom)} />
            {/if}
            <KVBlock
              label="{state.compare.tracker.emoji} Month Avg"
              value={NomieUOM.format(math.round(state.compare.stats.results.year.avg, 10), state.compare.tracker.uom)} />
          </div>
        {/if}
        <!-- Year Display Options-->
        <div class="n-row p-3">
          <div class="btn-group flex-grow">
            <button
              class="btn btn-sm btn-white-pop {state.year.mode === 'chart' ? ' active' : ' inactive'}"
              on:click={() => {
                methods.setMode('year', 'chart');
              }}>
              Chart
            </button>
            <button
              class="btn btn-sm btn-white-pop {state.year.mode === 'map' ? ' active' : ' inactive'}"
              on:click={() => {
                methods.setMode('year', 'map');
              }}>
              Where
            </button>
            <button
              class="btn btn-sm btn-white-pop {state.year.mode === 'grid' ? ' active' : ' inactive'}"
              on:click={() => {
                methods.setMode('year', 'grid');
              }}>
              When
            </button>
          </div>
        </div>

        <div class="p-2">
          {#if state.year.mode == 'chart'}
            <BarChart
              height={140}
              color={state.tracker.color}
              labels={state.stats.results.year.chart.labels}
              points={state.stats.results.year.chart.points}
              on:tap={event => {
                state.date = state.date.set('month', event.detail.index);
                methods.refresh();
              }}
              xFormat={x => {
                return dayjs(x).format('MMM');
              }}
              yFormat={y => {
                return NomieUOM.format(y, state.tracker.uom);
              }}
              activeIndex={state.date.month() + 1} />
            {#if state.compare.stats}
              <BarChart
                height={100}
                color={state.compare.tracker.color}
                labels={state.compare.stats.results.year.chart.labels}
                points={state.compare.stats.results.year.chart.points}
                on:tap={event => {
                  state.date = state.date.set('month', event.detail.index);
                  methods.refresh();
                }}
                xFormat={x => {
                  return dayjs(x).format('MMM');
                }}
                yFormat={y => {
                  return NomieUOM.format(y, state.compare.tracker.uom);
                }}
                activeIndex={state.date.month() + 1} />
            {/if}
          {/if}
          {#if state.year.mode == 'grid'}
            <div class="grid-holder px-3 pb-3">
              <NTimeGrid color={state.tracker.color} {rows} />
            </div>
            {#if state.compare.stats}
              <div class="grid-holder px-3 pb-3">
                <NTimeGrid
                  color={state.compare.tracker.color}
                  rows={state.compare.rows} />
              </div>
            {/if}
          {/if}
          {#if state.year.mode == 'map'}
            <div class="map-holder w-100">
              {#if refreshing}
                <div class="empty-notice sm">Loading...</div>
              {:else}
                <NMap
                  height={250}
                  small
                  locations={state.stats.getLocations('year')} />
              {/if}
            </div>
          {/if}
        </div>
      </NPopcard>

      <!--
        Month Card
      -->
      <div class="sticky-header">
        <div class="n-row n-month-bar mt-3 container">
          <button class="btn btn-clear" on:click={methods.previousMonth}>
            <i class="zmdi zmdi-chevron-left font-140 mr-2" />
            {state.date.subtract(1, 'month').format('MMM')}
          </button>
          <h1 class="n-title filler text-center">
            {state.date.format('MMM YYYY')}
          </h1>
          <button class="btn btn-clear" on:click={methods.nextMonth}>
            {state.date.add(1, 'month').format('MMM')}
            <i class="zmdi zmdi-chevron-right font-140 ml-2" />
          </button>
        </div>
      </div>

      <NPopcard level={9} arrow={true}>
        <div class="n-row data-blocks py-2 px-3 border-bottom">
          {#if state.tracker.math === 'sum'}
            <KVBlock
              label="{state.date.format('MMMM')} Total"
              value={NomieUOM.format(math.round(state.stats.results.month.sum || 0, 1000), state.tracker.uom)} />
          {:else}
            <KVBlock
              label="{state.date.format('MMMM')} Avg"
              value={NomieUOM.format(math.round(state.stats.results.month.avg || 0, 1000), state.tracker.uom)} />
          {/if}

          {#if state.stats.results.month.max.value}
            <KVBlock
              label="Max {(state.stats.results.month.max.date || dayjs()).format('MMM D')}"
              value={NomieUOM.format(math.round(state.stats.results.month.max.value, 10), state.tracker.uom)} />
          {/if}
          <KVBlock
            label="Daily Avg"
            value={NomieUOM.format(math.round(state.stats.results.month.avg, 10), state.tracker.uom)} />
        </div>
        <!-- Compare -->
        {#if state.compare.stats}
          <div class="n-row data-blocks py-2 px-3 border-bottom">
            {#if state.compare.tracker.math === 'sum'}
              <KVBlock
                label="{state.compare.tracker.emoji}
                {state.date.format('MMMM')} Total"
                value={NomieUOM.format(math.round(state.compare.stats.results.month.sum || 0, 1000), state.compare.tracker.uom)} />
            {:else}
              <KVBlock
                label="{state.compare.tracker.emoji}
                {state.date.format('MMMM')} Avg"
                value={NomieUOM.format(math.round(state.compare.stats.results.month.avg || 0, 1000), state.compare.tracker.uom)} />
            {/if}

            {#if state.compare.stats.results.month.max.value}
              <KVBlock
                label="{state.compare.tracker.emoji} Max {(state.compare.stats.results.month.max.date || dayjs()).format('MMM D')}"
                value={NomieUOM.format(math.round(state.compare.stats.results.month.max.value, 10), state.compare.tracker.uom)} />
            {/if}
            <KVBlock
              label="{state.compare.tracker.emoji} Daily Avg"
              value={NomieUOM.format(math.round(state.compare.stats.results.month.avg, 10), state.compare.tracker.uom)} />
          </div>
        {/if}

        <div class="n-row p-3">
          <div class="btn-group flex-grow">
            <button
              class="btn btn-sm btn-white-pop {state.month.mode === 'chart' ? ' active' : '   inactive'}"
              on:click={() => {
                methods.setMode('month', 'chart');
              }}>
              Chart
            </button>
            <button
              class="btn btn-sm btn-white-pop {state.month.mode === 'map' ? ' active' : '   inactive'}"
              on:click={() => {
                methods.setMode('month', 'map');
              }}>
              Where
            </button>
            <button
              class="btn btn-sm btn-white-pop {state.month.mode === 'calendar' ? 'active' : '   inactive'}"
              on:click={() => {
                methods.setMode('month', 'calendar');
              }}>
              Streak
            </button>
          </div>
        </div>

        <div class="p-2">
          {#if !refreshing}
            {#if state.month.mode === 'chart'}
              <BarChart
                height={140}
                color={state.tracker.color}
                labels={state.stats.results.month.chart.labels}
                points={state.stats.results.month.chart.points}
                on:tap={event => {
                  let newDate = state.date
                    .toDate()
                    .setDate(event.detail.index + 1);
                  state.date = dayjs(newDate);
                  methods.refresh();
                }}
                xFormat={x => (x % 2 ? x : '')}
                yFormat={y => {
                  return NomieUOM.format(y, state.tracker.uom);
                }}
                activeIndex={state.date.toDate().getDate()} />
              {#if state.compare.stats && !refreshing}
                <BarChart
                  height={100}
                  color={state.compare.stats.tracker.color}
                  labels={state.compare.stats.results.month.chart.labels}
                  points={state.compare.stats.results.month.chart.points}
                  on:tap={event => {
                    let newDate = state.date
                      .toDate()
                      .setDate(event.detail.index + 1);
                    state.date = dayjs(newDate);
                    methods.refresh();
                  }}
                  xFormat={x => (x % 2 ? x : '')}
                  yFormat={y => {
                    return NomieUOM.format(y, state.compare.tracker.uom);
                  }}
                  activeIndex={state.date.toDate().getDate()} />
              {/if}
            {:else if state.month.mode === 'map'}
              <NMap
                small
                locations={state.stats.getLocations('month')}
                height={250} />
            {:else if state.month.mode === 'calendar'}
              <NCalendar
                color={state.tracker.color}
                showHeader={false}
                on:dayClick={event => {
                  state.date = dayjs(event.detail);
                  methods.refresh();
                }}
                initialDate={state.date}
                events={methods.getCalendarData('month')} />
            {/if}
          {:else}
            <div class="empty-notice sm">Loading</div>
          {/if}
        </div>
      </NPopcard>

      <!--
        Day Card
      -->
      <div class="sticky-header">
        <div class="n-row n-year-bar container">
          <button class="btn btn-clear" on:click={methods.previousDay}>
            <i class="zmdi zmdi-chevron-left font-140 mr-2" />
            {state.date.subtract(1, 'day').format('ddd')}
          </button>
          <NCell direction="column" className="text-center">
            <NText size="sm">{state.date.format('ddd MMM D YYYY')}</NText>
            {#if state.date
              .toDate()
              .toDateString() !== new Date().toDateString()}
              <NText size="xs">{state.date.fromNow()}</NText>
            {:else}
              <NText size="xs">Today</NText>
            {/if}
          </NCell>
          <button class="btn btn-clear" on:click={methods.nextDay}>
            {state.date.add(1, 'day').format('ddd')}
            <i class="zmdi zmdi-chevron-right font-140 ml-2" />
          </button>
        </div>
      </div>

      <NPopcard level={8}>
        <div class="n-row data-blocks py-2 px-3 border-bottom">
          {#if state.tracker.math === 'sum'}
            {#await methods.aboveOrBelow(state.stats.results.day.sum, state.stats.results.month.avg) then aob}
              <KVBlock
                value={NomieUOM.format(state.stats.results.day.sum || 0, state.tracker.uom)}>
                <div slot="label">
                  {state.date.format('ddd')}
                  {#if aob.direction != 'same' && isFinite(aob.amount)}
                    <span class="change">
                      <span
                        class="zmdi {aob.direction === 'above' ? 'zmdi-triangle-up' : 'zmdi-triangle-down'}" />
                      {aob.amount}%
                    </span>
                  {/if}
                </div>
              </KVBlock>
              {#if state.compare.stats}
                <KVBlock
                  label={state.compare.tracker.emoji}
                  value={NomieUOM.format(state.compare.stats.results.day.sum || 0, state.compare.tracker.uom)} />
              {/if}
            {/await}
          {:else}
            {#await methods.aboveOrBelow(state.stats.results.day.sum, state.stats.results.month.avg) then aob}
              <KVBlock
                value={NomieUOM.format(state.stats.results.day.avg, state.tracker.uom)}>
                <div slot="label">This Day</div>
              </KVBlock>
            {/await}
          {/if}
        </div>

        <div class="n-row p-3">
          <div class="btn-group flex-grow">
            <button
              class="btn btn-sm btn-white-pop {state.day.mode === 'list' ? ' active' : '   inactive'}"
              on:click={() => {
                methods.setMode('day', 'list');
              }}>
              Logs
            </button>
            <button
              class="btn btn-sm btn-white-pop {state.day.mode === 'map' ? ' active' : '   inactive'}"
              on:click={() => {
                methods.setMode('day', 'map');
              }}>
              Where
            </button>
            <button
              class="btn btn-sm btn-white-pop {state.day.mode === 'all-logs' ? ' active' : '   inactive'}"
              on:click={() => {
                methods.setMode('day', 'all-logs');
              }}>
              All Logs
            </button>

          </div>
        </div>

        <div class="">
          {#if !refreshing}
            {#if state.day.mode === 'list'}
              <div class="n-list">
                {#if state.stats.getRows('day').length === 0}
                  <div class="empty-notice sm">No logs found on this day.</div>
                {/if}
                {#each state.stats.getRows('day') as log, index}
                  {#if log.trackers[state.tracker.tag]}
                    <NLogItem
                      {log}
                      on:locationClick={event => {
                        Interact.showLocations([log]);
                      }}
                      on:moreClick={event => {
                        Interact.logOptions(log).then(() => {});
                      }}
                      show24Hour={$UserStore.meta.is24Hour}
                      trackers={$TrackerStore}
                      focus={state.tracker.tag} />
                  {/if}
                {/each}
              </div>
            {:else if state.day.mode === 'all-logs'}
              <div class="n-list">
                {#await methods.getDayLogs()}
                  <div class="empty-notice sm">Getting logs...</div>
                {:then logs}
                  {#each logs as log, index}
                    <NLogItem
                      {log}
                      on:locationClick={event => {
                        Interact.showLocations([log]);
                      }}
                      show24Hour={$UserStore.meta.is24Hour}
                      on:moreClick={event => {
                        Interact.logOptions(log).then(() => {});
                      }}
                      trackers={$TrackerStore} />
                  {/each}
                {/await}
              </div>
            {:else if state.day.mode === 'map'}
              <NMap
                small
                locations={state.stats.getLocations('day')}
                height={250} />
            {:else if state.day.mode === 'calendar'}
              <div class="empty-notice" />
            {/if}
          {:else}
            <div class="empty-notice sm">Loading</div>
          {/if}
        </div>
      </NPopcard>

    </div>
  </NPage>
{:else}
  <NPage>
    <div slot="header" class="n-row">
      <div class="filler" />
      <h1 class="text-centered">Stats</h1>
      <div class="filler" />
    </div>
    <div class="empty-notice sm">Loading...</div>
  </NPage>
{/if}
