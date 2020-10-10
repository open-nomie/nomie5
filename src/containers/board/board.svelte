<script>
  /**
   * Brace yourself - this is a massive file
   *
   * Board / Home / MainView
   * This monolith is basically the sum of all nomie.
   * It should be broken down into more managable chunks over time.
   * but for now, this is where all tracking and managing of your boards
   * happens. God speed.
   *
   * Brnadon
   */

  // svelte
  import { navigate } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";
  import dayjs from "dayjs";
  import { fade, fly } from "svelte/transition";

  // Components
  import NTrackerButton from "./tracker-button.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import NSearchBar from "../../components/search-bar/search-bar.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import LogoType from "../../components/logo/logo.svelte";
  import NTip from "../../components/tip/tip.svelte";
  import CaptureLog from "../../components/capture-log.svelte";
  import Spinner from "../../components/spinner/spinner.svelte";
  import NBoardTabs from "../../components/board-tabs/board-tabs.svelte";

  // Containers
  import NLayout from "../../containers/layout/layout.svelte";
  import BoardSortModal from "../../containers/board/board-sort.svelte";

  // Modules/Libs/Utils
  import Tracker from "../../modules/tracker/tracker";
  import NomieLog from "../../modules/nomie-log/nomie-log";
  import StarterPacks from "../../modules/packs/starter-packs";
  import math from "../../utils/math/math";
  import Logger from "../../utils/log/log";
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import tick from "../../utils/tick/tick";
  import TrackerInputer from "../../modules/tracker/tracker-inputer";
  import ScoreTracker from "../../modules/scoring/score-tracker";

  // data
  import tips from "../../config/tips";

  //Stores
  import { ActiveLogStore } from "../../store/active-log";
  import { LedgerStore } from "../../store/ledger";
  import { UserStore } from "../../store/user-store";
  import { BoardStore } from "../../store/boards";
  import { TrackerStore } from "../../store/tracker-store";
  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";
  import { TrackerLibrary } from "../../store/tracker-library";
  import { LastUsed } from "../../store/last-used";
  import { FeatureStore } from "../../store/feature-store";
  import Button from "../../components/button/button.svelte";
  import Text from "../../components/text/text.svelte";
  import exportData from "../../modules/export/export-helper";

  import OfflineQueue from "../../components/offline-queue/offline-queue.svelte";

  import NPaths from "../../paths";
  import { Device } from "../../store/device-store";
  import ShortcutButton from "../../components/shortcut-button/shortcut-button.svelte";
  import time from "../../utils/time/time";
  import Counter from "../../components/counter/counter.svelte";
  import ListItem from "../../components/list-item/list-item.svelte";
  import TrackersList from "./trackers.svelte";
  import { SearchStore } from "../../store/search-store";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Card from "../../components/card/card.svelte";

  // Consts
  const console = new Logger("board.svelte");

  // Local Vars
  let user = undefined; // will hold the user when the user is ready - basically a ready var
  let today = {}; // holds today's activities
  let searchInput; // binding to dom element
  let foundTrackers = null; // for search results
  let boardTrackers = []; // Actual array to display to user
  let daysSinceLastBackup = 0;
  // Browser Title
  let appTitle = "(Loading)";
  let _elSearchBar;

  // Data Storage
  let state = {
    selectedTracker: null, // populated when user tabs tracker
    showStartPacks: false, // shows the start library
    savingTrackers: [], // to highlight trackers that are being saved
    addedTrackers: [], // Visually showing what trackers are in the notes field
    activeTip: 0, // index of the current tip to show
    hideTips: false, // temp hide - it will stop showing after 12 launches.
    view: localStorage.getItem("board-view") || "button",
  };

  /**
   * isReady
   * Holder of the state for each req store
   * boards, trackers and ledger need to be loaded
   * before we can render the page. If the user is
   * using blockstack, this could take a little bit
   **/
  let isReady = {
    boards: false,
    trackers: false,
    ledger: false,
    done: false,
    checking: false,
  };

  let timers = [];
  $: if ($TrackerStore) {
    timers = Object.keys($TrackerStore.trackers)
      .map((tag) => {
        return $TrackerStore.trackers[tag];
      })
      .filter((tracker) => {
        return tracker.started;
      });
  }

  // Check if it's ready
  const checkIfReady = (requester) => {
    if (isReady.done == false) {
      if (isReady.boards && $TrackerStore.trackers && isReady.ledger) {
        isReady.done = true;
        setTimeout(() => {
          setBoardTrackers();
        }, 20);
      }
    }
  };

  $: if ($UserStore.meta) {
    daysSinceLastBackup = dayjs().diff(dayjs(new Date(user.meta.lastBackup || null)), "day");
  }

  /**
   * Add some tips to help new users
   * This will stop showing after 12 nomie launches
   **/

  // Wait for the User to be ready
  UserStore.onReady(() => {
    // Set user to kick off top view conditional.
    user = $UserStore; // Kick off

    // Setup Hooks These will fire on before safe, and onLogSave
    LedgerStore.hook("onBeforeSave", (log) => {
      state.savingTrackers = log.getMeta().trackers.map((t) => t.id);
    });
    LedgerStore.hook("onLogSaved", (log) => {
      // Clear saving states
      state.savingTrackers = [];

      state.addedTrackers = [];
    });
  });

  function setView(view) {
    localStorage.setItem("board-view", view);
    state.view = view;
  }

  function editBoard() {
    if (!$BoardStore.activeBoard) {
      navigate(NPaths.routes.board("all"));
    } else {
      navigate(NPaths.routes.board($BoardStore.activeBoard.id));
    }
  }
  async function deleteBoard() {
    if ($BoardStore.activeBoard) {
      await BoardStore.deleteConfirm($BoardStore.activeBoard);
    }
  }

  function setBoardTrackers() {
    /** If its the ALL Board we need to handle it different **/
    if ($BoardStore.active == "all") {
      appTitle = "All";
      // Get the All Board
      let allBoard = $BoardStore.boards.find((b) => b.id == "all");
      let boardSort = allBoard ? allBoard.trackers : [];
      // // Loop over Tracker store - sorting by boardSort
      boardTrackers = Object.keys($TrackerStore.trackers)
        .sort((a, b) => {
          if (boardSort.indexOf(a) > boardSort.indexOf(b)) {
            return 1;
          } else if (boardSort.indexOf(a) < boardSort.indexOf(b)) {
            return -1;
          } else {
            return a > b ? 1 : -1;
          }
        })
        .map((tag) => {
          return $TrackerStore.trackers[tag];
        })
        // Remove any nulls
        .filter((tracker) => tracker);
    } else {
      /**
       * Else we have a real board and need to render it.
       */

      // Get Board Trackers from active Board
      appTitle = ($BoardStore.activeBoard || {}).label || "";
      // Get trackers from activeBoard
      boardTrackers = (($BoardStore.activeBoard || {}).trackers || [])
        .map(
          (tag) => {
            return $TrackerStore.trackers[tag];
          }
          // Remove any nulls
        )
        .filter((tracker) => tracker);
    }
  }

  async function boardOptions() {
    let buttons = [
      {
        title: "Add a Tracker",
        async click() {
          await tick(500);
          methods.addButtonTap();
        },
      },
      {
        title: `Edit / Sort ${$BoardStore.activeBoard ? $BoardStore.activeBoard.label : ""}...`,
        async click() {
          editBoard();
        },
      },
      {
        title: "Delete Tab...",
        disabled: $BoardStore.active === "all",
        async click() {
          deleteBoard();
        },
      },
    ];

    Interact.popmenu({
      title: `${$BoardStore.activeBoard ? $BoardStore.activeBoard.label : "All Trackers"}`,
      description: "Tab Options",
      buttons: buttons,
    });
  }

  // Component Methods
  const methods = {
    // When user starts searching

    // Toggle if the user is searching or not.
    async toggleSearch() {
      SearchStore.view("trackers");
    },

    // When the user wants to add a new tracker
    addButtonTap() {
      let buttons = [];
      // Add Library Button
      // If NOT "all" Board
      if ($BoardStore.active != "all") {
        // Add "Existing Tracker" button
        buttons.push({
          title: Lang.t("board.add-existing-tracker"),
          click: async () => {
            let trackers = await Interact.selectTrackers();

            BoardStore.addTrackersToActiveBoard(trackers);
            setTimeout(() => {
              state = state;
            }, 100);
          },
        });
      }
      // Add "Create Tracker" button
      buttons.push({
        title: Lang.t("board.create-custom-tracker", "Create a Tracker"),
        click() {
          methods.trackerEditor();
          // navigate("/tracker/design");
        },
      });

      buttons.push({
        title: Lang.t("board.browse-starter-trackers"),
        click() {
          TrackerLibrary.toggle();
        },
      });

      buttons.push({
        title: "Import from file",
        click() {
          TrackerStore.importFromFile();
        },
      });

      // Show Menu
      Interact.popmenu({
        buttons: buttons,
      });
    },
    /**
     * Inject the "All" board automatically
     * In past versions, managing this was a nightmare
     * Now i just add it on dynamically
     */
    injectAllBoard(boards) {
      // Get boards passed
      boards = boards || [];
      // Clone the board;

      let allBoard = $BoardStore.boards.find((b) => b.id == "all") || {
        id: "all",
        label: "All",
        trackers: Object.keys($TrackerStore.trackers || {}),
      };
      let b = boards.filter((b) => b.id !== "all");

      b.unshift(allBoard);
      return b;
    },

    /**
     * Control Tracker Editor
     */
    trackerEditor() {
      Interact.editTracker().then((tracker) => {
        BoardStore.addTracker(tracker);
      });
    },

    getLastUsed(tracker) {
      if ($LastUsed[tracker.tag]) {
        return time.fromNow($LastUsed[tracker.tag].date);
      } else {
        return undefined;
      }
    },

    /**
     * Create a new board
     * This will prompt the user to input a name
     * then create the new board
     */
    async newBoard() {
      let res = await Interact.prompt(Lang.t("board.add-a-board"), Lang.t("board.add-a-board-description"), {
        placeholder: Lang.t("board.board-input-placeholder"),
      });
      if (res) {
        let label = res.trim();
        if (label.toLowerCase() !== "all") {
          BoardStore.addBoard(label).then((board) => {
            BoardStore.setActive(board.id);
          });
        } else {
          Interact.alert("Error", "Sorry, All is a reserved named");
        }
      }
    },
    // Settings Shortcut - enable boards - tap on logo
    async enableBoards() {
      $UserStore.meta.boardsEnabled = true;
      await UserStore.saveMeta();
      methods.newBoard();
    },

    async trackerTapped(tracker) {
      return Interact.trackerTap(tracker, $TrackerStore.trackers);
    },
    // Show Tracker Options
    showTrackerOptions(tracker) {
      // Make it a real tracker in case it's not - doubling up shouldn't be a problem.
      tracker = new Tracker(tracker);

      // Remove Tracker Button Prompts
      const removeButton = {
        title: `${Lang.t("general.remove")}...`,
        async click() {
          // If we're on All - warn the hell out of the user
          if ($BoardStore.active === "all") {
            const confirmed = await Interact.confirm(
              Lang.t("general.delete-from-nomie", { thing: tracker.label }),
              Lang.t("tracker.delete-description")
            );
            if (confirmed) {
              await TrackerStore.deleteTracker(tracker).then((done) => {});
            }
          } else {
            // We're on another board - allow them to just remove the tracker
            const confirmed = await Interact.confirm(`Remove ${tracker.label} from this board?`, "You can always re-add it later");
            if (confirmed) {
              await BoardStore.removeTrackerFromBoard(tracker, $BoardStore.active);
            }
          }
        },
      };

      // If a Last Used is present
      let subtitle;
      if ($LastUsed.hasOwnProperty(tracker.tag)) {
        let last = $LastUsed[tracker.tag];
        if (last.log) {
          subtitle = `${Lang.t("board.last-used", "Last used")} ${dayjs(last.date).fromNow()}`;
        }
      }
      // Add Remove button to array
      TrackerStore.trackerOptions(tracker, {
        title: `${tracker.emoji || "⚪️"} ${tracker.label || tracker.tag}`,
        description: subtitle,
        buttons: [removeButton],
      });
      // Fire Pop menu
    }, // end showTrackerOptions
  };

  let boardUnsub;
  let ledgerUnsub;
  let activeLogUnsub;
  let trackerUnsub;
  let lastTrackers;

  onMount(() => {
    Device.scrollToTop();
    trackerUnsub = TrackerStore.subscribe((trackerStore) => {
      setTimeout(() => {
        boardTrackers = boardTrackers;
        setBoardTrackers();
      }, 120);
    });

    // Wait for changes to happen to the boardstore
    boardUnsub = BoardStore.subscribe((boardPayload) => {
      isReady.boards = true;
      checkIfReady("boardPayload");
      // If the board is ready, and it changes
      // Refire the setBoard Trackers for the new changes
      if (isReady.done) {
        setBoardTrackers();
      }
      /**
       * Board Check
       * If this board doesn't exist (user clears localstorage, switching data store, imports etc)
       * then we should set it to the ALL board
       **/
      if (boardPayload.boards.map((b) => b.id).indexOf(boardPayload.active) == -1 && boardPayload.active !== "all") {
        setTimeout(() => {
          BoardStore.setActive("all");
        }, 100);
      }
    });

    // Ledger Store Change
    ledgerUnsub = LedgerStore.subscribe((ledgerPayload) => {
      // If it's not saving
      if (!ledgerPayload.saving) {
        isReady.ledger = true; // say it's true
        checkIfReady("ledgerPayload"); // check for others
        setTimeout(() => {
          today = ledgerPayload.today;
          foundTrackers = foundTrackers; // force reaction
          boardTrackers = boardTrackers; // force reaction
        }, 100);
      }
    });

    // Active Log Change
    activeLogUnsub = ActiveLogStore.subscribe((log) => {
      state.addedTrackers = new NomieLog(log).getMeta().trackers.map((t) => t.id);
    });
    LedgerStore.getToday();
  }); // end onMount

  onDestroy(() => {
    boardUnsub();
    ledgerUnsub();
    activeLogUnsub();
    trackerUnsub();
  });
</script>

<style type="text/scss" name="scss">
  @import "../../scss/utils/_utils";
  @import "../../scss/vendor/bootstrap/base";

  :global(.n-board .tracker-button-wrapper) {
    @include media-breakpoint-up(md) {
      margin: 8pt;
    }
  }

  .n-board {
    padding: 0px 0px;
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    @include media-breakpoint-up(md) {
      padding-top: 20px;
    }
  }
  .no-trackers {
    min-height: 300px;
    height: 50vh;
    display: flex;
    color: var(--color-solid-3);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :global(.board-actions) {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px auto;
    margin-bottom: 32px;
    padding: 0 10px;
    max-width: 250px;
  }
</style>

<!-- Start App Layout -->
<NLayout pageTitle={appTitle}>
  <header slot="header" class="container">
    {#if $BoardStore.boards.length || $UserStore.meta.boardsEnabled}
      <div class="n-toolbar n-row px-3 h-100">
        {#if $TrackerStore.timers.length}
          <Button icon on:click={TrackerStore.toggleTimers} className="mr-1">
            <Icon name="time" size={24} className="fill-red" />
          </Button>
        {/if}
        <Button icon className="tap-icon" on:click={methods.toggleSearch}>
          <Icon name="search" size={24} />
        </Button>
        <NBoardTabs
          boards={methods.injectAllBoard($BoardStore.boards || [])}
          active={$BoardStore.active}
          on:create={methods.newBoard}
          on:tabTap={(event) => {
            BoardStore.setActive(event.detail.id, event.detail);
          }}>
          <div slot="right" class="n-row ml-2">
            <div class="filler" />
            <Button
              icon
              className="mx-2 mr-1"
              on:click={() => {
                methods.newBoard();
              }}>
              <Icon name="newTab" size="24" className="fill-primary-bright" />
            </Button>
            {#if $BoardStore.boards.length > 2}
              <Button
                icon
                className="pr-3 tap-icon"
                on:click={() => {
                  Interact.toggleBoardSorter();
                }}>
                <Icon name="arrowsLeftRight" size="24" className="fill-primary-bright" />
              </Button>
            {/if}
          </div>
        </NBoardTabs>

      </div>
    {:else}
      <NToolbarGrid>
        <div slot="left" class="d-flex">
          {#if $TrackerStore.timers.length}
            <Button icon className="tool pl-1" on:click={TrackerStore.toggleTimers}>
              <Icon name="time" size={20} className="fill-red" />
            </Button>
          {/if}
          <div class="pr-1 pl-2 {$TrackerStore.timers.length ? '' : ''}">
            <Button color="clear" on:click={methods.toggleSearch}>
              <Icon name="search" size={24} className={state.searching ? 'fill-red' : 'fill-primary-bright'} />
            </Button>
          </div>
        </div>
        <div slot="main" class="align-items-center">
          <LogoType color="rgba(155,155,155,0.5)" size={20} on:click={methods.enableBoards} />
        </div>
        <div slot="right">
          <Button icon on:click={methods.enableBoards}>
            <Icon name="newTab" size="20" className="fill-primary-bright" />
          </Button>
        </div>
      </NToolbarGrid>
    {/if}
  </header>
  <!-- end header-->
  <div slot="content" class="container board-container">

    {#if user}
      {#if !isReady.done}
        <div class="empty-notice">
          <Spinner />
        </div>
      {:else}
        {#if daysSinceLastBackup > 6 && $UserStore.launchCount > 10 && $UserStore.storageType == 'local' && $UserStore.meta.hideBackup == false}
          <div class="container-sm">
            <div class="backup pt-2 pb-1 text-center">
              <!--- If it's way back - it's not really set-->
              {#if daysSinceLastBackup > 1000}
                <Text inline size="sm" faded>No known backups</Text>
              {:else}
                <Text inline size="sm" faded>{daysSinceLastBackup} days since last backup</Text>
              {/if}
              <Text inline underline color="primary-bright" className="ml-2" size="sm" on:click={exportData}>Backup Now</Text>
            </div>
          </div>
        {/if}
        <OfflineQueue />
        {#if $TrackerStore.showTimers && $TrackerStore.timers.length}
          <div class="container">
            <Card>
              <ListItem compact>
                <Text size="sm">Running Timers</Text>
                <div slot="right">
                  <Button text size="xs" on:click={TrackerStore.toggleTimers}>Close</Button>
                </div>
              </ListItem>
              <TrackersList
                view="list"
                trackers={timers}
                on:tap={(evt) => {
                  methods.trackerTapped(evt.detail);
                }}
                hideAdd
                on:more={(evt) => {
                  methods.showTrackerOptions(evt.detail);
                }} />

            </Card>
          </div>
        {/if}
        <main class="n-board h-100" on:swipeleft={BoardStore.next} on:swiperight={BoardStore.previous}>
          <!-- Loop over trackers -->

          <TrackersList
            view={state.view}
            trackers={foundTrackers || boardTrackers}
            on:tap={(evt) => {
              methods.trackerTapped(evt.detail);
            }}
            on:add={methods.addButtonTap}
            on:more={(evt) => {
              methods.showTrackerOptions(evt.detail);
            }} />

          <!-- Include User Tips - shit should be a component -->

        </main>
        <div class="board-actions mt-5 mb-3 n-row" style="min-width:310px;">
          {#if $UserStore.meta.hiddenFeatures}
            <ButtonGroup className="mr-2 box-shadow-tight">
              <Button
                icon
                className={`${state.view == 'button' ? 'active' : ''}`}
                on:click={() => {
                  setView('button');
                }}>
                <Icon size="18" name="buttonView" />
              </Button>
              <Button
                icon
                className={`${state.view == 'list' ? 'active' : ''}`}
                on:click={() => {
                  setView('list');
                }}>
                <Icon size="18" name="list" />
              </Button>
              <Button
                icon
                className={`${state.view == 'detail' ? 'active' : ''}`}
                on:click={() => {
                  setView('detail');
                }}>
                <Icon size="18" name="detailView" />
              </Button>
            </ButtonGroup>
          {/if}
          <ButtonGroup className="mr-2 box-shadow-tight" style="max-width:150px">
            <Button on:click={boardOptions}>{Lang.t('board.edit-sort', 'Edit / Sort')}...</Button>
          </ButtonGroup>
        </div>
        <NTip {tips} />
      {/if}
    {/if}
  </div>
  <!-- End -->
  <div slot="footer">
    <div id="note-capture">
      <CaptureLog />
    </div>
  </div>
  <!-- end content-->
</NLayout>

{#if $Interact.boardSorter.show}
  <BoardSortModal />
{/if}

{#if state.showStartPacks}
  <NModal title="Starter Packs">
    <div slot="header">
      <NBoardTabs boards={StarterPacks.methods.asArray()} />
    </div>
  </NModal>
{/if}
