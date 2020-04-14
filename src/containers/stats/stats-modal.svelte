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
  import StatsRef from "../../modules/stats/stats-ref";

  import { strToColor } from "../../components/dymoji/dymoji";

  // Utils
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import tick from "../../utils/tick/tick";
  import math from "../../utils/math/math";
  import Storage from "../../modules/storage/storage";
  import regex from "../../utils/regex";
  import NoteDataTypes from "../../modules/note-data-type/note-data-type";

  // Components
  import NModal from "../../components/modal/modal.svelte";
  import Dymoji from "../../components/dymoji/dymoji.svelte";
  import NButtonGroup from "../../components/button-group/button-group.svelte";
  import HScroller from "../../components/h-scroller/h-scroller.svelte";
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
  import { Lang } from "../../store/lang";
  import { TrackerStore } from "../../store/trackers";
  import { PeopleStore } from "../../store/people-store";

  const timeSpans = {
    d: { id: "d", label: "D", title: "Day", unit: "day" },
    w: { id: "w", label: "W", title: "Week", unit: "week" },
    m: { id: "m", label: "M", title: "Month", unit: "month" },
    y: { id: "y", label: "Y", title: "Year", unit: "year" }
  };

  const dataViews = {
    overview: { id: "overview", label: "Home" },
    compare: { id: "compare", label: "Compare" },
    map: { id: "map", label: "Map" },
    time: { id: "time", label: "Time" },
    logs: { id: "logs", label: "Logs" }
  };

  const types = {
    tracker: { prefix: "#" },
    person: { prefix: "@" },
    context: { prefix: "+" },
    location: { prefix: "" }
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
    related: []
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

  function back() {
    Interact.update(state => {
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
    return getToDate().subtract(1, timespan.unit);
  }

  function getToDate() {
    return dayjs(state.date);
  }

  function removeCompare(compare) {
    state.compare = state.compare.filter(row => {
      return row != compare;
    });
    rememberCompare();
  }

  function getQueryTerm() {
    let rawTerm = getLastTerm();
    let type = getType(rawTerm);
    return rawTerm;
    // if (state.lookupStack.length) {
    //   return state.lookupStack[state.lookupStack.length - 1];
    // } else {
    //   // Get the Base One
    //   if (types.hasOwnProperty($Interact.stats.activeType)) {
    //     return `${types[$Interact.stats.activeType].prefix}${$Interact.stats.activeTag}`;
    //   } else {
    //     return $Interact.stats.activeTag;
    //   }
    // }
  }

  function getType(str) {
    return NoteDataTypes.parse(str);
  }

  async function compareTracker() {
    let trackers = await Interact.select("tracker", true);
    if (trackers.length) {
      for (var i = 0; i < trackers.length; i++) {
        const tracker = trackers[i];
        let compareObj = new StatsRef({
          type: "tracker",
          key: tracker.tag,
          label: tracker.label,
          base: tracker,
          is24Hour: $UserStore.meta.is24Hour
        });
        await compareObj.getStats(state.timeSpan, getFromDate(), getToDate());
        state.compare.push(compareObj);
      }
      state.compare = state.compare;
      rememberCompare();
    }
  }

  function rememberCompare() {
    let comparing = state.compare.map(statRef => statRef.getSearchTerm());
    remember("compare", comparing);
  }

  async function comparePerson() {
    let people = await Interact.select("person", true);
    if (people.length) {
      for (var i = 0; i < people.length; i++) {
        const person = people[i];
        let compareObj = new StatsRef({
          type: "person",
          key: person.username,
          label: person.displayName,
          base: person,
          is24Hour: $UserStore.meta.is24Hour
        });
        await compareObj.getStats(state.timeSpan, getFromDate(), getToDate());
        state.compare.push(compareObj);
      }
      state.compare = state.compare;
      rememberCompare();
    }
  }

  async function getLogsForSelected() {
    console.log();

    return [];
  }

  async function compareContext() {
    let contexts = await Interact.select("context", true);
    if (contexts.length) {
      for (var i = 0; i < contexts.length; i++) {
        const context = contexts[i];
        let compareObj = new StatsRef({
          type: "context",
          key: context,
          label: context,
          base: context,
          is24Hour: $UserStore.meta.is24Hour
        });
        await compareObj.getStats(state.timeSpan, getFromDate(), getToDate());
        state.compare.push(compareObj);
      }
      state.compare = state.compare;
      rememberCompare();
    }
  }

  async function compareSearchTerm() {
    let item = await Interact.prompt("Term");
    if (item) {
      let compareObj = new StatsRef({
        type: "search",
        key: item,
        label: item,
        base: item,
        is24Hour: $UserStore.meta.is24Hour
      });
      await compareObj.getStats(state.timeSpan, getFromDate(), getToDate());
      state.compare.push(compareObj);
    }
    state.compare = state.compare;
    rememberCompare();
  }

  async function compareType() {
    let types = ["Tracker", "Person", "Context", "Search Term"];
    Interact.popmenu({
      buttons: types.map(type => {
        return {
          title: `${type}...`,
          async click() {
            switch (type) {
              case "Tracker":
                await compareTracker();
                setView(dataViews.compare);
                break;
              case "Person":
                await comparePerson();
                setView(dataViews.compare);
                break;
              case "Context":
                await compareContext();
                setView(dataViews.compare);
                break;
              case "Search Term":
                await compareSearchTerm();
                setView(dataViews.compare);
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
    const gotoToday = {
      title: "Today",
      click: () => {
        changeDate(dayjs());
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
    if (dayjs().format("DD-MM-YYYY") !== state.date.format("DD-MM-YYYY")) {
      buttons.push(gotoToday);
    }
    buttons.push(startOfWeek);
    buttons.push(startOfMonth);
    buttons.push(startOfYear);

    Interact.popmenu({ title: "Stat Options", buttons });
  }

  function getTracker() {
    return getType(getLastTerm()).tracker;
  }

  function getLastTerm() {
    return $Interact.stats.terms[$Interact.stats.terms.length - 1];
  }

  async function getStats() {
    state.loading = true;
    let payload = {
      search: getQueryTerm(),
      start: getFromDate(),
      end: getToDate()
    };
    // if day - normalize start and end
    if (state.timeSpan == "d") {
      payload.start = dayjs(state.date).startOf("day");
      payload.end = dayjs(state.date).endOf("day");
    }

    let results = await LedgerStore.query(payload);
    const statsV5 = new StatsV5({ is24Hour: $UserStore.meta.is24Hour });
    state.stats = statsV5.generate({
      rows: results,
      fromDate: getFromDate(),
      toDate: getToDate(),
      mode: state.timeSpan,
      tracker: getTracker()
    });

    // if (state.timeSpan !== "y") {

    // } else {
    //   // don't  do related for the the year - too heavy.
    //   state.related = [];
    // }
    let savedCompares = remember("compare");
    if (state.compare.length == 0 && savedCompares) {
      savedCompares.forEach(searchTerm => {
        let type = NoteDataTypes.parse(searchTerm);
        state.compare.push(
          new StatsRef({
            type: type.type,
            key: type.tracker.tag,
            label: type.tracker.label,
            base: type.tracker,
            is24Hour: $UserStore.meta.is24Hour
          })
        );
      });
    }

    for (let i = 0; i < state.compare.length; i++) {
      let stats = await state.compare[i].getStats(
        state.timeSpan,
        payload.start,
        payload.end
      );
    }

    state.related = statsV5.getRelated(results);
    await tick(100);
    state.compare = state.compare;

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
            name: row.location,
            log: row
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

  function clearSelected() {
    state.selected = { index: undefined, rows: null };
  }

  async function setSelected(selected) {
    state.selected = selected;

    let payload = {
      start: dayjs(state.selected.point.date).startOf("day"),
      end: dayjs(state.selected.point.date).endOf("day"),
      limit: 100
    };
    // if day - normalize start and end
    if (state.timeSpan == "d") {
      payload.start = dayjs(state.selected.point.date).startOf("hour");
      payload.end = dayjs(state.selected.point.date).endOf("hour");
    }
    let rows = await LedgerStore.query(payload);
    state.selected.rows = rows;

    return rows;
  }

  function getLogs() {
    if (state.selected.rows) {
      return state.selected.rows;
    } else {
      return state.stats.rows;
    }
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

  let lastTerms;
  $: if ($Interact.stats.terms.join(",") !== lastTerms) {
    lastTerms = $Interact.stats.terms.join(",");
    main();
    state.currentTerm = getLastTerm();
    state.currentColor = getTracker().color;
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
  $: dateFormat = $UserStore.meta.is24Hour ? "DD/MM/YYYY" : "MMM Do YYYY";
</script>

<style lang="scss">
  :global(.stats-modal) {
    z-index: 1300 !important;
  }

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
  :global(.chart-item) {
    position: relative;
    .btn-close {
      position: absolute;
      top: -4px;
      right: -6px;
      padding: 0;
      height: 24px;
      width: 24px;
      background-color: #000;
    }
  }
</style>

<NModal className="stats-modal" bodyClass="bg-solid-1 " fullscreen>
  <header slot="raw-header" class="box-shadow-float">
    {#if $Interact.stats.terms.length > 1}
      {#each $Interact.stats.terms as term}
        <div class="mock-header mock-header">
          <span>{term}</span>
        </div>
      {/each}
    {/if}
    <div
      class="mock-card-animation animate up {state.showAnimation ? 'visible' : 'hidden'}" />
    <NToolbarGrid>
      <div slot="left" className="truncate" style="min-width:100px;">
        {#if $Interact.stats.terms.length == 1}
          <button class="btn btn-clear tap-icon clickable" on:click={close}>
            <NIcon name="close" size="22" />
          </button>
        {:else}
          <button class="btn btn-clear tap-icon clickable pl-1" on:click={back}>
            <NIcon name="arrowBack" size="22" />
            <small
              class="text-sm text-inverse-2 ml-1 truncate"
              style="max-width:60px;">
              {$Interact.stats.terms[$Interact.stats.terms.length - 2]}
            </small>
          </button>
        {/if}
      </div>

      <h1 class="title truncate" slot="main">{state.currentTerm}</h1>

      <div
        slot="right"
        style="min-width:100px"
        class="toolbar-buttons align-right">
        <button class="btn btn-clear tap-icon clickable" on:click={onMoreTap}>
          <NIcon name="more" />
        </button>
      </div>
    </NToolbarGrid>
    <div class="n-row pb-2 px-2">
      <NButtonGroup size="sm" buttons={state.timeOption} />
    </div>

    <NToolbarGrid>
      <button
        class="btn btn-clear text-primary-bright clickable pr-1 pl-1"
        slot="left"
        on:click={loadPreviousDate}>
        <NIcon name="chevronLeft" className="fill-primary-bright" />
        Prev
      </button>
      <div class="time-range truncate" slot="main">{state.range}</div>
      <button
        class="btn btn-clear text-primary-bright clickable pl-1 pr-1"
        slot="right"
        on:click={loadNextDate}>
        Next
        <NIcon name="chevronRight" className="fill-primary-bright" />
      </button>
    </NToolbarGrid>

    {#if state.stats && !state.loading}
      <div class="main-chart px-2 pb-1">
        <NBarChart
          height={140}
          color={state.currentColor}
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
            setSelected(event.detail);
          }}
          activeIndex={state.selected.index} />
      </div>
    {/if}

    {#if state.selected.rows && state.dataView == 'logs'}
      <NToolbar className="text-center">
        <div class="filler" />
        <span class="text-sm text-inverse-2">
          All Logs for {state.selected.point.date.format('MMM Do YYYY')}
        </span>
        <button class="btn btn-light btn-sm ml-2" on:click={clearSelected}>
          <NIcon name="close" size="16" />
          Close
        </button>
        <div class="filler" />
      </NToolbar>
    {/if}

  </header>

  <div slot="footer" class="w-100">
    <NButtonGroup
      inverse
      color={state.currentColor}
      buttons={state.viewOption} />
  </div>

  {#if state.loading}
    <div class="container n-panel center-all">
      <div style="margin-top:-50px;">
        <NSpinner size={46} />
      </div>
    </div>
  {:else}
    {#if state.dataView == 'compare'}
      <div class="charts">
        {#each state.compare as compare}
          <NItem className="solo chart-item">
            <NBarChart
              height={110}
              title={compare.getSearchTerm()}
              color={compare.getTracker().color}
              labels={compare.stats.chart.values.map(point => point.x)}
              points={compare.stats.chart.values}
              on:swipeLeft={loadNextDate}
              on:swipeRight={loadPreviousDate}
              xFormat={(x, index) => {
                return x;
              }}
              on:titleClick={event => {
                Interact.openStats(compare.getSearchTerm());
              }}
              on:tap={event => {
                setSelected(event.detail);
              }}
              yFormat={y => {
                return compare.getTracker().displayValue(y);
              }}
              activeIndex={state.selected.index} />
            <button
              class="btn btn-clear btn-close"
              on:click={() => {
                removeCompare(compare);
              }}>
              <NIcon name="close" className="fill-white" size="16" />
            </button>
          </NItem>
        {/each}
      </div>

      {#if state.compare.length == 0}
        <div class="p-2" />
      {/if}

      <div class="p-2 pt-2">
        <button class="btn btn-light btn-block" on:click={compareType}>
          {Lang.t('stats.select-comparison', 'Select Comparison')}...
        </button>
      </div>
    {/if}
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

          {#if state.related.length}
            <HScroller className="related-items p-2 px-3">
              {#each state.related as item}
                {#if item.search != state.currentTerm}
                  <button
                    class="btn btn-badge"
                    on:click={() => {
                      Interact.openStats(item.search);
                    }}>
                    {#if item.type == 'person'}
                      <Dymoji
                        person={$PeopleStore.people[item.value]}
                        className="mr-2"
                        size={20}
                        radius={0.3} />
                    {/if}
                    {#if item.type == 'tracker'}
                      {TrackerStore.getByTag(item.value).emoji}
                    {/if}
                    {item.search}
                    <span class="count">{item.count}</span>
                  </button>
                {/if}
              {/each}
            </HScroller>
          {/if}

        </div>
        <!-- end over view -->
      {:else if state.dataView == 'time'}
        <NTimeGrid
          color={state.currentColor}
          rows={state.stats.rows}
          className="flex-grow flex-shrink"
          style="min-height:100%" />
      {:else if state.dataView == 'logs'}
        <NLogList
          compact
          on:textClick={evt => {
            if (evt.detail.type == 'tracker') {
              Interact.openStats(`#${evt.detail.tracker.tag}`);
            } else {
              Interact.openStats(`${evt.detail.value}`);
            }
          }}
          on:trackerClick={evt => {
            Interact.openStats(`#${evt.detail.tracker.tag}`);
          }}
          logs={state.selected.rows || state.stats.rows}
          style="min-height:100%"
          className="bg-solid-1 flex-grow flex-shrink" />
      {/if}
    {/if}
  {/if}
</NModal>
