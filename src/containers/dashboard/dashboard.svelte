<script lang="ts">
  import { navigate, Router, Route } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";

  import dayjs from "dayjs";

  import WidgetEle from "./widget.svelte";
  import WidgetEditor from "./widget-editor.svelte";

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
  import { Widget } from "../../modules/dashboard/widget";
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
  import { TrackerStore } from "../../store/tracker-store";
  import { LastUsed } from "../../store/last-used";
  import type Person from "../../modules/person/person";
  import HScroller from "../../components/h-scroller/h-scroller.svelte";
  import Input from "../../components/input/input.svelte";
  import { Lang } from "../../store/lang";
  import Spinner from "../../components/spinner/spinner.svelte";
  import { widgetTypes } from "./widgetTypes";

  let trackers: any; // holder of user Trackers - loaded from subscribe
  let people: any; // holder of User People - loaded from subscribe
  let dashboards: Array<Dashboard>; // holder of Dashboards
  let unsubTrackers: Function; // Unsubscribe from trackers
  let unsubDashboard: Function; // Unsubscribe from dashboard
  let unsubPeople: Function; // Unsubscribe from people
  let ready = false; // Is the component Ready
  let editingWidget: Widget; // Editing block - if defined
  let editMode = false; // Toggle Edit mode
  let activePage = 0; // activePage - which page we're on in the array of dasboards
  // let lastActivePage; // last Active for managing reactiveness
  let activeDashboard: Dashboard = { id: "fake", label: "Loading...", widgets: [] }; // Set a default dasboard
  let stopRefresh;
  let loading = false;
  /**
   * Toggle Edit more
   */
  function toggleEdit() {
    editMode = !editMode;
  }

  function canSave(testWidget: Widget) {
    let type = widgetTypes.find((wdgt) => wdgt.id == testWidget.type);
    if (type) {
      let required = type.requires;
      if (required.indexOf("element") > -1 && !testWidget.element) {
        throw new Error("Select a trackable element to display");
      }
      if (required.indexOf("timeframe") > -1 && !testWidget.timeRange.label) {
        throw new Error("This widget requires a timeframe");
      }
    } else {
      throw new Error("Select a Widget Type");
    }
  }

  /**
   * Save the Editing Block
   */
  async function saveEditingWidget(): Promise<void> {
    // If we're editing something
    if (editingWidget) {
      try {
        // Save block to current dashboardsIndex
        canSave(editingWidget);
        Interact.blocker("Saving..."); // Throw shade
        await DashboardStore.saveWidget(editingWidget);
        clearEditing();
      } catch (e) {
        // Show Error
        Interact.alert("Error", e.message);
      }
      Interact.stopBlocker();
    } else {
      // no Editing block? Show message
      Interact.toast("Incomplete");
    }
  }

  /**
   * Create a New Block
   */
  async function newWidget() {
    editingWidget = new Widget();
  }

  /**
   * Edit a Block
   * Will show the block editor
   */
  function editWidget(widget) {
    widget._editing = true;
    editingWidget = widget;
  }

  /**
   * Get Start / End Dates from a Board
   * This will go through all blocks and find the full date range of the dasboard
   */
  function getStartEndDates(dboard) {
    let start = null;
    let end = null;
    // Loop over the blocks
    dboard.widgets.forEach((widget: Widget) => {
      // Get the date range for this block
      let dateRange = widget.getDateRange();
      // Start is first element
      let widgetStart = dateRange[0];
      // End is last element
      let widgetEnd = dateRange[1];
      // If block end is greater (in the future) than end
      // save it as the winner
      if (widgetEnd > end || !end) {
        end = widgetEnd;
      }
      // If block start is less than (more in the past) then
      // set it as the winner
      if (widgetStart < start || !start) {
        start = widgetStart;
      }
    });
    // Return Earliest and latest dates
    return { start, end };
  }

  /**
   * Get the Logs for a widget
   */
  async function getLogsForWidget(widget: Widget): Promise<Array<any>> {
    let logs = []; // Holder of the logs

    const dateRange = widget.getDateRange(); // Get Date Range for this widget.
    let start = dateRange[0]; // get  start
    let end = dateRange[1]; // get end

    if (widget.type == "streak") {
      start = dayjs().startOf("month").toDate();
      end = dayjs().endOf("month").toDate();
    }

    // Get the Logs based on the Type provided
    if (widget.element && widget.element.type == "tracker") {
      // Tracker Search
      logs = await LedgerStore.queryTag(widget.element.id, start, end);
    } else if (widget.element && widget.element.type == "person") {
      // Person Search
      logs = await LedgerStore.queryPerson(widget.element.id, start, end);
    } else if (widget.element && widget.element.type == "context") {
      // Context Search
      logs = await LedgerStore.queryContext(widget.element.id, start, end);
    } else if (widget.element) {
      // Generic Search
      logs = await LedgerStore.queryAll(widget.element.id, start, end);
    }

    return logs;
  }

  /**
   * Load The Active Dashboard
   * This will take the current active dashboard from the store, loop over it, and build out
   * the data structure we need to generate each of the wigets.
   */
  async function loadActiveDashboard() {
    // Get the Board
    const activeIndex = $DashboardStore.activeIndex;
    let dboard;
    if (dashboards.length > activeIndex) {
      dboard = dashboards[$DashboardStore.activeIndex];
    }
    // Get Start and End

    // Loop over each widget
    if (dboard) {
      for (let i = 0; i < dboard.widgets.length; i++) {
        // Set the widget
        const widget: Widget = dboard.widgets[i] instanceof Widget ? dboard.widgets[i] : new Widget(dboard.widgets[i]);
        let start = widget.getStartDate();
        let end = widget.getEndDate();

        // TODO make this work for all trackable elements
        if (widget.type == "last-used") {
          if (widget.element.type == "tracker") {
            widget.lastUsed = await LastUsed.get(widget.element.id);
          } else if (widget.element.type == "person") {
            let person: Person = await $PeopleStore.people[widget.element.id];
            if (person) {
              widget.lastUsed = person.last;
            }
          }

          if (widget.lastUsed) {
            let lastUsedDay = dayjs(widget.lastUsed);
            let daysPast = Math.abs(dayjs().diff(lastUsedDay, "day"));
            widget.stats = widget.stats || {};
            widget.stats.daysPast = daysPast;
          }
        } else if (widget.element && widget.type != "last-used") {
          widget.logs = await getLogsForWidget(widget);

          const statsV5 = new StatsProcessor();
          // Generate Stats
          widget.math = widget.math || (widget.element.obj || {}).math || "sum";
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
            rows: widget.logs,
            fromDate,
            toDate,
            mode,
            math: widget.math, //state.tracker.math
            trackableElement: widget.element,
          };
          // Generate the Stats
          widget.stats = statsV5.generate(statsConfig);
          // Generate the Positivity
          widget.positivity = positivityFromLogs(widget.logs, widget.element);
        }
        // Replace the widget with the new populated version.
        dboard.widgets[i] = widget;
      }
    } else {
      console.error("No DBoard Found...");
    }

    // Set the Active Dashboard
    activeDashboard = dboard || new Dashboard();
    ready = true;
    loading = false;
  }

  /**
   * Initialize the Dashboard
   */
  function initDashboard() {
    // Loop over the widgets - convert them to real widgets.
    loading = true;
    try {
      dashboards[$DashboardStore.activeIndex] = dashboards[$DashboardStore.activeIndex] || new Dashboard();
      dashboards[$DashboardStore.activeIndex].widgets = dashboards[$DashboardStore.activeIndex].widgets.map((widget) => {
        // Set widget
        let thisWidget = widget instanceof Widget ? widget : new Widget(widget);
        // If it's a Tracker - and the tracker exists
        if (thisWidget.element && thisWidget.element.type == "tracker") {
          thisWidget.element.obj = TrackerStore.getByTag(thisWidget.element.id);
          // If it's a person and the person exists
        } else if (thisWidget.element && thisWidget.element.type == "person" && people[thisWidget.element.id]) {
          thisWidget.element.obj = people[thisWidget.element.id];
        }
        return thisWidget;
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
    editingWidget = undefined;
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
        if (!editMode) {
          initDashboard();
        }
      }
    });
  });

  async function done() {
    DashboardStore.save();
    toggleEdit();
  }

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
    padding: 10px 4px 16px;
    justify-content: center;
    align-content: flex-start;
    min-height: 70vh;
  }
  .new-widget {
    background-color: var(--color-solid);
    box-shadow: var(--box-shadow-tight);
  }
  :global(.dashboard-widget.type-map) {
    height: 260px;
  }
</style>

<NLayout className="dasboard" headerClassNames="bg-solid" pageTitle="Dashboard" showTabs={true}>
  <div slot="header" class="n-row pl-2 container">
    <HScroller activeIndex={$DashboardStore.activeIndex} className="n-board-tabs">
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
    </HScroller>
    <Button color="clear" className="mt-2" on:click={DashboardStore.newDashboard}>
      <Icon name="newTab" size="18" />
    </Button>
  </div>
  {#if activeDashboard && !loading}
    <div class="container h-100">
      {#if editMode}
        <div class="n-toolbar n-row px-2 mt-2">
          <Input type="text" placeholder="Dashboard Label" bind:value={activeDashboard.label} />
          <Button color="clear" className="text-primary-bright" on:click={done}>{editMode ? 'Done' : 'Edit'}</Button>
        </div>
      {/if}
      {#if !editMode && ready}
        <div class="dashboard-wrapper" on:swipeleft={DashboardStore.next} on:swiperight={DashboardStore.previous}>
          {#if people && trackers}
            {#if activeDashboard.widgets.length == 0}
              <div class="center-all p-5 n-panel vertical">
                <Text faded size="lg">😔 Empty Dashboard</Text>
                <Button size="xs" className="mt-2" on:click={newWidget}>Add a Widget...</Button>
              </div>
            {/if}

            {#each activeDashboard.widgets as widget (widget.id)}
              <WidgetEle
                {widget}
                on:click={() => {
                  editWidget(widget);
                }} />
            {/each}
          {/if}
        </div>
        <div class="board-actions filler">
          <div class="btn-group filler">
            <Button on:click={newWidget} color="clear">
              <Text size="sm">{Lang.t('general.add', 'Add')} Widget</Text>
            </Button>
            <Button on:click={toggleEdit} color="clear">
              <Text size="sm">{Lang.t('general.edit', 'Edit')}</Text>
            </Button>
            <Button on:click={deleteDashboard} color="clear">
              <Text size="sm">{Lang.t('general.delete', 'Delete')}</Text>
            </Button>
          </div>
        </div>
        <div class="mt-3" />
      {:else if ready}
        <SortableList
          items={activeDashboard.widgets || []}
          handle=".menu-handle"
          key="id"
          on:update={(sorted) => {
            activeDashboard.widgets = sorted.detail;
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
          <Text size="sm" faded>{Lang.t('general.loading', 'Loading')}...</Text>
        </div>
      {/if}
    </div>
  {:else}
    <div class="n-panel center-all">
      <Spinner size={18} style="margin-right:6px;" />
      Loading...
    </div>
  {/if}
</NLayout>
<Modal show={editingWidget !== undefined}>
  <div class="n-toolbar-grid" slot="header">
    <button class="btn btn-clear left text-primary-bright" on:click={clearEditing}>Close</button>
    <div class="main">Widget Editor</div>
    <button class="btn btn-clear right text-primary-bright" on:click={saveEditingWidget}>
      {#if editingWidget && editingWidget._editing}{Lang.t('general.update', 'Update')}{:else}{Lang.t('general.save', 'Save')}{/if}
    </button>

  </div>
  {#if editingWidget}
    <WidgetEditor bind:value={editingWidget} on:close={clearEditing} />
  {/if}
</Modal>
