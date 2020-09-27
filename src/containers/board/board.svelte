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
    searching: false, // if the user is searching
    searchTerm: null, // the search term the user is typing
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
      state.searching = false;
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
        title: "Edit / Reorder",
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
    searchKeypress() {
      // Find trackers matching query
      foundTrackers = Object.keys($TrackerStore.trackers)
        .map((tag) => {
          return $TrackerStore.trackers[tag];
        })
        .filter((tracker) => {
          // Search the tag and the label
          let regex = new RegExp((state.searchTerm || "").trim(), "gi");
          return `${tracker.tag}-${tracker.label}`.search(regex) > -1;
        });
    },
    // Toggle if the user is searching or not.
    async toggleSearch() {
      if (state.searching) {
        methods.stopSearch();
      } else {
        state.searching = true;
        await tick(200);
        if (_elSearchBar) {
          _elSearchBar.focus();
        }
      }
    },
    stopSearch() {
      state.searchTerm = null;
      state.searching = false;
      foundTrackers = null;
    },
    // When the user wants to add a new tracker
    addButtonTap() {
      let buttons = [];
      // Add Library Button
      buttons.push({
        title: Lang.t("board.browse-starter-trackers"),
        click() {
          TrackerLibrary.toggle();
        },
      });
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
        title: Lang.t("board.create-custom-tracker"),
        click() {
          // methods.trackerEditor();
          navigate("/tracker/design");
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
      let inputer = new TrackerInputer(tracker, $TrackerStore);
      let note = await inputer.getElements();

      if (note.length) {
        ActiveLogStore.addElement(note.join(" "));
        if (inputer.lastAction == "save" || tracker.one_tap) {
          await LedgerStore.saveLog($ActiveLogStore);
          await ActiveLogStore.clear();
        }
      }

      return note;
    },

    /**
     * Get Tracker Value
     * Used to get the current value of today for a given tracker
     * This will total or avg their values depending on the tracker calcuate
     */
    // getTrackerValue(tracker) {
    //   // Default to null
    //   let value = null;

    //   // Does this tracker exist in today's map?
    //   if (today.hasOwnProperty(tracker.tag)) {
    //     // What type of Math should we do?
    //     if (tracker.math === "sum") {
    //       // Sum it up!
    //       value = math.round(math.sum(today[tracker.tag].values));
    //     } else {
    //       // Round things!
    //       value = math.round(math.average(today[tracker.tag].values));
    //     }
    //   }
    //   return value ? NomieUOM.format(value, tracker.uom) : null;
    // },
    // getPositivity(tracker) {
    //   let value = methods.getTrackerValue(tracker);
    //   value = value || 0;
    //   return ScoreTracker(value, tracker);
    // },
    /**
     * Get Hours Used
     * Used for generating the time-balls on the trackers
     * It maybe shouldn't be here, but it is for now
     */
    // getHoursUsed(tracker) {
    //   if (today.hasOwnProperty(tracker.tag)) {
    //     return today[tracker.tag].hours;
    //   } else {
    //     return [];
    //   }
    // },
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
            const confirmed = Interact.confirm(`Remove ${tracker.label} from this board?`, "You can always re-add it later");
            if (confirmed) {
              BoardStore.removeTrackerFromBoard(tracker, $BoardStore.active);
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
  <header slot="header">
    {#if $BoardStore.boards.length || $UserStore.meta.boardsEnabled}
      <div class="container p-0 n-row h-100">
        {#if $TrackerStore.timers.length}
          <button class="btn tab tap-icon pl-3 pr-2" on:click={TrackerStore.toggleTimers}>
            <Icon name="time" size={24} className="fill-red-pulse" />
          </button>
        {/if}
        <!-- IF MORE THAN 13 TRACKERS - SHOW SEARCH ICON-->
        {#if Object.keys($TrackerStore.trackers).length > 13}
          <button class="btn tab tap-icon pr-2 {$TrackerStore.timers.length ? 'pl-1' : ''}" on:click={methods.toggleSearch}>
            <Icon name="search" size={24} className={state.searching ? 'fill-red' : ''} />
          </button>
        {:else}
          <div class="pr-2" />
        {/if}

        <NBoardTabs
          boards={methods.injectAllBoard($BoardStore.boards || [])}
          active={$BoardStore.active}
          on:create={methods.newBoard}
          on:tabTap={(event) => {
            methods.stopSearch();
            BoardStore.setActive(event.detail.id, event.detail);
          }}>
          <div slot="right" class="n-row ml-2">
            <div class="filler" />
            <Button
              color="transparent"
              icon
              className="mx-2 mr-3 tap-icon"
              on:click={() => {
                methods.newBoard();
              }}>
              <Icon name="newTab" size="24" />
            </Button>
            {#if $BoardStore.boards.length > 2}
              <Button
                color="transparent"
                icon
                className="px-2 tap-icon"
                on:click={() => {
                  Interact.toggleBoardSorter();
                }}>
                <Icon name="arrowsLeftRight" size="24" />
              </Button>
            {/if}
          </div>
        </NBoardTabs>

      </div>
    {:else}
      <NToolbarGrid>
        <div slot="left">
          {#if $TrackerStore.timers.length}
            <button class="btn tool tap-icon pl-2" on:click={TrackerStore.toggleTimers}>
              <Icon name="time" size={20} className="fill-red-pulse" />
            </button>
          {/if}
        </div>
        <div slot="main" class="align-items-center">
          <LogoType size={20} on:click={methods.enableBoards} />
        </div>
        <button slot="right" class="btn btn-clear btn-icon tap-icon" on:click={methods.enableBoards}>
          <Icon name="newTab" size="20" />
        </button>
      </NToolbarGrid>
    {/if}
  </header>
  <!-- end header-->
  <div slot="content" class="container board-container">

    {#if state.searching}
      <div class="px-2">
        <NSearchBar
          bind:this={_elSearchBar}
          className="mt-2"
          autocomplete
          on:clear={() => {
            state.searchTerm = null;
          }}
          on:change={(value) => {
            state.searchTerm = value.detail;
            methods.searchKeypress();
          }}
          placeholder="{Lang.t('general.search-trackers', 'Search Trackers')}...">
          <button slot="right-inside" class="btn btn-clear" on:click={methods.toggleSearch}>
            <Icon name="close" className="fill-faded-2" />
          </button>
        </NSearchBar>
      </div>
    {/if}
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
          <div class="n-list solo pb-2" style="min-height:auto">
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
              on:more={(evt) => {
                methods.showTrackerOptions(evt.detail);
              }} />

          </div>
        {/if}
        <main class="n-board h-100" on:swipeleft={BoardStore.next} on:swiperight={BoardStore.previous}>
          <!-- Loop over trackers -->

          {#if (foundTrackers || boardTrackers || []).length === 0}
            {#if foundTrackers != null}
              <div class="no-trackers">{Lang.t('board.no-search-results', 'No trackers found')}</div>
            {:else}
              <div class="no-trackers d-flex flex-column align-items-center justify-content-center">
                {Lang.t('board.add-some-trackers', 'Sure is empty in here')}
                <Button text on:click={methods.addButtonTap}>Add a Tracker</Button>
              </div>
            {/if}
          {/if}
          <!-- lastUsed={methods.getLastUsed(tracker)} -->
          <!-- {#if true === true} -->
          <TrackersList
            view={state.view}
            trackers={foundTrackers || boardTrackers}
            on:tap={(evt) => {
              methods.trackerTapped(evt.detail);
            }}
            on:more={(evt) => {
              methods.showTrackerOptions(evt.detail);
            }} />

          <!-- Include User Tips - shit should be a component -->

        </main>
        <div class="board-actions mt-5 mb-2 n-row" style="min-width:200px;">
          {#if $UserStore.meta.hiddenFeatures}
            <div class="btn-group mr-1 compact">
              <Button
                icon
                className="px-1"
                on:click={() => {
                  setView('button');
                }}>
                <Icon size="18" name="buttonView" className={`${state.view == 'button' ? 'fill-primary' : ''}`} />
              </Button>
              <Button
                icon
                className="px-1"
                on:click={() => {
                  setView('list');
                }}>
                <Icon size="18" name="list" className={`${state.view == 'list' ? 'fill-primary' : ''}`} />
              </Button>
              <Button
                icon
                className="px-0"
                on:click={() => {
                  setView('detail');
                }}>
                <Icon size="18" name="detailView" className={`${state.view == 'detail' ? 'fill-primary' : ''}`} />
              </Button>
            </div>
          {/if}
          <div class="btn-group ml-1 mr-1">
            <Button on:click={methods.addButtonTap} class="px-1">
              <Icon name="add" size={14} className="mr-1" />
              <Text size="sm">Add</Text>
            </Button>
          </div>
          <div class="btn-group ml-1">
            <Button on:click={boardOptions} color="clear" class="px-1">
              <Text size="sm">{Lang.t('general.options', 'Options')}</Text>
            </Button>
          </div>

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
