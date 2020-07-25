<script lang="ts">
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
  import Logger from "../../utils/log/log";
  const console = new Logger("📊 container/dashboard.svelte");

  //Vendors
  import { navigate, Router, Route } from "svelte-routing";

  import { Block } from "../../modules/dashboard/block";

  // Modules
  import Tracker from "../../modules/tracker/tracker";
  // Components
  import NText from "../../components/text/text.svelte";
  // containers
  import NLayout from "../layout/layout.svelte";
  import { DashboardStore } from "../../store/dashboard-store";
  import Modal from "../../components/modal/modal.svelte";
  import DashblockEditor from "./dashblock-editor.svelte";
  import { Interact } from "../../store/interact";
  import Button from "../../components/button/button.svelte";

  import { positivityFromLogs } from "../../utils/positivity/positivity";
  import Stepper from "../../components/stepper/stepper.svelte";
  import Dashboard from "../../routes/dashboard.svelte";
  import Log from "../../utils/log/log";

  let trackers;
  let people;
  let dashboards;
  let unsubTrackers;
  let unsubDashboard;
  let unsubPeople;
  let ready = false;
  let editingBlock = null;

  let editMode = false;

  function toggleEdit() {
    editMode = !editMode;
  }

  async function saveBlock(): void {
    if (editingBlock) {
      Interact.blocker("Saving...");
      try {
        await DashboardStore.saveBlock(editingBlock);
      } catch (e) {
        Interact.alert("Error", e.message);
      }
      Interact.stopBlocker();
      clearEditing();
    } else {
      Interact.toast("Incomplete");
    }
  }

  async function newBlock() {
    editingBlock = new Block();
  }

  onMount(() => {
    unsubTrackers = TrackerStore.subscribe((tkrs) => {
      if (tkrs.trackers) {
        trackers = tkrs.trackers;
      }
    });
    unsubPeople = PeopleStore.subscribe((pple) => {
      if (pple.people) {
        people = pple.people;
      }
    });
    unsubDashboard = DashboardStore.subscribe((dbStore) => {
      if (dbStore.dashboards.length) {
        dashboards = dbStore.dashboards;
        initDashboard();
      }
    });
  });

  onDestroy(() => {
    unsubTrackers();
    unsubPeople();
    unsubDashboard();
  });

  async function getBlockData(block) {}

  function editBlock(block) {
    block._editing = true;
    editingBlock = block;
  }

  function getStartEndDates(dboard) {
    let start = null;
    let end = null;
    dboard.blocks.forEach((block: Block) => {
      let dateRange = block.getDateRange();
      let tStart = dateRange[0];
      let tEnd = dateRange[1];
      if (tEnd > end || !end) {
        end = tEnd;
      }
      if (tStart < start || !start) {
        start = tStart;
      }
    });
    return { start, end };
  }

  async function getLogsForBlock(block: Block): Promise<Array<any>> {
    let logs = [];
    const dateRange = block.getDateRange();
    const start = dateRange[0];
    const end = dateRange[1];

    if (block.element && block.element.type == "tracker") {
      logs = await LedgerStore.queryTag(block.element.id, start, end);
    } else if (block.element && block.element.type == "person") {
      logs = await LedgerStore.queryPerson(block.element.id, start, end);
    } else if (block.element && block.element.type == "context") {
      logs = await LedgerStore.queryContext(block.element.id, start, end);
    }

    return logs;
  }

  async function loadActiveDashboard() {
    const dboard = dashboards[$DashboardStore.activeIndex];
    let { start, end } = getStartEndDates(dboard);
    for (let i = 0; i < dboard.blocks.length; i++) {
      const block = dboard.blocks[i];

      if (block.element) {
        block.logs = await getLogsForBlock(block);

        const statsV5 = new StatsProcessor();
        // Generate Stats
        block.math = block.math || (block.element.obj || {}).math || "sum";

        const fromDate = dayjs(start);
        const toDate = dayjs(end);
        const dayDiff = Math.abs(fromDate.diff(toDate, "day"));
        let mode = "w";

        if (dayDiff < 8) {
          mode = "w";
        } else if (dayDiff < 91) {
          mode = "m";
        } else if (dayDiff < 365) {
          mode = "q";
        } else if (dayDiff > 365) {
          mode = "y";
        } else {
          mode = "m";
        }

        block.stats = statsV5.generate({
          rows: block.logs,
          fromDate,
          toDate,
          mode,
          math: block.math, //state.tracker.math
          trackableElement: block.element,
        });

        block.positivity = positivityFromLogs(block.logs, block.element);
      }

      dboard.blocks[i] = block;
    }
    activeDashboard = dboard;
  }

  let activePage = 0;
  let lastActivePage;
  let activeDashboard = { label: "Loading...", blocks: [] };

  function initDashboard() {
    dashboards[$DashboardStore.activeIndex].blocks = dashboards[$DashboardStore.activeIndex].blocks.map((block) => {
      let nBlock = new Block(block);
      if (nBlock.element && nBlock.element.type == "tracker" && trackers[nBlock.element.id]) {
        nBlock.element.obj = trackers[nBlock.element.id];
      } else if (nBlock.element && nBlock.element.type == "person" && people[nBlock.element.id]) {
        nBlock.element.obj = people[nBlock.element.id];
      }
      return nBlock;
    });
    loadActiveDashboard();
  }

  $: if (trackers && people && dashboards && activePage !== lastActivePage) {
    lastActivePage = activePage;
    // initDashboard();
  }

  function clearEditing() {
    editingBlock = false;
  }

  async function rename() {
    let newName = await Interact.prompt("Rename Dashboard", null, {
      value: activeDashboard.label,
    });
    if (newName) {
      $DashboardStore.dashboards[$DashboardStore.activeIndex].label = newName;
      DashboardStore.save();
    }
  }
</script>

<style lang="scss">
  .dashboard-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 10px 16px 16px;
    justify-content: space-between;
    align-content: flex-start;
  }
</style>

<NLayout className="dasboard" pageTitle="Dashboard" showTabs={true}>

  <div slot="header" class="n-toolbar-grid container">
    <div class="left">
      <Button color="clear" on:click={DashboardStore.newDashboard}>Add</Button>
    </div>
    <div class="main title">
      <div class="n-row">
        <div class="n-filler" />
        <Stepper single dark steps={(dashboards || []).length} current={$DashboardStore.activeIndex} />
        <div class="n-filler" />
      </div>
    </div>
    <div class="right">
      <Button color="clear" on:click={toggleEdit}>{editMode ? 'Done' : 'Edit'}</Button>
    </div>
  </div>

  <div class="container h-100">
    <div class="n-toolbar n-row px-2">
      <Text size="xl" className="px-2 filler" bold on:click={rename}>
        <span style="border-bottom:dotted 1px rgba(100,100,100,0.4)">{activeDashboard.label}</span>
      </Text>
      {#if (dashboards || []).length}
        <Button color="clear" on:click={DashboardStore.previous}>
          <Icon name="chevronLeft" />
        </Button>
        <Button color="clear" on:click={DashboardStore.next}>
          <Icon name="chevronRight" />
        </Button>
      {/if}
    </div>
    {#if !editMode}
      <div class="dashboard-wrapper h-100" on:swipeleft={DashboardStore.next} on:swiperight={DashboardStore.previous}>
        {#if people && trackers}
          {#each activeDashboard.blocks as block}
            <Dashblock
              {block}
              on:click={() => {
                editBlock(block);
              }} />
          {/each}
        {/if}
        <button class="btn btn-round btn-light btn-block mx-auto my-2" style="max-width:300px;" on:click={newBlock}>
          <Icon name="add" size="24" />
          Add Block
        </button>
      </div>
    {:else}
      <div class="mt-2" />
      <SortableList
        items={activeDashboard.blocks || []}
        handle=".menu-handle"
        key="id"
        on:update={(sorted) => {
          activeDashboard.blocks = sorted.detail;
          DashboardStore.update((state) => {
            state.dashboards[$DashboardStore.activeIndex] = activeDashboard;
            return state;
          });
          DashboardStore.save();
        }}
        let:item>
        <ListItem solo className="pb-2" title={item.getTitle()}>
          <Text size="sm">
            {#if item.timeRange}{item.timeRange.getLabel()}{/if}
            <span class="opacity-5">{item.type}</span>
          </Text>
          <div slot="right" class="menu-handle">
            <Icon name="menu" />
          </div>
        </ListItem>
      </SortableList>
    {/if}
  </div>

  <Modal show={editingBlock}>
    <div class="n-toolbar-grid" slot="header">
      <button class="btn btn-clear left" on:click={clearEditing}>
        <Icon name="close" />
      </button>
      <div class="main">Block Editor</div>
      <button class="btn btn-clear right" on:click={saveBlock}>
        {#if editingBlock && editingBlock._editing}Update{:else}Save{/if}
      </button>

    </div>
    {#if editingBlock}
      <DashblockEditor bind:value={editingBlock} on:close={clearEditing} />
    {/if}
  </Modal>

</NLayout>
