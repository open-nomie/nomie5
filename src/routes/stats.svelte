<script>
  //Vendors
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

  const console = new Logger("📊 Stats.svelte");
  const path = window.location.href.split("/");
  const mainTag = path[path.length - 1];

  const getChartBase = () => {
    return {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dev"
      ],
      points: [
        { x: "Jan", y: 0 },
        { x: "Feb", y: 0 },
        { x: "Mar", y: 0 },
        { x: "Apr", y: 0 },
        { x: "May", y: 0 },
        { x: "Jun", y: 0 },
        { x: "Jul", y: 0 },
        { x: "Aug", y: 0 },
        { x: "Sep", y: 0 },
        { x: "Oct", y: 0 },
        { x: "Nov", y: 0 },
        { x: "Jan", y: 0 }
      ]
    };
  };

  // Local
  let refreshing = false;

  let data = {
    date: dayjs(), // default to today - use dayjs object
    tracker: null,
    initalized: false,
    trackers: null,
    raw: null,
    year: {
      mode: "chart",
      notworking: Storage.local.get(`stats/${mainTag}/year-mode`) || "chart",
      total: null,
      avg: null,
      chart: getChartBase()
    },
    month: {
      mode: "chart",
      notworking: Storage.local.get(`stats/${mainTag}/month-mode`) || "chart",
      total: null,
      avg: null,
      chart: {
        labels: [],
        points: []
      }
    },
    day: {
      mode: "list",
      notworking: Storage.local.get(`stats/${mainTag}/day-mode`) || "list",
      total: null,
      avg: null
    }
  };

  // If we get some data - then
  $: if ((data.raw || []).length && data.tracker) {
    methods.getChartData("month");
  }

  // Get the Tracker for the MainTag
  $: if (Object.keys($TrackerStore || {}).length) {
    // if it doesn't exist, create a temp one.
    data.tracker =
      $TrackerStore[mainTag] || new Tracker({ tag: mainTag, label: mainTag });
  }

  const methods = {
    previous() {
      data.date = data.date.subtract(1, "year");
      methods.load();
    },
    next() {
      data.date = data.date.add(1, "year");
      methods.load();
    },
    setMode(unit, mode) {
      switch (unit) {
        case "day":
          data.day.mode = mode;
          break;
        case "month":
          data.month.mode = mode;
          break;
        case "year":
          data.year.mode = mode;
          break;
      }
    },
    previousMonth() {
      let thisYear = data.date.year();
      data.date = data.date.subtract(1, "month");
      if (data.date.year() !== thisYear) {
        methods.load();
      } else {
        methods.refresh();
      }
    },
    nextMonth() {
      let thisYear = data.date.year();
      data.date = data.date.add(1, "month");
      if (data.date.year() !== thisYear) {
        methods.load();
      } else {
        methods.refresh();
      }
    },
    previousDay() {
      let thisYear = data.date.year();
      data.date = data.date.subtract(1, "day");
      if (data.date.year() !== thisYear) {
        methods.load();
      } else {
        methods.refresh();
      }
    },
    nextDay() {
      let thisYear = data.date.year();
      data.date = data.date.add(1, "day");
      if (data.date.year() !== thisYear) {
        methods.load();
      } else {
        methods.refresh();
      }
    },
    getRows(mode) {
      let rows = data.raw
        .filter(row => {
          if (mode == "month") {
            let monthKey = new Date(row.end).getMonth();
            if (monthKey === data.date.month()) {
              return true;
            } else {
              return false;
            }
          } else if (mode == "day") {
            return (
              data.date.format("YYYY-MM-DD") ===
              dayjs(row.end).format("YYYY-MM-DD")
            );
          } else {
            return true;
          }
        })
        .sort((a, b) => {
          return a.end > b.end ? -1 : 1;
        });

      return rows;
    },
    refresh() {
      refreshing = true;
      setTimeout(() => {
        refreshing = false;
      });
    },
    getValueMap(rows) {
      let valueMap = {};
      rows.forEach(row => {
        let dayKey = dayjs(row.end).format("YYYY-MM-DD");
        valueMap[dayKey] = valueMap[dayKey] || [];
        if (row.trackers[data.tracker.tag]) {
          valueMap[dayKey].push(row.trackers[data.tracker.tag].value);
        }
      });
      return valueMap;
    },
    /**
     * Get Chart Data - IMPORTANT and Sloppy
     * TODO: Needs to be refactored and cleaned up
     */
    getChartData(mode) {
      // Setup labels, points, row holder
      let labels = []; // holds labels
      let points = []; // holds x/y
      let rows = []; // rows
      let valueMap = {}; // used to group values based on a day key
      // if we're doing a month
      if (mode === "month") {
        // Get month's rows
        rows = methods.getRows("month");

        valueMap = methods.getValueMap(rows);

        let calendar = CalendarMap({
          start: dayjs(data.date)
            .startOf("month")
            .toDate()
            .getTime(),
          end: dayjs(data.date)
            .endOf("month")
            .toDate()
            .getTime(),
          mode: "day"
        });

        calendar.label.forEach((dayKey, index) => {
          if (valueMap[dayKey]) {
            if (data.tracker.math === "sum") {
              calendar.value[index] = math.sum(valueMap[dayKey]);
            } else {
              calendar.value[index] = math.average(valueMap[dayKey]);
            }
          }
        });

        let labels = calendar.label.map((dayKey, index) => {
          return dayjs(dayKey).format("D");
        });
        // TODO: Implement IgnoreZeros
        // Day Totals
        data.day.total = math.sum(
          valueMap[data.date.format("YYYY-MM-DD")] || [0]
        );
        data.day.avg = math.average(
          valueMap[data.date.format("YYYY-MM-DD")] || [0]
        );
        // Month Totals

        data.month.total = math.round(
          math.sum(calendar.value.filter(v => v !== 0))
        );
        data.month.avg = math.average(calendar.value.filter(v => v !== 0));
        data.month.chart = {
          labels: labels,
          points: calendar.value.map((value, index) => {
            return {
              x: labels[index],
              y: value
            };
          })
        };
      }
    },
    aboveOrBelow(ths, tht) {
      return new Promise((resolve, reject) => {
        resolve({
          direction: ths > tht ? "above" : ths === tht ? "same" : "below",
          amount: math.round(100 - math.percentage(ths, tht))
        });
      });
    },
    getCalendarData(mode) {
      let rows = methods.getRows(mode).map(row => {
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
      methods.getRows(type).forEach(row => {
        if (row.lat) {
          let key = `${math.round(row.lat, 1000)},${math.round(row.lng, 1000)}`;
          locations[key] = locations[key] || { lat: row.lat, lng: row.lng };
        }
      });
      return Object.keys(locations).map(key => {
        return locations[key];
      });
    },
    percentile(xyarr) {
      let values = math.percentile(
        xyarr.map(row => {
          return row.y;
        })
      );

      let updatedArray = xyarr.map((row, index) => {
        return {
          y: values[index],
          x: row.x
        };
      });

      return updatedArray;
    },
    load() {
      refreshing = true;
      data.year.chart = getChartBase();
      LedgerStore.search(`#${mainTag}`, data.date.format("YYYY")).then(rows => {
        let monthMap = {
          "1": [],
          "2": [],
          "3": [],
          "4": [],
          "5": [],
          "6": [],
          "7": [],
          "8": [],
          "9": [],
          "10": [],
          "11": [],
          "12": []
        };
        // Set Raw
        data.raw = rows;
        // Loop over each Roow
        rows.forEach(row => {
          // Expand it
          row.expanded();
          let month = new Date(row.end).getMonth() + 1;
          let trackerValue = (row.trackers[mainTag] || {}).value || null;
          // If we have a tracker value - lets push it to the month
          if (trackerValue) {
            monthMap[month] = monthMap[month] || [];
            monthMap[month].push(trackerValue);
          }
        }); // end looping over rows;

        let values = Object.keys(monthMap).map(index => {
          let value = 0;
          if ((data.tracker || {}).math !== "sum") {
            value = math.sum(monthMap[index]);
          } else {
            value = math.average(monthMap[index]);
          }
          return value;
        });

        data.year.total = math.round(math.sum(values));
        data.year.avg = math.average(values);

        // Loop over them to asign to the right point
        math.percentile(values).forEach((value, index) => {
          data.year.chart.points[index].y = value;
        });

        // Disable loading
        refreshing = false;
      });
    }
  };

  TrackerStore.subscribe(tkrs => {
    if (tkrs) {
      data.trackers = tkrs;
      methods.load();
    }
  });
</script>

<style lang="scss">
  .block {
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

{#if data.tracker !== null}
  <NPage className="stats" withBack={true}>

    <div slot="header" class="n-row">
      <h1>{data.tracker.emoji} {data.tracker.label}</h1>
    </div>

    <div class="container pt-3 popcards">

      <div class="n-row n-year-bar mw-500px mx-auto">

        <button class="btn btn-clear" on:click={methods.previous}>
          <i class="zmdi zmdi-chevron-left font-140 mr-2" />
          {data.date.subtract(1, 'year').format('YYYY')}
        </button>
        <h1 class="n-title filler text-center">{data.date.format('YYYY')}</h1>
        <button class="btn btn-clear" on:click={methods.next}>
          {data.date.add(1, 'year').format('YYYY')}
          <i class="zmdi zmdi-chevron-right font-140 ml-2" />
        </button>
      </div>

      <NPopcard level={10} arrow={true}>

        <div class="n-row data-blocks py-2 px-3 border-bottom">
          {#if data.tracker.math === 'sum' && data.year.total}
            <div class="block">
              <div class="label">Total</div>
              <div class="value">
                {NomieUOM.format(data.year.total, data.tracker.uom)}
              </div>
            </div>
          {/if}
          {#if data.year.avg}
            <div class="block">
              <div class="label">Month Avg</div>
              <div class="value">
                {NomieUOM.format(data.year.avg, data.tracker.uom)}
              </div>
            </div>
          {/if}
        </div>
        <div class="n-row p-3">
          <div class="btn-group flex-grow">
            <button
              class="btn btn-sm btn-white-pop {data.year.mode === 'chart' ? ' active' : ' inactive'}"
              on:click={() => {
                methods.setMode('year', 'chart');
              }}>
              Chart
            </button>
            <button
              class="btn btn-sm btn-white-pop {data.year.mode === 'map' ? ' active' : ' inactive'}"
              on:click={() => {
                methods.setMode('year', 'map');
              }}>
              Where
            </button>
          </div>
        </div>

        <div class="p-2">
          {#if data.year.mode == 'chart'}
            <BarChart
              height={140}
              color={data.tracker.color}
              labels={data.year.chart.labels}
              points={data.year.chart.points}
              on:tap={event => {
                data.date = data.date.set('month', event.detail.index);
                methods.refresh();
              }}
              activeIndex={data.date.month() + 1} />
          {/if}
          {#if data.year.mode == 'map'}
            <div class="map-holder w-100">
              <NMap
                height={300}
                small
                locations={methods.getLocationSummary()} />
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
          {data.date.subtract(1, 'month').format('MMM')}
        </button>
        <h1 class="n-title filler text-center">
          {data.date.format('MMM YYYY')}
        </h1>
        <button class="btn btn-clear" on:click={methods.nextMonth}>
          {data.date.add(1, 'month').format('MMM')}
          <i class="zmdi zmdi-chevron-right font-140 ml-2" />
        </button>
      </div>

      <NPopcard level={9} arrow={true}>
        <div class="n-row data-blocks py-2 px-3 border-bottom">
          {#if data.tracker.math === 'sum'}
            <div class="block">
              <div class="label">{data.date.format('MMMM')} Total</div>
              <div class="value">
                {NomieUOM.format(data.month.total || 0, data.tracker.uom)}
              </div>
            </div>
          {/if}
          {#if data.month.avg}
            <div class="block">
              <div class="label">Daily Avg</div>
              <div class="value">
                {NomieUOM.format(data.month.avg, data.tracker.uom)}
              </div>
            </div>
          {/if}
        </div>

        <div class="n-row p-3">
          <div class="btn-group flex-grow">
            <button
              class="btn btn-sm btn-white-pop {data.month.mode === 'chart' ? ' active' : '   inactive'}"
              on:click={() => {
                methods.setMode('month', 'chart');
              }}>
              Chart
            </button>
            <button
              class="btn btn-sm btn-white-pop {data.month.mode === 'map' ? ' active' : '   inactive'}"
              on:click={() => {
                methods.setMode('month', 'map');
              }}>
              Where
            </button>
            <button
              class="btn btn-sm btn-white-pop {data.month.mode === 'calendar' ? 'active' : '   inactive'}"
              on:click={() => {
                methods.setMode('month', 'calendar');
              }}>
              Streak
            </button>
          </div>
        </div>

        <div class="p-2">
          {#if !refreshing}
            {#if data.month.mode === 'chart'}
              <BarChart
                height={140}
                color={data.tracker.color}
                labels={data.month.chart.labels}
                points={data.month.chart.points}
                on:tap={event => {
                  let newDate = data.date
                    .toDate()
                    .setDate(event.detail.index + 1);
                  data.date = dayjs(newDate);
                  methods.refresh();
                }}
                activeIndex={data.date.toDate().getDate()} />
            {:else if data.month.mode === 'map'}
              <NMap small locations={methods.getLocationSummary('month')} />
            {:else if data.month.mode === 'calendar'}
              <NCalendar
                color={data.tracker.color}
                showHeader={false}
                on:dayClick={event => {
                  data.date = dayjs(event.detail);
                  methods.refresh();
                }}
                initialDate={data.date}
                events={methods.getCalendarData('month')} />
            {/if}
          {:else}
            <div class="empty-notice">Loading</div>
          {/if}
        </div>
      </NPopcard>

      <!--
        Day Card
      -->
      <div class="n-row n-year-bar mt-3 mw-500px mx-auto">

        <button class="btn btn-clear" on:click={methods.previousDay}>
          <i class="zmdi zmdi-chevron-left font-140 mr-2" />
          {data.date.subtract(1, 'day').format('ddd')}
        </button>
        <h1 class="n-title filler text-center">
          {data.date.format('ddd MMM D')}
        </h1>
        <button class="btn btn-clear" on:click={methods.nextDay}>
          {data.date.add(1, 'day').format('ddd')}
          <i class="zmdi zmdi-chevron-right font-140 ml-2" />
        </button>
      </div>

      <NPopcard level={8}>
        <div class="n-row data-blocks py-2 px-3 border-bottom">
          {#if data.tracker.math === 'sum'}
            {#await methods.aboveOrBelow(data.day.total, data.month.avg) then aob}
              <div class="block">
                <div class="label">
                  {data.date.format('ddd')} Total
                  {#if aob.direction != 'same'}
                    <span class="change">
                      <span
                        class="zmdi {aob.direction === 'above' ? 'zmdi-triangle-up' : 'zmdi-triangle-down'}" />
                      {aob.amount}%
                    </span>
                  {/if}
                </div>
                <div class="value">
                  {NomieUOM.format(data.day.total || 0, data.tracker.uom)}
                </div>
              </div>
            {/await}
          {:else}
            <div class="block">
              <div class="label">Daily Avg</div>
              <div class="value">
                {NomieUOM.format(data.day.avg, data.tracker.uom)}
              </div>
            </div>
          {/if}
        </div>

        <div class="n-row p-3">
          <div class="btn-group flex-grow">
            <button
              class="btn btn-sm btn-white-pop {data.day.mode === 'list' ? ' active' : '   inactive'}"
              on:click={() => {
                methods.setMode('day', 'list');
              }}>
              Logs
            </button>
            <button
              class="btn btn-sm btn-white-pop {data.day.mode === 'map' ? ' active' : '   inactive'}"
              on:click={() => {
                methods.setMode('day', 'map');
              }}>
              Where
            </button>
            <!-- <button
              class="btn btn-sm btn-white-pop {data.day.mode === 'calendar' ? 'active' : '   inactive'}"
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
              class="btn btn-sm btn-white-pop {data.day.mode === 'list' ? ' active' : '   inactive'}"
              on:click={() => {
                data.month.mode = 'list';
              }}>
              <i class="zmdi zmdi-menu" />
            </button>
            <button
              class="btn btn-sm btn-white-pop {data.day.mode === 'calendar' ? 'active' : '   inactive'}"
              on:click={() => {
                data.month.mode = 'calendar';
              }}>
              <i class="zmdi zmdi-calendar" />
            </button>
          </div>
        </div> -->

        <div class="">
          {#if !refreshing}
            {#if data.day.mode === 'list'}
              <div class="n-list">
                {#if methods.getRows('day').length === 0}
                  <div class="empty-notice sm">No logs found on this day.</div>
                {/if}
                {#each methods.getRows('day') as log, index}
                  {#if log.trackers[data.tracker.tag]}
                    <NLogItem
                      {log}
                      on:locationClick={event => {
                        Interact.showLocations([log]);
                      }}
                      trackers={$TrackerStore}
                      focus={data.tracker.tag} />
                  {/if}
                {/each}
              </div>
            {:else if data.day.mode === 'map'}
              <NMap small locations={methods.getLocationSummary('day')} />
            {:else if data.day.mode === 'calendar'}
              <div class="empty-notice" />
            {/if}
          {:else}
            <div class="empty-notice">Loading</div>
          {/if}
        </div>
      </NPopcard>
    </div>
  </NPage>
{:else}
  <NPage>
    <div class="empty-notice">Loading...</div>
  </NPage>
{/if}
