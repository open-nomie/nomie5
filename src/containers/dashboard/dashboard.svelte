<script>
  import Text from "./../../components/text/text.svelte";
  import Icon from "./../../components/icon/icon.svelte";
  import ListItem from "./../../components/list-item/list-item.svelte";
  import SortableList from "./../../components/sortable-list/sortable-list.svelte";
  import dayjs from "dayjs";
  import { LedgerStore } from "./../../store/ledger.js";
  import { onMount, onDestroy } from "svelte";
  import { PeopleStore } from "./../../store/people-store.js";
  import { TrackerStore } from "./../../store/tracker-store.js";
  import StatsProcessor from "../../modules/stats/statsV5";
  import TrackerSmallBlock from "./../../components/tracker-ball/tracker-small-block.svelte";
  import Dashblock from "./dashblock.svelte";

  //Vendors
  import { navigate, Router, Route } from "svelte-routing";

  import { Block } from "./block";

  // Modules
  import Tracker from "../../modules/tracker/tracker";
  // Components
  import NText from "../../components/text/text.svelte";
  // containers
  import NLayout from "../layout/layout.svelte";

  let trackers;
  let people;
  let unsubTrackers;
  let unsubPeople;
  let ready = false;

  onMount(() => {
    unsubTrackers = TrackerStore.subscribe(tkrs => {
      if (tkrs.trackers) {
        trackers = tkrs.trackers;
        // console.log("trackers", trackers);
      }
    });
    unsubPeople = PeopleStore.subscribe(pple => {
      if (pple.people) {
        people = pple.people;
        // console.log({ people });
      }
    });
  });

  onDestroy(() => {
    unsubTrackers();
    unsubPeople();
  });

  async function getBlockData(block) {}

  function getStartEndDates(dboard) {
    let start = null;
    let end = null;
    dboard.forEach(block => {
      let tStart = block.dateRange.start.date.toDate();
      let tEnd = block.dateRange.end.date.toDate();
      if (tEnd > end || !end) {
        end = tEnd;
      }
      if (tStart < start || !start) {
        start = tStart;
      }
    });
    return { start, end };
  }

  async function getLogsForBlock(block) {
    let logs = [];
    const start = block.dateRange.start.date.toDate();
    const end = block.dateRange.end.date.toDate();
    if (block.element.type == "tracker") {
      logs = await LedgerStore.queryTag(block.element.id, start, end);
    } else if (block.element.type == "person") {
      logs = await LedgerStore.queryPerson(block.element.id, start, end);
    } else if (block.element.type == "context") {
      logs = await LedgerStore.queryContext(block.element.id, start, end);
    }
    return logs;
  }

  async function getActiveBoardData(dboard) {
    let { start, end } = getStartEndDates(dboard);
    for (let i = 0; i < dboard.length; i++) {
      const block = dboard[i];
      block.logs = await getLogsForBlock(block);

      const statsV5 = new StatsProcessor();
      // Generate Stats
      block.math = block.math || (block.element.obj || {}).math || "sum";

      block.stats = statsV5.generate({
        rows: block.logs,
        fromDate: dayjs(start),
        toDate: dayjs(end),
        mode: "w",
        math: block.math, //state.tracker.math
        trackableElement: block.element
      });

      dboard[i] = block;
      // console.log("logs for block", block);
    }
    activeDashboard = dboard;
  }

  const dashboard = [
    [
      {
        element: { type: "tracker", id: "mood" },
        type: "chart",
        dateRange: {
          start: {
            subtract: [30, "days"]
          },
          end: null
        }
      },
      {
        element: { type: "tracker", id: "mood" },
        type: "value",
        dateRange: {
          label: "Last Week",
          start: {
            startOf: "week",
            subtract: [7, "days"]
          },
          end: {
            endOf: "week",
            subtract: [7, "days"]
          }
        }
      },
      {
        element: { type: "tracker", id: "mood" },
        type: "value",
        dateRange: {
          label: "Today",
          start: {
            startOf: "day"
          },
          end: {
            endOf: "day"
          }
        }
      },
      {
        element: { type: "tracker", id: "soda" },
        type: "value",
        dateRange: {
          label: "Yesterday",
          start: {
            startOf: "day",
            subtract: [1, "day"]
          },
          end: {
            endOf: "day",
            subtract: [1, "day"]
          }
        }
      },
      {
        element: { type: "person", id: "emily" },
        type: "positivity"
      }
    ]
  ];

  let pageCount = dashboard.length;
  let activePage = 0;
  let lastActivePage;
  let activeDashboard = dashboard[0];

  $: if (trackers && people && activePage !== lastActivePage) {
    lastActivePage = activePage;
    activeDashboard = dashboard[activePage].map(block => {
      let nBlock = new Block(block);
      if (nBlock.element.type == "tracker" && trackers[nBlock.element.id]) {
        nBlock.element.obj = trackers[nBlock.element.id];
      } else if (nBlock.element.type == "person" && people[nBlock.element.id]) {
        nBlock.element.obj = people[nBlock.element.id];
      }
      return nBlock;
    });
    getActiveBoardData(activeDashboard);
  }
</script>

<style lang="scss">
  .dashboard-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 16px;
    justify-items: stretch;
  }
</style>

<NLayout className="dasboard" pageTitle="Dashboard" showTabs={true}>

  <div slot="header" class="n-toolbar-grid container">
    <div class="left" />
    <div class="main title">••••</div>
    <div class="right" />
  </div>

  <div class="container">
    <div class="dashboard-wrapper">
      {#if people && trackers}
        {#each activeDashboard as block}
          <Dashblock {block} />
        {/each}
      {/if}
    </div>
    <SortableList
      items={activeDashboard || []}
      handle=".menu-handle"
      on:update={sorted => {
        console.log('Sorted', sorted.detail);
        activeDashboard = sorted.detail;
      }}
      let:item>
      <ListItem>
        <Text bold>{item.element.id}</Text>
        <Text size="sm">{item.type} {item.dateRange}</Text>
        <div slot="right" class="menu-handle">
          <Icon name="menu" />
        </div>
      </ListItem>
    </SortableList>
  </div>

</NLayout>
