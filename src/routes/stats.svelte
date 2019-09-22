<script>
  /**
   * Stats Route
   * This is stupid big... still needs to be organized
   * SERIOUSLY BIG
   */

  //Vendors
  import { onMount, onDestroy } from "svelte";
  import { navigate, Router, Route } from "svelte-routing";
  import dayjs from "dayjs";
  import Spinner from "svelte-spinner";

  // Utils
  import math from "../utils/math/math";
  import NomieUOM from "../utils/nomie-uom/nomie-uom";
  import Logger from "../utils/log/log";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  // import CalendarMap from "../utils/calendar-map/calendar-map";
  import Storage from "../modules/storage/storage";
  import StatsProcessor from "../modules/stats/stats";

  // Components
  import ButtonGroup from "../components/button-group/button-group.svelte";

  import NText from "../components/text/text.svelte";
  import NCell from "../components/cell/cell.svelte";
  import Modal from "../components/modal/modal.svelte";
  // import NItem from "../components/list-item/list-item.svelte";
  import BarChart from "../components/charts/bar-chart.svelte";
  // import Tabs from "../components/board-tabs/board-tabs.svelte";
  import NPopcard from "../components/popcard/popcard.svelte";
  // import NToolbar from "../components/toolbar/toolbar.svelte";
  import NLogItem from "../components/list-item-log/list-item-log.svelte";
  import NTimeGrid from "../components/day-time-grid/day-time-grid.svelte";
  import KVBlock from "../components/kv-block/kv-block.svelte";

  // containers
  import NPage from "../containers/layout/page.svelte";
  import NMap from "../containers/map/map.svelte";
  import NCalendar from "../containers/calendar/sweet.svelte";

  //store
  // import { BoardStore } from "../store/boards";
  import { UserStore } from "../store/user";
  import { TrackerStore } from "../store/trackers";
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { HistoryPage } from "../store/history-page";
  import { Lang } from "../store/lang";

  // const path = window.location.href.split("/");
  // const mainTag = path[path.length - 1];

  // const mainTag = TrackerStore.getById(id).tag;

  const console = new Logger("📊 Stats.svelte");

  // Local
  let refreshing = false;
  let hasStats = false;
  let rows = [];
  let mainTag = $Interact.stats.activeTag;

  let domVisible = false;

  let statStorage = Storage.local.get("stats-view") || {};

  let state = {
    date: dayjs(), // default to today - use dayjs object
    tracker: null,
    initalized: false,
    tracker: null,
    // year: {
    //   mode: "chart"
    // },
    // month: {
    //   mode: "chart"
    // },
    // day: {
    //   mode: "list"
    // },
    // overview: {
    //   mode: "time"
    // },
    view: statStorage.view,
    subview: statStorage.subview,
    stats: null,
    // Holder of the comparable tracker
    // Current hack - tap the emoji in the title
    compare: {
      tracker: null,
      stats: null
    },
    ready: false,
    tag: null
  };

  // On First Load
  $: if ($Interact.stats.activeTag !== state.tag && $Interact.stats.activeTag) {
    console.log("When me fire?");
    let tagViewSettings = statStorage[$Interact.stats.activeTag] || {
      view: "month",
      subview: "chart"
    };
    domVisible = true;
    state.date = dayjs();
    state.tag = $Interact.stats.activeTag;
    state.view = tagViewSettings.view;
    state.subview = tagViewSettings.subview;
    state.tracker =
      $TrackerStore[$Interact.stats.activeTag] ||
      new Tracker({ tag: $Interact.stats.activeTag });
    methods.load();
  } else if (!$Interact.stats.activeTag && state.tag) {
    state.date = dayjs();
  }

  // $: if ($Interact.stats.activeTag && !state.ready) {
  //   let stateUpdate = { ...state };

  //   let tagViewSettings = statStorage[$Interact.stats.activeTag] || {
  //     view: "month",
  //     subview: "chart"
  //   };

  //   mainTag = $Interact.stats.activeTag;
  //   state.tracker = $TrackerStore[mainTag] || new Tracker({ tag: mainTag });
  //   methods.load();
  //   state.view = tagViewSettings.view;
  //   state.subview = tagViewSettings.subview;
  //   state.ready = true;

  //   console.log("Loading Stats");

  //   setTimeout(() => {
  //     domVisible = true;
  //   }, 200);
  // } else {
  //   setTimeout(() => {
  //     domVisible = false;
  //   }, 300);
  // }

  const methods = {
    getStats() {},
    showHistory() {
      navigate("/history");
      setTimeout(() => {
        $HistoryPage.date = state.date;
      }, 10);
    },
    saveView() {
      let view = {
        view: state.view,
        subview: state.subview
      };
      statStorage[$Interact.stats.activeTag] = view;
      Storage.local.put("stats-view", statStorage);
    },
    changeView(mode) {
      state.view = mode;

      if (
        state.view == "year" &&
        ["map", "chart", "grid"].indexOf(state.subview) == -1
      ) {
        state.subview = "chart";
      } else if (
        state.view == "month" &&
        ["map", "logs", "streak"].indexOf(state.subview) == -1
      ) {
        state.subview = "chart";
      } else if (
        state.view == "day" &&
        ["map", "logs", "chart", "all-logs"].indexOf(state.subview) == -1
      ) {
        state.subview = "map";
      }

      methods.saveView();

      if (state.date.year() !== dayjs().year()) {
        methods.load();
      } else {
        methods.refresh();
      }
    },
    getGridRows() {
      if (state.view == "month") {
        let start = state.date
          .startOf("month")
          .toDate()
          .getTime();
        let end = state.date
          .endOf("month")
          .toDate()
          .getTime();
        return rows.filter(row => {
          return row.end > start && row.end < end;
        });
      } else {
        return rows;
      }
    },
    changeSubview(mode) {
      state.subview = mode;
      methods.saveView();
    },
    getChartLabels() {
      let view = state.view == "year" ? "year" : "month";
      let labels = state.stats.results[view].chart.labels || [];
      return labels;
    },
    getChartPoints() {
      let view = state.view == "year" ? "year" : "month";
      let points = state.stats.results[view].chart.points || [];
      return points;
    },
    activeIndex() {
      if (state.view == "year") {
        return state.date.month();
      } else {
        return state.date.date();
      }
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
    xFormat(x) {
      if (state.view == "year") {
        return dayjs(x).format("MMM");
      } else {
        return x % 2 ? x : "";
      }
    },
    load() {
      let tracker =
        $TrackerStore[$Interact.stats.activeTag] ||
        new Tracker({ tag: $Interact.stats.activeTag });
      refreshing = true;
      methods.getStats(tracker).then(res => {
        rows = res.rows;
        state.stats = res.stats;
        // if (state.compare.tracker) {
        //   methods.getStats(state.compare.tracker).then(compareRes => {
        //     state.compare.stats = compareRes.stats;
        //     state.compare.rows = compareRes.rows;
        //   });
        // }

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
      state.view = "day";
      state.subview = "logs";
      this.refresh();
    },
    getValueMap(rows) {
      console.log("Get Value Map", rows);
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
    close() {
      domVisible = false;
      setTimeout(() => {
        Interact.closeStats();
      }, 600);
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
    // methods.load();
    console.log("On Mount!");
  });
  onDestroy(() => {
    console.log("On Destroy!");
  });
</script>

<style lang="scss">
  .data-blocks {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
  }
  .border-bottom {
    border-bottom: solid 1px var(--color-faded-1) !important;
  }

  .stat-view-body {
    flex-grow: 1;
    min-height: 100%;
    height: 100%;
    background-color: var(--color-bg);
  }

  .loading-main {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    flex-shrink: 1;
    height: 100%;
  }

  .sticky-header {
    background: var(--color-bg);
    position: -webkit-sticky;
    position: sticky;
    top: 50px;
    z-index: 1000;
  }

  .subheader {
    background: var(--color-bg) !important;
  }
  .stat-topbar {
    text-align: center;
    padding-bottom: 6px;
    justify-content: center;
    font-size: 12px;
    background-color: transparent !important;
    margin-left: -11px;
    margin-top: -11px;
    padding-top: 9px;
    margin-bottom: 5px;
    width: calc(100% + 22px);
    border-top-left-radius: 0.6rem;
    border-top-right-radius: 0.6rem;
  }

  :global(.stats-modal .n-modal) {
    width: 96vw;
    max-width: 600px;
    height: 86vh !important;
    min-height: 540px !important;
    max-height: 700px !important;
  }
  :global(.stats-modal .n-modal .n-modal-body) {
    padding: 0 !important;
    // min-height: 120px;
    height: 100%;
  }
</style>

<Modal className="stats-modal" show={domVisible} type="bottom-slideup">
  <header
    slot="header"
    class="n-column w-100 stats-header"
    on:swipedown={methods.close}>
    <div
      class="stat-topbar n-row f-grow"
      style="background-color:{state.tracker.color}"
      on:swipedown={methods.close}>
      {#if state.tracker}
        {state.tracker.emoji} {state.tracker.label}
      {:else}
        <Spinner size="16" speed="750" color="#666" thickness="2" gap="40" />
        Loading...
      {/if}
    </div>
    <div class="stat-header n-row f-grow">
      <button
        class="btn btn-clear btn-icon zmdi zmdi-close"
        on:click={methods.close} />
      <!-- View Button Group -->
      <div class="mx-2 filler">
        <ButtonGroup
          size="sm"
          buttons={[{ label: 'Day', active: state.view === 'day', click() {
                methods.changeView('day');
              } }, { label: 'Month', active: state.view === 'month', click() {
                methods.changeView('month');
              } }, { label: 'Year', active: state.view === 'year', click() {
                methods.changeView('year');
              } }]} />
      </div>
      <!-- End View Button Group -->
      <!-- <h1 class="truncate" on:click={methods.compare}>
        {state.tracker.emoji} {state.tracker.label}
        {#if state.compare.tracker}
          <span class="">vs</span>
          {state.compare.tracker.emoji}
        {/if}
      </h1> -->
      <button
        class="btn btn-clear btn-icon zmdi zmdi-edit"
        on:click={() => {
          Interact.editTracker(state.tracker).then(() => {});
        }} />
    </div>

    <div class="stat-sub-header n-row pt-2">
      {#if state.view == 'year'}
        <button class="btn btn-clear" on:click={methods.previous}>
          <i class="zmdi zmdi-chevron-left font-140 mr-2" />
          {state.date.subtract(1, 'year').format('YYYY')}
        </button>
        <h1 class="n-title filler text-center">{state.date.format('YYYY')}</h1>
        <button class="btn btn-clear" on:click={methods.next}>
          {state.date.add(1, 'year').format('YYYY')}
          <i class="zmdi zmdi-chevron-right font-140 ml-2" />
        </button>
      {:else if state.view == 'month'}
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
      {:else if state.view == 'day'}
        <button class="btn btn-clear" on:click={methods.previousDay}>
          <i class="zmdi zmdi-chevron-left font-140 mr-2" />
          {state.date.subtract(1, 'day').format('ddd')}
        </button>
        <NCell direction="column" className="text-center">
          <NText size="sm" className="font-bold">
            {state.date.format('ddd MMM D YYYY')}
          </NText>
          {#if state.date.toDate().toDateString() !== new Date().toDateString()}
            <NText size="xs">{state.date.fromNow()}</NText>
          {:else}
            <NText size="xs">Today</NText>
          {/if}
        </NCell>
        <button class="btn btn-clear" on:click={methods.nextDay}>
          {state.date.add(1, 'day').format('ddd')}
          <i class="zmdi zmdi-chevron-right font-140 ml-2" />
        </button>
      {/if}
    </div>
    <!-- end sub-header -->
    <!-- Start Value Header-->
    {#if state.stats}
      <div class="n-row data-blocks py-2">
        {#if state.view == 'year'}
          {#if state.tracker.math === 'sum'}
            <KVBlock
              type="box"
              label="Total"
              value={NomieUOM.format(math.round(state.stats.results.year.sum, 1000), state.tracker.uom)} />
          {:else}
            <KVBlock
              type="box"
              label="Year Avg"
              value={NomieUOM.format(math.round(state.stats.results.year.avg, 1000), state.tracker.uom)} />
          {/if}
          {#if state.stats.results.year.max}
            <KVBlock
              type="box"
              onClick={() => {
                methods.show(state.stats.results.year.max.date);
              }}
              label="Max {(state.stats.results.year.max.date || dayjs()).format('MMM D')}"
              value={NomieUOM.format(math.round(state.stats.results.year.max.value, 10), state.tracker.uom)} />
          {/if}
        {:else if state.view == 'month'}
          {#if state.tracker.math === 'sum'}
            <KVBlock
              type="box"
              label="{state.date.format('MMM')} Total"
              value={NomieUOM.format(math.round(state.stats.results.month.sum || 0, 1000), state.tracker.uom)} />
          {:else}
            <KVBlock
              type="box"
              label="{state.date.format('MMM')} Avg"
              value={NomieUOM.format(math.round(state.stats.results.month.avg || 0, 1000), state.tracker.uom)} />
          {/if}

          {#if state.stats.results.month.max.value}
            <KVBlock
              type="box"
              label="Max {(state.stats.results.month.max.date || dayjs()).format('MMM D')}"
              value={NomieUOM.format(math.round(state.stats.results.month.max.value, 10), state.tracker.uom)} />
          {/if}
          <KVBlock
            type="box"
            label="Daily Avg"
            value={NomieUOM.format(math.round(state.stats.results.month.avg, 10), state.tracker.uom)} />
        {:else if state.view == 'day'}
          {#if state.tracker.math === 'sum'}
            {#await methods.aboveOrBelow(state.stats.results.day.sum, state.stats.results.month.avg) then aob}
              <KVBlock
                type="box"
                value={NomieUOM.format(state.stats.results.day.sum || 0, state.tracker.uom)}>
                <div slot="label">
                  {state.date.format('ddd')}
                  {#if aob.direction != 'same' && isFinite(aob.amount)}
                    <div class="change">
                      <span
                        class="zmdi {aob.direction === 'above' ? 'zmdi-triangle-up' : 'zmdi-triangle-down'}" />
                      {aob.amount}%
                    </div>
                  {/if}
                </div>
              </KVBlock>
              {#if state.compare.stats}
                <KVBlock
                  type="box"
                  label={state.compare.tracker.emoji}
                  value={NomieUOM.format(state.compare.stats.results.day.sum || 0, state.compare.tracker.uom)} />
              {/if}
            {/await}
          {:else}
            {#await methods.aboveOrBelow(state.stats.results.day.sum, state.stats.results.month.avg) then aob}
              <KVBlock
                type="box"
                value={NomieUOM.format(state.stats.results.day.avg, state.tracker.uom) || '~'}>
                <div slot="label">Day</div>
              </KVBlock>
            {/await}
          {/if}
        {/if}
      </div>
    {/if}
    <!-- End Value Header-->
    <!-- Start button group-->
    <div class="n-row py-2">
      {#if state.view == 'year'}
        <ButtonGroup
          size="sm"
          buttons={[{ label: Lang.t('general.map'), active: state.subview == 'map', click() {
                methods.changeSubview('map');
              } }, { label: Lang.t('stats.chart'), active: state.subview == 'chart', click() {
                methods.changeSubview('chart');
              } }, { label: Lang.t('general.time'), active: state.subview == 'grid', click() {
                methods.changeSubview('grid');
              } }]} />
      {:else if state.view == 'month'}
        <ButtonGroup
          size="sm"
          buttons={[{ label: Lang.t('general.map'), active: state.subview == 'map', click() {
                methods.changeSubview('map');
              } }, { label: Lang.t('stats.chart'), active: state.subview == 'chart', click() {
                methods.changeSubview('chart');
              } }, { label: Lang.t('general.time'), active: state.subview == 'grid', click() {
                methods.changeSubview('grid');
              } }, { label: Lang.t('stats.logs'), active: state.subview == 'logs', click() {
                methods.changeSubview('logs');
              } }, { label: Lang.t('stats.streak'), active: state.subview == 'calendar', click() {
                methods.changeSubview('calendar');
              } }]} />
      {:else if state.view == 'day'}
        <ButtonGroup
          size="sm"
          buttons={[{ label: Lang.t('general.map'), active: state.subview == 'map', click() {
                methods.changeSubview('map');
              } }, { label: Lang.t('stats.chart'), active: state.subview == 'chart', click() {
                methods.changeSubview('chart');
              } }, { label: Lang.t('stats.logs'), active: state.subview == 'logs', click() {
                methods.changeSubview('logs');
              } }, { label: Lang.t('stats.all-logs'), active: state.subview == 'all-logs', click() {
                methods.changeSubview('all-logs');
              } }]} />
      {/if}
    </div>
    <!-- end button grouo-->
  </header>

  {#if !refreshing}
    <main class="stat-view-body {state.mode}-view">

      <!-- START STAT COMPONENT VIEWS -->
      {#if state.subview === 'chart'}
        <div class="p-2">
          <BarChart
            height={220}
            color={state.tracker.color}
            labels={methods.getChartLabels()}
            points={methods.getChartPoints()}
            on:tap={event => {
              let newDate;
              if (state.view === 'year') {
                newDate = state.date.toDate().setMonth(event.detail.index);
                state.view = 'month';
              } else if (state.view == 'month') {
                newDate = state.date.toDate().setDate(event.detail.index + 1);
              } else if (state.view == 'day') {
                newDate = state.date.toDate().setDate(event.detail.index + 1);
              }
              state.date = dayjs(newDate);
              methods.refresh();
            }}
            xFormat={methods.xFormat}
            yFormat={y => {
              return NomieUOM.format(y, state.tracker.uom);
            }}
            activeIndex={methods.activeIndex()} />
        </div>
      {:else if state.subview === 'grid'}
        <NTimeGrid color={state.tracker.color} rows={methods.getGridRows()} />
      {:else if state.subview === 'map'}
        <NMap
          small
          locations={state.stats.getLocations(state.view)}
          height={250} />
      {:else if state.subview === 'calendar'}
        <div class="p-3">
          <NCalendar
            color={state.tracker.color}
            showHeader={false}
            on:dayClick={event => {
              state.date = dayjs(event.detail);
              methods.refresh();
            }}
            initialDate={state.date}
            events={methods.getCalendarData('month')} />
        </div>
      {:else if state.subview === 'logs'}
        <div class="n-list">
          {#if state.stats.getRows(state.view).length === 0}
            <div class="empty-notice sm">No logs found on this day.</div>
          {/if}
          {#each state.stats.getRows(state.view) as log, index}
            {#if log.trackers[state.tracker.tag]}
              <NLogItem
                {log}
                className="compact"
                fullDate={true}
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
      {:else if state.subview === 'all-logs'}
        <div class="n-list">
          {#await methods.getDayLogs()}
            <div class="empty-notice sm">Getting logs...</div>
          {:then logs}
            {#each logs as log, index}
              <NLogItem
                className="compact"
                fullDate={true}
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
      {/if}
    </main>
  {:else}
    <main class="loading-main stat-view-body">Loading...</main>
  {/if}

</Modal>
