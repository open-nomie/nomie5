<script>
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
  import NItem from "../components/list-item/list-item.svelte";
  import BarChart from "../components/charts/bar-chart.svelte";
  import Tabs from "../components/board-tabs/board-tabs.svelte";
  import NPopcard from "../components/popcard/popcard.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NLogItem from "../components/list-item-log/list-item-log.svelte";

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
    stats: null
  };

  $: if (rows.length) {
    // Rows is populated from the intial load
    console.log(":ROWS!");
  }

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
    load() {
      refreshing = true;
      // Get Logs for the year and tag
      LedgerStore.search(`#${mainTag}`, state.date.format("YYYY")).then(
        resRows => {
          // Expand Logs
          resRows = resRows.map(log => {
            log.expanded();
            return log;
          });
          rows = resRows;
          // Initialize the Stats OverView
          state.stats = new StatsProcessor(rows, state.tracker, state.date);
          refreshing = false;
        }
      );
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
    // getRows(mode) {
    //   let rows = state.raw
    //     .filter(row => {
    //       if (mode == "month") {
    //         let monthKey = new Date(row.end).getMonth();
    //         if (monthKey === state.date.month()) {
    //           return true;
    //         } else {
    //           return false;
    //         }
    //       } else if (mode == "day") {
    //         return (
    //           state.date.format("YYYY-MM-DD") ===
    //           dayjs(row.end).format("YYYY-MM-DD")
    //         );
    //       } else {
    //         return true;
    //       }
    //     })
    //     .sort((a, b) => {
    //       return a.end > b.end ? -1 : 1;
    //     });

    //   return rows;
    // },
    refresh() {
      state.stats.gotoDate(state.date);

      refreshing = true;
      setTimeout(() => {
        refreshing = false;
      });
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
  .block {
    margin: 0 3px;

    .label {
      font-size: 0.7rem;
    }
    .value {
      font-size: 1.4rem;
      font-weight: 500;
    }
  }
  .popcards {
    position: relative;
    min-height: 1200px;
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

{#if state.stats !== null}
  <NPage className="stats" withBack={true}>

    <div slot="header" class="n-row">
      <h1>{state.tracker.emoji} {state.tracker.label}</h1>
    </div>

    <div class="container pt-3 popcards">

      <div class="n-row n-year-bar mw-500px mx-auto">

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

      <NPopcard level={10} arrow={true}>

        <div class="n-row data-blocks py-2 px-3 border-bottom">

          {#if state.tracker.math === 'sum'}
            <div class="block">
              <div class="label">Total</div>
              <div class="value">
                {NomieUOM.format(math.round(state.stats.results.year.sum, 1000), state.tracker.uom)}
              </div>
            </div>
          {:else}
            <div class="block">
              <div class="label">Year Avg</div>
              <div class="value">
                {NomieUOM.format(math.round(state.stats.results.year.avg, 1000), state.tracker.uom)}
              </div>
            </div>
          {/if}

          {#if state.stats.results.year.max}
            <div class="block">
              <div
                class="label"
                on:click={() => {
                  methods.show(state.stats.results.year.max.date);
                }}>
                Max {(state.stats.results.year.max.date || dayjs()).format('MMM D')}
              </div>
              <div class="value">
                {NomieUOM.format(math.round(state.stats.results.year.max.value, 10), state.tracker.uom)}
              </div>
            </div>
          {/if}

          <div class="block">
            <div class="label">Month Avg</div>
            <div class="value">
              {NomieUOM.format(math.round(state.stats.results.year.sum / 12, 10), state.tracker.uom)}
            </div>
          </div>
        </div>
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
          {/if}
          {#if state.year.mode == 'map'}
            <div class="map-holder w-100">
              {#if refreshing}
                <div class="empty-notice sm">Loading...</div>
              {:else}
                <NMap
                  height={300}
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

      <div class="n-row n-month-bar mt-3 mw-500px mx-auto">
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

      <NPopcard level={9} arrow={true}>
        <div class="n-row data-blocks py-2 px-3 border-bottom">
          {#if state.tracker.math === 'sum'}
            <div class="block">
              <div class="label">{state.date.format('MMMM')} Total</div>
              <div class="value">
                {NomieUOM.format(math.round(state.stats.results.month.sum || 0, 1000), state.tracker.uom)}
              </div>
            </div>
          {:else}
            <div class="block">
              <div class="label">{state.date.format('MMMM')} Avg</div>
              <div class="value">
                {NomieUOM.format(math.round(state.stats.results.month.avg || 0, 1000), state.tracker.uom)}
              </div>
            </div>
          {/if}

          {#if state.stats.results.month.max.value}
            <div class="block">
              <div class="label">
                Max {(state.stats.results.month.max.date || dayjs()).format('MMM D')}
              </div>
              <div class="value">
                {NomieUOM.format(math.round(state.stats.results.month.max.value, 10), state.tracker.uom)}
              </div>
            </div>
          {/if}

          <div class="block">
            <div class="label">Daily Avg</div>
            <div class="value">
              {NomieUOM.format(math.round(state.stats.results.month.avg, 10), state.tracker.uom)}
            </div>
          </div>

        </div>

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
            {:else if state.month.mode === 'map'}
              <NMap small locations={state.stats.getLocations('month')} />
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
      <div class="n-row n-year-bar mt-3 mw-500px mx-auto">

        <button class="btn btn-clear" on:click={methods.previousDay}>
          <i class="zmdi zmdi-chevron-left font-140 mr-2" />
          {state.date.subtract(1, 'day').format('ddd')}
        </button>
        <h1
          class="n-title btn btn-light filler text-center"
          on:click={methods.showHistory}>
          {state.date.format('ddd MMM D')}
        </h1>
        <button class="btn btn-clear" on:click={methods.nextDay}>
          {state.date.add(1, 'day').format('ddd')}
          <i class="zmdi zmdi-chevron-right font-140 ml-2" />
        </button>
      </div>

      <NPopcard level={8}>
        <div class="n-row data-blocks py-2 px-3 border-bottom">
          {#if state.tracker.math === 'sum'}
            {#await methods.aboveOrBelow(state.stats.results.day.sum, state.stats.results.month.avg) then aob}
              <div class="block">
                <div class="label">
                  {state.date.format('ddd')} Total
                  {#if aob.direction != 'same'}
                    <span class="change">
                      <span
                        class="zmdi {aob.direction === 'above' ? 'zmdi-triangle-up' : 'zmdi-triangle-down'}" />
                      {aob.amount}%
                    </span>
                  {/if}
                </div>
                <div class="value">
                  {NomieUOM.format(state.stats.results.day.sum || 0, state.tracker.uom)}
                </div>
              </div>
            {/await}
          {:else}
            <div class="block">
              <div class="label">Daily Avg</div>
              <div class="value">
                {NomieUOM.format(state.day.avg, state.tracker.uom)}
              </div>
            </div>
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
            <!-- <button
              class="btn btn-sm btn-white-pop {state.day.mode === 'calendar' ? 'active' : '   inactive'}"
              on:click={() => {
                methods.setMode('day', 'calendar');
              }}>
              More...
            </button> -->
          </div>
        </div>

        <!-- <div class="n-row data-blocks py-2 px-3 border-bottom">
          <div class="btn-group flex-grow">
            <button
              class="btn btn-sm btn-white-pop {state.day.mode === 'list' ? ' active' : '   inactive'}"
              on:click={() => {
                state.month.mode = 'list';
              }}>
              <i class="zmdi zmdi-menu" />
            </button>
            <button
              class="btn btn-sm btn-white-pop {state.day.mode === 'calendar' ? 'active' : '   inactive'}"
              on:click={() => {
                state.month.mode = 'calendar';
              }}>
              <i class="zmdi zmdi-calendar" />
            </button>
          </div>
        </div> -->

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
                      trackers={$TrackerStore}
                      focus={state.tracker.tag} />
                  {/if}
                {/each}
              </div>
            {:else if state.day.mode === 'map'}
              <NMap small locations={state.stats.getLocations('day')} />
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
    <div class="empty-notice sm">Loading...</div>
  </NPage>
{/if}
