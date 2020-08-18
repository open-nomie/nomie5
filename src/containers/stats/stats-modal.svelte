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

  import { strToColor } from "../../components/dymoji/dymoji";

  // Utils
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
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

  function getScore() {
    let scores = [];
    state.stats.rows.forEach((row) => {
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

  function removeCompare(compare) {
    state.compare = state.compare.filter((row) => {
      return row != compare;
    });
    rememberCompare();
  }

  function getTrackableElement(str) {
    let type = extractor.toElement(str);
    if (type.type == "tracker") {
      type.obj = $TrackerStore.trackers[type.id];
    }
    return type;
  }

  function scoreDistance(distance) {
    if (distance >= 100) {
      return 1;
    } else {
      return Math.abs(Math.round(distance - 100));
    }
  }

  /**
   * RSquared
   * A crazy ass function!!!
   * This will load up the the stats for EVERY tracker
   * for the current time period, and run a
   * RSquared distance function on each to identify
   * any that have simular patterns.
   */
  async function findRelatedTrackers() {
    Interact.blocker("Looking for related...");
    // Clear Compare
    state.compare = [];
    await tick(40);
    let compareItems = {};
    let trackerTags = Object.keys($TrackerStore.trackers);
    let activeTrackerValues = state.stats.chart.values.map((point) => point.y);
    // Loop over trackers
    for (var i = 0; i < trackerTags.length; i++) {
      let tag = trackerTags[i]; // get tag
      let tracker = $TrackerStore.trackers[tag]; // get tracker
      let results = await getTrackerStats(tracker); // get stats
      let compareValues = results.stats.chart.values.map((point) => point.y); // get y values
      let distance = await DataDistance.score(activeTrackerValues, compareValues); // calculate distance
      results.distance = distance;
      compareItems[tag] = {
        stats: results,
        distance: distance,
      };
    }
    // Generate Results
    let maxScore = 0;
    let results = Object.keys(compareItems)
      .map((tag) => {
        return {
          tag,
          stats: compareItems[tag].stats,
          value: compareItems[tag].distance,
        };
      })
      // Remove any 0 values (exact match)
      .filter((r) => r.value && !isNaN(r.value))
      .sort((a, b) => {
        if (a.value > maxScore) {
          maxScore = a.value;
        }
        // Sort by Lowest value
        return a.value > b.value ? -1 : 1;
      })
      // Remove anything over 5000 and only 5
      .filter((r, index) => {
        if (index < 11) {
          return true;
        } else {
          return false;
        }
      })
      .map((r) => {
        r.stats.distance = math.percentage(maxScore, r.value);
        return r;
      });

    // Loop over results
    for (var i = 0; i < results.length; i++) {
      let tag = results[i].tag;
      let tracker = $TrackerStore.trackers[tag];
      if (tracker) {
        let stats = compareItems[tag].stats;
        state.compare.push(stats);
      }
    }
    // Hit it again for svelte array
    state.compare = state.compare;
    // Save trackers for later
    rememberCompare();
    // Close blocker
    Interact.stopBlocker();
  }

  async function getTrackerStats(tracker) {
    let compareObj = new StatsRef({
      type: "tracker",
      key: tracker.tag,
      label: tracker.label,
      base: tracker,
      is24Hour: $UserStore.meta.is24Hour,
    });
    await compareObj.getStats(state.timeSpan, getFromDate(), getToDate());
    return compareObj;
  }

  async function compareTracker() {
    let trackers = await Interact.select("tracker", true);
    if (trackers.length) {
      for (var i = 0; i < trackers.length; i++) {
        const tracker = trackers[i];
        const compareObj = await getTrackerStats(tracker);
        state.compare.push(compareObj);
      }
      state.compare = state.compare;
      rememberCompare();
    }
  }

  function rememberCompare() {
    let comparing = state.compare.map((statRef) => statRef.getSearchTerm());
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
          is24Hour: $UserStore.meta.is24Hour,
        });
        await compareObj.getStats(state.timeSpan, getFromDate(), getToDate());
        state.compare.push(compareObj);
      }
      state.compare = state.compare;
      rememberCompare();
    }
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
          is24Hour: $UserStore.meta.is24Hour,
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
        is24Hour: $UserStore.meta.is24Hour,
      });
      await compareObj.getStats(state.timeSpan, getFromDate(), getToDate());
      state.compare.push(compareObj);
    }
    state.compare = state.compare;
    rememberCompare();
  }

  async function compareType() {
    let types = ["Tracker", "Person", "Context", "Search Term", "Pick for me"];
    Interact.popmenu({
      buttons: types.map((type) => {
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
              case "Pick for me":
                await findRelatedTrackers();
                setView(dataViews.compare);
                break;
            }
          },
        };
      }),
    });
  }

  function onMoreTap() {
    let buttons = [];
    const compare = {
      title: "Compare to...",
      click() {
        compareType();
      },
    };
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
    const viewStreak = {
      title: "View Streak",
      click: () => {
        Interact.openStreak(state.currentTerm);
      },
    };

    const editElement = {
      title: `Edit ${state.currentTerm}`,
      click: () => {
        if (state.trackableElement.type == "tracker") {
          Interact.editTracker(TrackerStore.byTag(state.trackableElement.id));
        } else if (state.trackableElement.type == "person") {
          Interact.person(state.trackableElement.id);
        }
      },
    };

    buttons.push(compare);
    if (dayjs().format("DD-MM-YYYY") !== state.date.format("DD-MM-YYYY")) {
      buttons.push(gotoToday);
    }
    buttons.push(startOfWeek);
    buttons.push(startOfMonth);
    buttons.push(startOfYear);
    buttons.push(viewStreak);
    // If it's a person or tracker
    if (state.trackableElement.type.search(/tracker|person/) > -1) {
      buttons.push(editElement);
    }

    //state.trackableElement
    Interact.popmenu({ title: "Stat Options", buttons });
  }

  function getLastTerm() {
    let lastTerm = $Interact.stats.terms[$Interact.stats.terms.length - 1];
    return lastTerm;
  }

  async function loadSavedCompares(queryPayload) {
    let savedCompares = remember("compare");
    // If we do - then lets load them each up
    if (state.compare.length == 0 && savedCompares) {
      // Loop over compares
      (savedCompares || [])
        .filter((row) => row)
        .forEach((searchTerm) => {
          let type = extractor.toElement(searchTerm);
          type.obj = type.type == "tracker" ? TrackerStore.byTag(type.id) : {};
          state.compare.push(
            new StatsRef({
              type: type.type,
              key: type.id,
              math: type.obj.math || "sum",
              label: type.id,
              base: type.obj,
              is24Hour: $UserStore.meta.is24Hour,
            })
          );
        });
    }
    // Get Stats for Compares
    for (let i = 0; i < state.compare.length; i++) {
      let stats = await state.compare[i].getStats(state.timeSpan, queryPayload.start, queryPayload.end);
    }
  } // end load saved compares

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
    loadSavedCompares(queryPayload);

    state.related = statsV5.getRelated();
    await tick(100);
    state.compare = state.compare;

    state.loading = false;
  } // end getStats()

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

  function formatValue(value, includeUnit) {
    let tracker = state.tracker;
    if (state.tracker) {
      return state.tracker.displayValue(value, includeUnit);
    }
    return value;
  }

  function getMonthRange() {
    const from = getFromDate();
    const to = getToDate();
    return `${from.add(1, "day").format("MMM D")} - ${to.format("MMM D YYYY")}`;
  }

  function getYearRange() {
    const from = getFromDate();
    const to = getToDate();
    return `${from.add(1, "month").format("MMM D YYYY")} - ${to.format("MMM D YYYY")}`;
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
    if (state.selected !== selected) {
      _setSelected(selected);
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
        return row.note.match(state.trackableElement.toSearchTerm());
      });
    } else {
      state.selected.rows = rows;
    }

    return state.selected.rows;
  }

  function getLogs() {
    if (state.selected.rows) {
      return state.selected.rows;
    } else {
      return state.stats.rows;
    }
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
  $: dateFormat = $UserStore.meta.is24Hour ? "DD/MM/YYYY" : "MMM Do YYYY";

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

  .time-range {
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
    line-height: 1rem;
  }
  :global(.stats-modal .n-modal) {
    max-width: 500px !important;
  }

  :global(.chart-item.solo.n-item) {
    margin: 8pt 0;
    width: calc(100% - 0px);
    border-radius: 0px;
  }

  :global(.chart-item) {
    position: relative;
    .btn-close {
      position: absolute;
      top: 5px;
      left: 6px;
      padding: 0;
      height: 20px;
      width: 20px;
      border: solid 1px var(--color-solid-2);
      background-color: var(--color-solid);
      svg {
        height: 18px;
        width: 18px;
      }
    }
  }

  .distance {
    font-size: 12px;
    color: var(--color-solid-3);
    position: absolute;
    top: 10px;
    right: 16px;
    text-align: center;
  }
  :global(.chart-item .btn-close svg) {
    fill: var(--color-inverse) !important;
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

    <NToolbarGrid>
      <button class="btn btn-clear text-primary-bright clickable pr-1 pl-1" slot="left" on:click={loadPreviousDate}>
        <NIcon name="chevronLeft" className="fill-primary-bright" />
        Prev
      </button>
      <div class="time-range truncate" slot="main">{state.range}</div>
      <button class="btn btn-clear text-primary-bright clickable pl-1 pr-1" slot="right" on:click={loadNextDate}>
        Next
        <NIcon name="chevronRight" className="fill-primary-bright" />
      </button>
    </NToolbarGrid>

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
      <div class="charts">

        {#each state.compare as compare (compare.id)}
          {#if compare.stats}
            <NItem className="solo chart-item">
              {#if compare.distance}
                <div class="distance">
                  <strong>{compare.distance.toFixed(0)}</strong>
                </div>
              {/if}

              <NBarChart
                height={120}
                hideYTicks
                title={`${compare.getSearchTerm()}`}
                color={compare.getTracker().color}
                labels={compare.stats.chart.values.map((point) => point.x)}
                points={compare.stats.chart.values}
                on:swipeLeft={loadNextDate}
                on:swipeRight={loadPreviousDate}
                xFormat={(x, index) => {
                  return x;
                }}
                on:more={(evt) => {
                  Interact.onThisDay(evt.detail.date.toDate());
                }}
                on:titleClick={(event) => {
                  Interact.openStats(compare.getSearchTerm());
                }}
                on:tap={(event) => {
                  setSelected(event.detail);
                }}
                yFormat={(y) => {
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
          {/if}
        {/each}
      </div>

      {#if state.compare.length == 0}
        <div class="p-2" />
      {/if}

      <div class="p-2 pt-2">
        <button class="btn btn-light btn-block" on:click={compareType}>{Lang.t('stats.select-comparison', 'Select Comparison')}...</button>
      </div>
    {/if}
    {#if state.dataView == 'map'}
      <NMap small locations={getLocations()} className="flex-grow flex-shrink" />
    {/if}
    {#if state.stats}
      {#if state.dataView == 'overview'}
        <div class="overview py-2 flex-grow flex-shrink">
          {#if state.stats.math == 'sum'}
            <NItem className="solo" title="Total">
              <div slot="right" class="text-lg text-inverse">{formatValue(state.stats.sum)}</div>
            </NItem>
          {/if}
          <NItem className="solo" title="Average">
            <div slot="right" class="text-lg text-inverse">{formatValue(state.stats.avg)}</div>
          </NItem>
          {#if state.stats.max.value > state.stats.min.value}
            <NItem className="solo" title="Range">
              <div slot="right" class="text-lg text-inverse value">
                {formatValue(state.stats.min.value, false)}
                <span class="text-faded-2 font-weight-normal">to</span>
                {formatValue(state.stats.max.value)}
              </div>
            </NItem>
          {/if}
          <NItem className="solo" title="Score">
            <div slot="right" class="text-lg text-inverse">{getScore()}</div>
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
                      <Dymoji person={$PeopleStore.people[item.value]} className="mr-2" size={20} radius={0.3} />
                    {/if}
                    {#if item.type == 'tracker'}{TrackerStore.byTag(item.value).emoji}{/if}
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
        <div class="bg-solid py-2 pr-2 pl-0">
          <NTimeGrid
            term={state.currentTerm}
            color={state.currentColor}
            rows={state.stats.rows}
            style="min-height:100px;max-height:100px" />

        </div>
        <div class="bg-solid p-2">
          <TimeOfDay statsTod={state.stats.tod} color={state.currentColor} />
        </div>
        <div class="bg-solid p-2">
          <DayOfWeek height={90} statsDow={state.stats.dow} color={state.currentColor} />
        </div>
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

        <!-- {#if state.dataView == 'logs' && (state.timeSpan != 'y' && state.selected.index !== undefined)}
          <NLogList
            compact
            on:textClick={evt => {
              if (evt.detail.type == 'tracker') {
                Interact.openStats(`#${evt.detail.id}`);
              } else {
                Interact.openStats(`${evt.detail.raw}`);
              }
            }}
            on:trackerClick={evt => {
              Interact.openStats(`#${evt.detail.tag}`);
            }}
            logs={state.selected.rows || state.stats.rows}
            style="min-height:100%"
            className="bg-solid-1 flex-grow flex-shrink" />
        {:else if state.dataView == 'logs' && state.timeSpan == 'y'}
          <div class="p-4 text-sm text-center">
            Select a chart month to see the logs.
          </div>
        {/if} -->
      {/if}
    {/if}
  {/if}
</NModal>
