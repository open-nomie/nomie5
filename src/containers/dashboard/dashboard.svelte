<script lang="ts">
  import { navigate, Router, Route } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";

  import dayjs from "dayjs";
  import type { Dayjs } from "dayjs";

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
  import TrackerSmallBlock from "../../components/tracker-small-block/tracker-small-block.svelte";
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
  import { LedgerStore } from "./../../store/ledger";
  import { PeopleStore } from "./../../store/people-store";
  import { TrackerStore } from "../../store/tracker-store";
  import { LastUsed } from "../../store/last-used";
  import type Person from "../../modules/person/person";
  import HScroller from "../../components/h-scroller/h-scroller.svelte";
  import Input from "../../components/input/input.svelte";
  import { Lang } from "../../store/lang";
  import Spinner from "../../components/spinner/spinner.svelte";
  import { widgetTypes } from "./widgetTypes";
  import { truncateText } from "../../utils/text/text";
  import { UserStore } from "../../store/user-store";
  import tick from "../../utils/tick/tick";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import nid from "../../modules/nid/nid";
  import Toolbar from "../../components/toolbar/toolbar.svelte";
  import { SearchStore } from "../../store/search-store";
  import Empty from "../empty/empty.svelte";
  import LedgerTools from "../../store/ledger/ledger-tools";
  import Swipeable from "../../components/swipeable/swipeable.svelte";
  // import { getDashboardStartEndDates } from "./dashboard-helpers";

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
  let firstDayOfWeek: "1" | "2" = "1";
  let dtFormat;
  /**
   * Toggle Edit more
   */
  function toggleEdit() {
    editMode = !editMode;
  }

  $: firstDayOfWeek = $UserStore.meta.firstDayOfWeek;

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
  // function getStartEndDates(dboard): { start: Dayjs; end: Dayjs } {
  //   return getDashboardStartEndDates(dboard);
  // }

  /**
   * Get the Logs for a widget
   */
  async function getLogsForWidget(widget: Widget): Promise<Array<any>> {
    let logs = []; // Holder of the logs
    let dateRange = widget.getDateRange($UserStore.meta.firstDayOfWeek); // Get Date Range for this widget.
    let start = dateRange[0]; // get  start
    let end = dateRange[1]; // get end

    if (widget.type == "streak") {
      start = dayjs().startOf("month");
      end = dayjs().endOf("month");
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

  async function dashboardOptions() {
    let buttons = [
      {
        title: Lang.t("dashboard.add-a-widget", "Add a Widget..."),
        click: newWidget,
        icon: "addOutline",
      },
      {
        title: `${Lang.t("general.edit", "Edit")} ${activeDashboard.label}...`,
        click: toggleEdit,
        icon: "edit",
      },
      {
        title: `${Lang.t("general.delete", "Delete")} ${activeDashboard.label}...`,
        click: deleteDashboard,
        icon: "delete",
      },
      {
        title: `${Lang.t("dashboard.add-tab", "Add new Tab...")}`,
        click: DashboardStore.newDashboard,
        icon: "addTab",
        divider: true,
      },
    ];

    Interact.popmenu({
      title: `${Lang.t("dashboard.options", "Dashboard Options")}`,
      buttons,
    });
  }

  async function getWidgetStats(widget: Widget): Promise<Widget> {
    let start = widget.getStartDate(firstDayOfWeek);
    let end = widget.getEndDate(firstDayOfWeek);
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

      const statsV5 = new StatsProcessor({});
      // Generate Stats
      widget.math = widget.math || (widget.element.obj || {}).math || "sum";
      // Get dayjs Start Date
      const fromDate = dayjs(start);
      const toDate = dayjs(end);
      const dayDiff = Math.abs(fromDate.diff(toDate, "day"));
      // Set Default Mode to "Week"
      let mode = "w";
      // Determine Stat Mode based on number of days provided
      if (dayDiff < 1) {
        mode = "d"; // Use hours as the breakdown
      } else if (dayDiff < 8) {
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
      const statsConfig: any = {
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
    widget.loading = false;
    return widget;
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
        let start = widget.getStartDate(firstDayOfWeek);
        let end = widget.getEndDate(firstDayOfWeek);

        widget.dateFormat = (dtFormat || { date: "MMM Do YYYY" }).date;
        widget.timeFormat = (dtFormat || { time: "h:mma" }).time;
        widget.loading = true;

        // Replace the widget with the new populated version.
        dboard.widgets[i] = widget;
      }
    } else {
      console.error("No DBoard Found...");
    }

    activeDashboard = dboard || new Dashboard();
    ready = true;
    loading = false;

    if (activeDashboard.widgets.length) {
      for (let i = 0; i < activeDashboard.widgets.length; i++) {
        activeDashboard.widgets[i] = await getWidgetStats(activeDashboard.widgets[i]);
      }
    }

    // Set the Active Dashboard
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

  async function deleteWidget(widget: Widget) {
    let confirmed = await Interact.confirm(
      `${Lang.t("general.remove", "Remove")} ${widget.getTitle()} ${Lang.t("general.widget", "widget")}?`,
      "Are you sure you want to remove this widget from this dashboard?"
    );
    if (confirmed) {
      await DashboardStore.deleteWidget(widget);
      loadActiveDashboard();
    }
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
    dtFormat = UserStore.getDateTimeFormat();

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

    LedgerStore.hook("onLogSaved", () => {
      if (!editMode) {
        initDashboard();
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
    let confirmed = await Interact.confirm(`Delete ${activeDashboard.label} dashboard?`, "This cannot be undone, just rebuilt.");
    if (confirmed) {
      await DashboardStore.delete(activeDashboard);
    }
  }

  async function duplicateWidget(widget: Widget) {
    let baseWidget: Widget = new Widget(widget);
    baseWidget.id = nid();
    await DashboardStore.saveWidget(baseWidget);
  }

  async function moveWidget(widget: Widget) {
    const buttons = $DashboardStore.dashboards.map((dashboard: Dashboard) => {
      return {
        title: dashboard.label,
        click() {
          try {
            DashboardStore.moveWidget(widget, dashboard);
          } catch (e) {
            Interact.alert("Error", e.message);
          }
        },
      };
    });

    Interact.popmenu({
      buttons,
      title: `${Lang.t("dashboard.select-dashboard-to-move-widget", "Move widget to which dashboard?")}`,
    });
  }

  async function onWidgetAction({ type, widget }) {
    await tick(200);
    if (type == "edit") {
      editWidget(widget);
    } else if (type === "move") {
      moveWidget(widget);
    } else if (type === "delete") {
      deleteWidget(widget);
    } else if (type === "duplicate") {
      duplicateWidget(widget);
    }
  }

  onDestroy(() => {
    unsubTrackers();
    unsubPeople();
    unsubDashboard();
  });
</script>

<NLayout className="dasboard" headerClassNames="fill-header" pageTitle="Dashboard" showTabs={true}>
  <header slot="header">
    <Toolbar>
      <Button color="none" shape="circle" className="tap-icon" on:click={() => SearchStore.view('history')}>
        <Icon name="search" size="24" />
      </Button>
      <HScroller centerIfPossible activeIndex={$DashboardStore.activeIndex} className="n-board-tabs">
        {#each dashboards || [] as board, i (board.id)}
          <button
            class="tab board-{board.id} truncate-1 {i == $DashboardStore.activeIndex ? 'selected' : 'inactive'}"
            on:click={() => {
              DashboardStore.toIndex(i);
            }}
          >
            {truncateText(board.label, 12)}
          </button>
        {/each}
      </HScroller>
      <Button icon className="tap-icon" on:click={dashboardOptions}>
        <Icon name="settings" />
      </Button>
    </Toolbar>
  </header>
  {#if activeDashboard && !loading}
    <div class="container h-100">
      {#if editMode}
        <div class="px-2 mt-2 mb-2 n-toolbar n-row">
          <Input type="text" placeholder="Dashboard Label" bind:value={activeDashboard.label} />
          <Button color="clear" text className="text-primary-bright" on:click={done}>
            {!editMode ? Lang.t('general.edit', 'Edit') : Lang.t('general.done', 'Done')}
          </Button>
        </div>
        <hr class="my-3 divider center" />
      {/if}
      {#if !editMode && activeDashboard && activeDashboard.widgets}
        <Swipeable on:left={DashboardStore.next} on:right={DashboardStore.previous}>
          <div class="dashboard-wrapper" on:swipeleft={DashboardStore.next} on:swiperight={DashboardStore.previous}>

            {#if people && trackers}
              {#if activeDashboard.widgets.length == 0}
                <Empty
                  emoji="💹"
                  title={Lang.t('general.dashboard', 'Dashboard')}
                  description={Lang.t('dashboard.empty-message', 'Mix and match charts, stats, and other widgets to create your own custom views of your life.')}
                  buttonLabel={Lang.t('dashboard.add-a-widget', 'Add a Widget...')}
                  buttonClick={newWidget}
                />
              {/if}

              {#each activeDashboard.widgets as widget (widget.id)}
                <WidgetEle
                  on:action={(evt) => {
                    onWidgetAction(evt.detail);
                  }}
                  {widget}
                  on:edit={() => {
                    editWidget(widget);
                  }}
                />
              {/each}
            {/if}

          </div>
        </Swipeable>
        {#if activeDashboard && activeDashboard.widgets && activeDashboard.widgets.length}
          <div class="mb-2 board-actions filler">
            <Button size="sm" color="transparent" className="mt-4 text-primary-bright" on:click={newWidget}>
              {Lang.t('dashboard.add-a-widget', 'Add a Widget...')}
            </Button>
          </div>
        {/if}
        <div class="p-2 mt-3" />
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
          let:item
        >
          <ListItem solo className="pb-2">
            <div slot="left">
              <Button icon color="clear" on:click={() => deleteWidget(item)}>
                <Icon name="delete" />
              </Button>
            </div>
            {#if item.type == 'text'}
              <Text size="md" truncate>{item.description}</Text>
            {:else}
              <TrackerSmallBlock xs truncate novalue element={item.element} value={item.type} />
            {/if}
            <div slot="right" class="pr-2 text-sm text-faded-2">
              {#if item.timeRange}{item.timeRange.getLabel()}{/if}
              <div class="menu-handle">
                <Icon name="menu" />
              </div>
            </div>

          </ListItem>
        </SortableList>
      {:else}
        <div class="p-4 mt-4 text-center">
          <Text size="sm" faded>{Lang.t('general.loading', 'Loading')}...</Text>
        </div>
      {/if}
    </div>
  {:else}
    <div class="n-panel center-all">
      <Spinner size={18} />
      <NText size="sm" style="margin-left:10px;">Loading...</NText>
    </div>
  {/if}
</NLayout>

<Modal show={editingWidget !== undefined}>
  <div class="n-toolbar-grid" slot="header">
    <div class="left">
      <Button color="primary" type="clear" on:click={clearEditing}>Close</Button>
    </div>
    <div class="main">{Lang.t('dashboard.widget-editor', 'Widget Editor')}</div>
    <div class="right">
      <Button color="primary" type="clear" on:click={saveEditingWidget}>
        {#if editingWidget && editingWidget._editing}
          {`${Lang.t('general.update', 'Update')}`}
        {:else}{`${Lang.t('general.save', 'Save')}`}{/if}
      </Button>
    </div>
  </div>
  {#if editingWidget}
    <WidgetEditor bind:value={editingWidget} on:close={clearEditing} />
  {/if}
  <div slot="footer" />
</Modal>

<style lang="scss">
  .dashboard-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 10px 4px 16px;
    justify-content: stretch;
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
  :global(.dashboard-widget.type-text) {
    text-align: center;
  }
  :global(.dashboard .tab) {
    max-width: 100px;
  }
</style>
