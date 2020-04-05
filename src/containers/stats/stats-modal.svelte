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

  // Components
  import NModal from "../../components/modal/modal.svelte";
  import NButtonGroup from "../../components/button-group/button-group.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NSpinner from "../../components/spinner/spinner.svelte";
  import NKVBlock from "../../components/kv-block/kv-block.svelte";
  import NBarChart from "../../components/charts/bar-chart.svelte";

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

  const types = {
    tracker: { prefix: "#" },
    person: { prefix: "@" },
    context: { prefix: "+" },
    location: { prefix: "" }
  };

  const state = {
    date: dayjs(),
    timeSpan: "w",
    viewOptions: [],
    loading: true,
    stats: null
  };

  function setView(timeSpan) {
    state.timeSpan = timeSpan.id;
  }

  function getTimeSpan() {
    return timeSpans[state.timeSpan];
  }

  function getViewOptionButtons() {
    return Object.keys(timeSpans).map(optionId => {
      let option = timeSpans[optionId];
      return {
        label: option.label,
        active: state.timeSpan === optionId,
        click: () => {
          setView(option);
        }
      };
    });
  }

  function close() {
    Interact.closeStats();
  }

  function getTitle() {
    let title = "Stats";
    switch ($Interact.stats.activeType) {
      case "tracker":
        title = `#${$Interact.stats.activeTag} Stats`;
        break;
      case "person":
        title = `@${$Interact.stats.activeTag} Stats`;
        break;
      case "context":
        title = `+${$Interact.stats.activeTag} Stats`;
        break;
      case "location":
        title = `Location Stats`;
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

  function getWeekRange() {
    const from = getFromDate();
    const to = getToDate();
    if (to.format("MMM") !== from.format("MMM")) {
      return `${from.format("MMM D")} - ${to.format("MMM D YYYY")}`;
    } else {
      return `${from.format("MMM D")} - ${to.format("D YYYY")}`;
    }
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
        range = getMonthRange();
        break;
    }
    return range;
  }

  async function main() {
    state.range = getDateRangeText();
    state.viewOptions = getViewOptionButtons();
    getStats();
  }

  onMount(() => {
    main();
  });

  /** Reactive Functions and Variables **/
  let lastTimeSpan = state.timeSpan;
  $: if (state.timeSpan && state.timeSpan !== lastTimeSpan) {
    console.log("Load Stats Again");
    lastTimeSpan = state.timeSpan;
    main();
  }

  $: timeFormat = $UserStore.meta.is24Hour ? "HH:mm" : "h:mm a";
  $: dateFormat = $UserStore.meta.is24Hour ? "DD/MM/YYYY" : "MMM Do YYYY";
</script>

<style>
  .n-list {
    max-width: 100vw;
    overflow: hidden;
  }
</style>

<NModal className="stats-modal" fullscreen>
  <div slot="raw-header">
    <NToolbarGrid>
      <button
        class="btn btn-clear zmdi zmdi-close"
        on:click={close}
        slot="left" />
      <h1 class="title" slot="main">{getTitle()}</h1>
      <button class="btn btn-clear zmdi zmdi-edit" slot="right" />
    </NToolbarGrid>
    <div class="n-row pb-2 px-2">
      <NButtonGroup size="sm" buttons={state.viewOptions} />
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
  </div>

  {#if state.loading}
    <div class="container n-panel center-all">
      <div style="margin-top:-50px;">
        <NSpinner size={46} />
      </div>
    </div>
  {:else}
    <div class="container">
      {#if state.stats}
        <NBarChart
          height={150}
          color={getTracker().color}
          labels={state.stats.chart.values.map(point => point.x)}
          points={state.stats.chart.values}
          on:tap={event => {
            let newDate;
            state.date = dayjs(event.detail.point.date);
            console.log('Tapped Date');
          }}
          activeIndex={0} />

        <!--
            xFormat={x => {
            console.log('X Format', x);
            return x;
          }}
          yFormat={y => {
            return NomieUOM.format(y, getTracker().uom);
          }}
          -->

        {#if state.stats}
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
            <NItem>
              <NKVBlock
                label="Variance"
                className="filler"
                value={`${formatValue(state.stats.max.value - state.stats.min.value)}`}
                type="row" />
            </NItem>
          {/if}
        {/if}
      {/if}
    </div>
  {/if}
</NModal>
