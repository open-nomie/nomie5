<script lang="ts">
  import { navigate, Router, Route } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";

  import dayjs from "dayjs";

  import Dashblock from "./dashblock.svelte";
  import DashblockEditor from "./dashblock-editor.svelte";

  // Components
  import Button from "../../components/button/button.svelte";
  import Icon from "./../../components/icon/icon.svelte";
  import ListItem from "./../../components/list-item/list-item.svelte";
  import Modal from "../../components/modal/modal.svelte";
  import NText from "../../components/text/text.svelte";
  import SortableList from "./../../components/sortable-list/sortable-list.svelte";
  import Stepper from "../../components/stepper/stepper.svelte";
  import Text from "./../../components/text/text.svelte";
  import TrackerSmallBlock from "./../../components/tracker-ball/tracker-small-block.svelte";

  // modules
  import StatsProcessor from "../../modules/stats/statsV5";
  import { Block } from "../../modules/dashboard/block";
  import Tracker from "../../modules/tracker/tracker";

  // Utils
  import { positivityFromLogs } from "../../utils/positivity/positivity";
  import Logger from "../../utils/log/log";
  const console = new Logger("📊 container/dashboard.svelte");

  //Containers / Layouts
  import NLayout from "../layout/layout.svelte";
  import { Dashboard } from "../../modules/dashboard/dashboard";

  // Stores
  import { Interact } from "../../store/interact";
  import { DashboardStore } from "../../store/dashboard-store";
  import { LedgerStore } from "./../../store/ledger.js";
  import { PeopleStore } from "./../../store/people-store.js";
  import { TrackerStore } from "./../../store/tracker-store.js";
  import { LastUsed } from "../../store/last-used";
  import type Person from "../../modules/person/person";
  import HScroller from "../../components/h-scroller/h-scroller.svelte";

  let trackers: any; // holder of user Trackers - loaded from subscribe
  let people: any; // holder of User People - loaded from subscribe
  let dashboards: Array<Dashboard>; // holder of Dashboards
  let unsubTrackers: Function; // Unsubscribe from trackers
  let unsubDashboard: Function; // Unsubscribe from dashboard
  let unsubPeople: Function; // Unsubscribe from people
  let ready = false; // Is the component Ready
  let editingBlock: Block; // Editing block - if defined
  let editMode = false; // Toggle Edit mode
  let activePage = 0; // activePage - which page we're on in the array of dasboards
  // let lastActivePage; // last Active for managing reactiveness
  let activeDashboard = { label: "Loading...", blocks: [] }; // Set a default dasboard
  let stopRefresh;
  /**
   * Toggle Edit more
   */
  function toggleEdit() {
    editMode = !editMode;
  }

  /**
   * Save the Editing Block
   */
  async function saveEditingBlock(): Promise<void> {
    // If we're editing something
    if (editingBlock) {
      Interact.blocker("Saving..."); // Throw shade
      try {
        // Save block to current dashboardsIndex
        await DashboardStore.saveBlock(editingBlock);
      } catch (e) {
        // Show Error
        Interact.alert("Error", e.message);
      }
      // Disable Blocker
      Interact.stopBlocker();
      // Clear Editing - close
      clearEditing();
    } else {
      // no Editing block? Show message
      Interact.toast("Incomplete");
    }
  }

  /**
   * Create a New Block
   */
  async function newBlock() {
    editingBlock = new Block();
  }

  /**
   * Edit a Block
   * Will show the block editor
   */
  function editBlock(block) {
    block._editing = true;
    editingBlock = block;
  }

  /**
   * Get Start / End Dates from a Board
   * This will go through all blocks and find the full date range of the dasboard
   */
  function getStartEndDates(dboard) {
    let start = null;
    let end = null;
    // Loop over the blocks
    dboard.blocks.forEach((block: Block) => {
      // Get the date range for this block
      let dateRange = block.getDateRange();
      // Start is first element
      let blockStart = dateRange[0];
      // End is last element
      let blockEnd = dateRange[1];
      // If block end is greater (in the future) than end
      // save it as the winner
      if (blockEnd > end || !end) {
        end = blockEnd;
      }
      // If block start is less than (more in the past) then
      // set it as the winner
      if (blockStart < start || !start) {
        start = blockStart;
      }
    });
    // Return Earliest and latest dates
    return { start, end };
  }

  /**
   * Get the Logs for a Block
   */
  async function getLogsForBlock(block: Block): Promise<Array<any>> {
    let logs = []; // Holder of the logs

    const dateRange = block.getDateRange(); // Get Date Range for this block.
    const start = dateRange[0]; // get  start
    const end = dateRange[1]; // get end

    // Get the Logs based on the Type provided
    if (block.element && block.element.type == "tracker") {
      // Tracker Search
      logs = await LedgerStore.queryTag(block.element.id, start, end);
    } else if (block.element && block.element.type == "person") {
      // Person Search
      logs = await LedgerStore.queryPerson(block.element.id, start, end);
    } else if (block.element && block.element.type == "context") {
      // Context Search
      logs = await LedgerStore.queryContext(block.element.id, start, end);
    } else if (block.element) {
      // Generic Search
      logs = await LedgerStore.queryAll(block.element.id, start, end);
    }

    return logs;
  }

  /**
   * Load The Active Dashboard
   * This will take the current active dashboard from the store, loop over it, and build out
   * the data structure we need to generate each of the blocks.
   */
  async function loadActiveDashboard() {
    // Get the Board
    const activeIndex = $DashboardStore.activeIndex;
    let dboard;
    if (dashboards.length > activeIndex) {
      dboard = dashboards[$DashboardStore.activeIndex];
    }
    // Get Start and End

    // Loop over each block
    if (dboard) {
      for (let i = 0; i < dboard.blocks.length; i++) {
        // Set the Block
        const block: Block = dboard.blocks[i] instanceof Block ? dboard.blocks[i] : new Block(dboard.blocks[i]);
        let start = block.getStartDate();
        let end = block.getEndDate();

        // TODO make this work for all trackable elements
        if (block.type == "last-used") {
          if (block.element.type == "tracker") {
            block.lastUsed = await LastUsed.get(block.element.id);
          } else if (block.element.type == "person") {
            let person: Person = await $PeopleStore.people[block.element.id];
            if (person) {
              block.lastUsed = person.last;
            }
          }

          if (block.lastUsed) {
            let lastUsedDay = dayjs(block.lastUsed);
            let daysPast = Math.abs(dayjs().diff(lastUsedDay, "day"));
            block.stats = block.stats || {};
            block.stats.daysPast = daysPast;
          }
        } else if (block.element && block.type != "last-used") {
          block.logs = await getLogsForBlock(block);

          const statsV5 = new StatsProcessor();
          // Generate Stats
          block.math = block.math || (block.element.obj || {}).math || "sum";
          // Get dayjs Start Date
          const fromDate = dayjs(start);
          const toDate = dayjs(end);
          const dayDiff = Math.abs(fromDate.diff(toDate, "day"));
          // Set Default Mode to "Week"
          let mode = "w";
          // Determine Stat Mode based on number of days provided
          if (dayDiff < 8) {
            mode = "w";
          } else if (dayDiff < 89) {
            mode = "m";
          } else if (dayDiff < 365) {
            mode = "q";
          } else if (dayDiff > 364) {
            mode = "y";
          } else {
            mode = "m";
          }
          // Setup the Config to Pass to Stats
          const statsConfig = {
            rows: block.logs,
            fromDate,
            toDate,
            mode,
            math: block.math, //state.tracker.math
            trackableElement: block.element,
          };
          // Generate the Stats
          block.stats = statsV5.generate(statsConfig);
          // Generate the Positivity
          block.positivity = positivityFromLogs(block.logs, block.element);
        }
        // Replace the block with the new populated version.
        dboard.blocks[i] = block;
      }
    } else {
      console.error("No DBoard Found...");
    }
    // Set the Active Dashboard
    activeDashboard = dboard || new Dashboard();
    ready = true;
  }

  /**
   * Initialize the Dashboard
   */
  function initDashboard() {
    // Loop over the blocks - convert them to real blocks.
    try {
      dashboards[$DashboardStore.activeIndex] = dashboards[$DashboardStore.activeIndex] || new Dashboard();
      dashboards[$DashboardStore.activeIndex].blocks = dashboards[$DashboardStore.activeIndex].blocks.map((block) => {
        // Set block
        let nBlock = block instanceof Block ? block : new Block(block);
        // If it's a Tracker - and the tracker exists
        if (nBlock.element && nBlock.element.type == "tracker") {
          nBlock.element.obj = TrackerStore.getByTag(nBlock.element.id);
          // If it's a person and the person exists
        } else if (nBlock.element && nBlock.element.type == "person" && people[nBlock.element.id]) {
          nBlock.element.obj = people[nBlock.element.id];
        }
        return nBlock;
      });
      loadActiveDashboard();
    } catch (e) {
      Interact.alert("Error", e.message);
      console.error(e.message);
    }
  }

  // If Something changes - update the last Active Page
  // $: if (trackers && people && dashboards && activePage !== lastActivePage) {
  //   lastActivePage = activePage;
  // }

  /**
   * Stop Editing
   */
  function clearEditing() {
    editingBlock = undefined;
  }

  /**
   * Rename a Dashboard
   */
  async function rename() {
    let newName = await Interact.prompt("Rename Dashboard", null, {
      value: activeDashboard.label,
    });
    if (newName) {
      $DashboardStore.dashboards[$DashboardStore.activeIndex].label = newName;
      DashboardStore.save();
    }
  }

  /**
   * On Mount / On Destroy
   **/
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
      if (dbStore.dashboards && trackers && people) {
        dashboards = dbStore.dashboards;
        initDashboard();
      }
    });
  });

  async function deleteDashboard() {
    let confirmed = await Interact.confirm("Delete dashboard?", "You cannot undo this action.");
    if (confirmed) {
      await DashboardStore.delete(activeDashboard);
    }
  }

  onDestroy(() => {
    unsubTrackers();
    unsubPeople();
    unsubDashboard();
  });
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
      <!-- <HScroller activeIndex={$DashboardStore.activeIndex} className="n-board-tabs">
        {#each dashboards || [] as board, i (board.id)}
          <button
            class="tab board-{board.id}
            {i == $DashboardStore.activeIndex ? 'selected' : 'inactive'}"
            on:click={() => {
              DashboardStore.toIndex(i);
            }}>
            {board.label}
          </button>
        {/each}
      </HScroller> -->

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
      {#if (dashboards || []).length > 1}
        <Button color="clear" on:click={DashboardStore.previous}>
          <Icon name="chevronLeft" />
        </Button>
        <Button color="clear" on:click={DashboardStore.next}>
          <Icon name="chevronRight" />
        </Button>
      {/if}
    </div>
    {#if !editMode && ready}
      <div class="dashboard-wrapper h-100" on:swipeleft={DashboardStore.next} on:swiperight={DashboardStore.previous}>
        {#if people && trackers}
          {#each activeDashboard.blocks as block (block.id)}
            <Dashblock
              {block}
              on:click={() => {
                editBlock(block);
              }} />
          {/each}
        {/if}
        <div class="w-100 flex-grow">
          <button class="btn btn-round btn-light btn-block mx-auto mt-4 mb-2" style="max-width:300px; max-height:50px;" on:click={newBlock}>
            <Icon name="add" size="24" />
            Add Block
          </button>
          <Button
            size="xs"
            color="clear"
            block
            className="mx-auto mt-4 mb-4"
            style="max-width:300px; max-height:22px; opacity:0.6"
            on:click={deleteDashboard}>
            <Icon name="delete" size="14" className="mr-2" />
            Delete Dashboard
          </Button>
        </div>
      </div>
    {:else if ready}
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
    {:else}
      <div class="p-4 text-center mt-4">
        <Text size="sm" faded>Loading Dashboard</Text>
      </div>
    {/if}
  </div>

</NLayout>
<Modal show={editingBlock !== undefined}>
  <div class="n-toolbar-grid" slot="header">
    <button class="btn btn-clear left" on:click={clearEditing}>
      <Icon name="close" />
    </button>
    <div class="main">Block Editor</div>
    <button class="btn btn-clear right" on:click={saveEditingBlock}>
      {#if editingBlock && editingBlock._editing}Update{:else}Save{/if}
    </button>

  </div>
  {#if editingBlock}
    <DashblockEditor bind:value={editingBlock} on:close={clearEditing} />
  {/if}
</Modal>
