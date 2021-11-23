<script lang="ts">
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

  // Components
  import Icon from "../../components/icon/icon.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NTip from "../../components/tip/tip.svelte";
  import CaptureLog from "../../components/capture-log/capture-log.svelte";
  import Spinner from "../../components/spinner/spinner.svelte";
  import NBoardTabs from "../../components/board-tabs/board-tabs.svelte";
  import Button from "../../components/button/button.svelte";
  import Text from "../../components/text/text.svelte";
  import OfflineQueue from "../../components/offline-queue/offline-queue.svelte";
  import ListItem from "../../components/list-item/list-item.svelte";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Card from "../../components/card/card.svelte";
  import Toolbar from "../../components/toolbar/toolbar.svelte";
  import Empty from "../empty/empty.svelte";
  import TrackersList from "./trackers.svelte";

  // Containers
  import NLayout from "../../containers/layout/layout.svelte";
  import BoardSortModal from "../../containers/board/board-sort.svelte";

  // Modules/Libs/Utils
  import Tracker from "../../modules/tracker/tracker";
  import NomieLog from "../../modules/nomie-log/nomie-log";
  import StarterPacks from "../../modules/packs/starter-packs";
  import tick from "../../utils/tick/tick";
  import time from "../../utils/time/time";
  import { truncate } from "../../utils/text/text";
  import exportData from "../../modules/export/export-helper";

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
  import { Device } from "../../store/device-store";
  import { SearchStore } from "../../store/search-store";

  import NPaths from "../../paths";
  import Swipeable from "../../components/swipeable/swipeable.svelte";
import Container from "../../components/container/container.svelte";
import { DotsCircleHorizontal } from "svelte-hero-icons";

  // Consts

  // Local Vars
  let user = undefined; // will hold the user when the user is ready - basically a ready var

  let foundTrackers = null; // for search results
  let boardTrackers = []; // Actual array to display to user
  let daysSinceLastBackup = 0;
  // Browser Title
  let appTitle = "(Loading)";

  // Data Storage
  let state = {
    selectedTracker: null, // populated when user tabs tracker
    showStartPacks: false, // shows the start library
    savingTrackers: [], // to highlight trackers that are being saved
    addedTrackers: [], // Visually showing what trackers are in the notes field
    activeTip: 0, // index of the current tip to show
    hideTips: false, // temp hide - it will stop showing after 12 launches.
    view: localStorage.getItem("board-view") || "detail", // button "list" | "detail" | "button" 
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
        setBoardTrackers();
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
        // Remove any nulls -- or trackers that are marked as hidden
        .filter((tracker) => tracker && !tracker.hidden);
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

  async function boardOptions(board?:any) {
    board = board || $BoardStore.activeBoard;
    let buttons = [
      {
        title: `${Lang.t("general.add-a-tracker", "Add a Tracker")}`,
        icon: "addOutline",
        async click() {
          await tick(300);
          methods.addButtonTap();
        },
      },
      {
        title: `${Lang.t("board.manage-this-tab", "Manage this Tab")}`,
        icon: "edit",
        async click() {
          editBoard();
        },
        divider: true,
      },

      {
        title: `${Lang.t("board.create-new-board", "Add New Tab")}`,
        icon: "addFolder",
        async click() {
          methods.newBoard();
        },
      },
      {
        title: `${Lang.t("board.organize-tabs", "Organize Tabs")}`,
        icon: "switch",
        async click() {
          Interact.toggleBoardSorter();
        },
        divider: true,
      },
      {
        title: `${Lang.t("general.all-nomie-settings", "More Nomie Settings")}`,
        icon: "settings",
        async click() {
          navigate("/settings");
        },
      },
    ];

    Interact.popmenu({
      title: `${board && board.label ? board.label : "All Trackers"}`,
      description: `${Lang.t("board.board-options", "Tab Options")}`,
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

      // Add "Create Tracker" button
      buttons.push({
        title: `${Lang.t("board.create-custom-tracker", "Create a Tracker")}`,
        icon: "addOutline",
        click() {
          methods.trackerEditor();
          // navigate("/tracker/design");
        },
      });

      // If NOT "all" Board
      if ($BoardStore.active != "all") {
        // Add "Existing Tracker" button
        buttons.push({
          title: `${Lang.t("board.add-existing-tracker", "Pick from My Trackers")}`,
          icon: "chip",
          click: async () => {
            let trackers = await Interact.selectTrackers();

            BoardStore.addTrackersToActiveBoard(trackers);
            setTimeout(() => {
              state = state;
            }, 20);
          },
        });
      }

      buttons.push({
        title: `${Lang.t("board.browse-starter-trackers", "Browse Library")}`,
        icon: "library",
        click() {
          TrackerLibrary.toggle();
        },
      });

      buttons.push({
        title: `${Lang.t("general.import-from-file", "Import from File")}`,
        icon: "upload",
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
    async trackerEditor() {
      try {
        const tracker = await Interact.editTracker(undefined).catch(e=>{throw e});
        BoardStore.addTracker(tracker);
      } catch(e) {
        alert(e.message);
      }
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
      let res:any = await Interact.prompt(
        `${Lang.t("board.add-a-board")}`,
        `${Lang.t(
          "board.add-a-board-description",
          "Tabs help you organize your trackers. For example: social, food, and fitness can contain trackers specifically for those activies. You can have the same tracker on multiple tabs."
        )}`,
        {
          placeholder: `${Lang.t("board.board-input-placeholder", "Tab name or Emoji 👍")}`,
        }
      );
      if (res) {
        let label = res.trim();
        if (label.toLowerCase() !== "all") {
          BoardStore.addBoard(label).then((board:any) => {
            BoardStore.setActive(board.id);
          });
        } else {
          Interact.error("Sorry, 'All' is a reserved word");
        }
      }
    },
    // Settings Shortcut - enable boards - tap on logo

    async trackerTapped(tracker) {
      return Interact.trackerTap(tracker, $TrackerStore.trackers);
    },
    // Show Tracker Options
    showTrackerOptions(tracker) {
      // Make it a real tracker in case it's not - doubling up shouldn't be a problem.
      tracker = new Tracker(tracker);

      // Remove Tracker Button Prompts
      const removeButton = {
        title: `${(Lang.t("general.remove"), "Remove")}...`,
        icon: "delete",
        async click() {
          // If we're on All - warn the hell out of the user
          if ($BoardStore.active === "all") {
            const confirmed = await Interact.confirm(
              `${tracker.label} - ${Lang.t("general.delete-from-nomie", "Delete from Nomie?")}`,
              `${Lang.t("tracker.delete-description", "No tracked data will be deleted. You can always recreate this tracker")}`
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

  onMount(() => {
    Device.scrollToTop();
    trackerUnsub = TrackerStore.subscribe((trackerStore) => {
      boardTrackers = boardTrackers;
      setBoardTrackers();
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
        }, 20);
      }
    });

    // Ledger Store Change
    ledgerUnsub = LedgerStore.subscribe((ledgerPayload) => {
      // If it's not saving
      if (!ledgerPayload.saving) {
        isReady.ledger = true; // say it's true
        checkIfReady("ledgerPayload"); // check for others
        setTimeout(() => {
          foundTrackers = foundTrackers; // force reaction
          boardTrackers = boardTrackers; // force reaction
        }, 20);
      }
    });

    // Active Log Change
    activeLogUnsub = ActiveLogStore.subscribe((log) => {
      // Used for knowing which trackers are current active
      // TODO bring this back
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

<!-- Start App Layout -->
<NLayout pageTitle={appTitle}>
  <header slot="header">
    <Toolbar>
      {#if $TrackerStore.timers.length}
        <Button icon on:click={TrackerStore.toggleTimers} className="mr-1" ariaLabel={Lang.t('general.timers', 'Timers')}>
          <Icon name="time" size={24} className="fill-red" />
        </Button>
      {/if}
      <Button icon on:click={methods.toggleSearch} ariaLabel={Lang.t('general.search')}>
        <Icon name="search" className="text-primary-500" size={24} />
      </Button>

      <!-- Tabs -->

      <NBoardTabs
        boards={methods.injectAllBoard($BoardStore.boards || [])}
        active={$BoardStore.active}
        on:create={methods.newBoard}
        on:longPress={(evt) => {
          boardOptions(evt.detail);
        }}
        on:tabTap={(event) => {
          BoardStore.setActive(event.detail.id);
        }}
      />

      <Button icon className="board-option-action text-primary-500" on:click={() => boardOptions()} ariaLabel={Lang.t('general.settings', 'Settings')}>
        <Icon icon={DotsCircleHorizontal} className="text-primary-500" size={24} />
      </Button>

    </Toolbar>
  </header>
  <!-- end header-->
  <div slot="content" class="board-container bg-gray-100 dark:bg-gray-800 pt-4">
    {#if $UserStore.storageType == 'blockstack'}
      <div class="blockstack-warning my-1">
        ⚠️ Blockstack Storage is deprecated.
        <a href="https://nomie.app/tutorials/blockstack-storage">Learn More</a>
      </div>
    {/if}
    <OfflineQueue />
    {#if user}
      {#if !isReady.done}
        <div class="empty-notice">
          <Spinner />
        </div>
      {:else}
        {#if daysSinceLastBackup > 6 && $UserStore.launchCount > 10 && $UserStore.storageType == 'local' && $UserStore.meta.hideBackup == false}
          <div class="container-sm flex items-center justify-center">
            <button aria-label="Backup your data" 
                on:click={exportData} 
                class="py-2 mb-2 px-3 text-sm flex items-center text-center backup bg-gray-400 dark:bg-black dark:text-white bg-opacity-20 rounded-full">
              <!--- If it's way back - it's not really set-->
              {#if daysSinceLastBackup > 1000} 
                <div class="opacity-60">
                  <Icon name="bell" size={12} />
                  {Lang.t('general.no-known-backups', 'No recent backups')}
                </div>
              {:else}
                <div>{daysSinceLastBackup} days since last backup</div>
              {/if}
              <div class="ml-2 text-black dark:text-white font-bold" >
                {Lang.t('general.backup-now', 'Backup Now')}
              </div>
            </button>
          </div>
        {/if}

        {#if $TrackerStore.showTimers && $TrackerStore.timers.length}
          <Container>
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
                }}
              />

            </Card>
          </Container>
        {/if}

        <main class="overflow-x-hidden n-board h-100">
          <!-- Loop over trackers -->
          <Swipeable on:left={BoardStore.next} on:right={BoardStore.previous}>
            {#if (foundTrackers || boardTrackers || []).length === 0}
              <Empty
                title={Lang.t('board.empty-title', 'This tab is empty')}
                emoji="🤔"
                description={Lang.t('board.empty-description', 'Add from your existing trackers, or browse the library to discover new things to track.')}
                buttonLabel={`${Lang.t('general.add-a-tracker', 'Add a Tracker')}...`}
                buttonClick={methods.addButtonTap}
              />
            {/if}

            <TrackersList
              view={state.view}
              trackers={foundTrackers || boardTrackers}
              on:tap={(evt) => {
                methods.trackerTapped(evt.detail);
              }}
              hideAdd={(foundTrackers || boardTrackers || []).length === 0}
              on:add={methods.addButtonTap}
              on:more={(evt) => {
                methods.showTrackerOptions(evt.detail);
              }}
            />

            <!-- Include User Tips - shit should be a component -->
          </Swipeable>
        </main>

        {#if (foundTrackers || boardTrackers || []).length}
          <div class="mt-5 mb-3 board-actions flex" style="min-width:100px;">
            
            <ButtonGroup className="mr-2 box-shadow-tight bg-transparent">
              <Button
                icon
                className={`${state.view == 'button' ? 'active' : 'bg-transparent'}`}
                on:click={() => {
                  setView('button');
                }}
              >
                <Icon size={18} name="buttonView" />
              </Button>
              <Button
                icon
                className={`${state.view == 'list' ? 'active' : 'bg-transparent'}`}
                on:click={() => {
                  setView('list');
                }}
              >
                <Icon size={18} name="list" />
              </Button>
              <Button
                icon
                className={`${state.view == 'detail' ? 'active' : 'bg-transparent'}`}
                on:click={() => {
                  setView('detail');
                }}
              >
                <Icon size={18} name="detailView" />
              </Button>
            </ButtonGroup>

          </div>
        {/if}
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

<style type="postcss" global >


  .blockstack-warning {
    padding: 8px;
    text-align: center;
    color: var(--color-inverse-2);
    font-size: small;
  }

  .n-board {
    padding: 0px 0px;
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    /* @include media-breakpoint-up(md) {
      padding-top: 20px;
    } */
  }

  .board-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px auto;
    margin-bottom: 32px;
    padding: 0 10px;
    max-width: 250px;
  }
</style>
