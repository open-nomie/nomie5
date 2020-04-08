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
  import tick from "../../utils/tick/tick";

  // Components
  import NTrackerButton from "./tracker-button.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NSearchBar from "../../components/search-bar/search-bar.svelte";
  import NBoardTabs from "../../components/board-tabs/board-tabs.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NHScroll from "../../components/h-scroller/h-scroller.svelte";
  import LogoType from "../../components/logo/logo.svelte";
  import LogoMark from "../../components/elephant.svelte";
  import NTip from "../../components/tip/tip.svelte";

  import CaptureLog from "../../components/capture-log.svelte";
  import Spinner from "../../components/spinner/spinner.svelte";

  // Containers
  import AppLayout from "../../containers/layout/app.svelte";
  import BoardSortModal from "../../containers/board/board-sort.svelte";

  // Modules/Libs/Utils
  import Tracker from "../../modules/tracker/tracker";
  import NomieLog from "../../modules/nomie-log/nomie-log";
  import StarterPacks from "../../modules/packs/starter-packs";
  import math from "../../utils/math/math";
  import Logger from "../../utils/log/log";
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import extractor from "../../utils/extract-trackers/extract-trackers";
  import promiseStep from "../../utils/promise-step/promise-step";

  import TrackerInputer from "../../modules/tracker/tracker-inputer";

  //Stores
  import { ActiveLogStore } from "../../store/active-log";
  import { LedgerStore } from "../../store/ledger";
  import { UserStore } from "../../store/user";
  import { BoardStore } from "../../store/boards";
  import { TrackerStore } from "../../store/trackers";
  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";
  import { TrackerLibrary } from "../../store/tracker-library";
  import { LastUsed } from "../../store/last-used";
  // Consts
  const console = new Logger("board.svelte");

  // Local Vars
  let user = undefined; // will hold the user when the user is ready - basically a ready var
  let today = {}; // holds today's activities
  let searchInput; // binding to dom element
  let foundTrackers = null; // for search results
  let boardTrackers = []; // Actual array to display to user

  // Browser Title
  let appTitle = "(Loading)";
  let _elSearchBar;

  // Data Storage
  let data = {
    selectedTracker: null, // populated when user tabs tracker
    showStartPacks: false, // shows the start library
    savingTrackers: [], // to highlight trackers that are being saved
    addedTrackers: [], // Visually showing what trackers are in the notes field
    searching: false, // if the user is searching
    searchTerm: null, // the search term the user is typing
    activeTip: 0, // index of the current tip to show
    hideTips: false // temp hide - it will stop showing after 12 launches.
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
    checking: false
  };

  // Check if it's ready
  const checkIfReady = requester => {
    if (isReady.done == false) {
      if (isReady.boards && $TrackerStore && isReady.ledger) {
        isReady.done = true;
        setTimeout(() => {
          methods.setBoardTrackers();
        }, 20);
      }
    }
  };

  /**
   * Add some tips to help new users
   * This will stop showing after 12 nomie launches
   **/

  let tips = [
    "Tap a button to track, press and hold for additional options",
    "The History tab shows you everything you've done",
    "Enable location tracking in the Settings for more data",
    "Tap the Tab icon in the upper right to enable Tracker Tabs",
    "You can manually track by writing a note. For example: Today is awesome! #mood(8) with @brandon",
    "Use @username in notes to tag people",
    "Include @username in a note to automatically tag that user.",
    "Include +context to add additional context to your log",
    "Tap the clock icon in the notes field to back date a log",
    "Tap the Location pin in the notes field to set a specific location",
    "Import data from places like IFTTT. Tap Settings, then Nomie API"
  ];

  // Wait for the User to be ready
  UserStore.onReady(() => {
    // Set user to kick off top view conditional.
    user = $UserStore; // Kick off
    // Setup Hooks These will fire on before safe, and onLogSave
    LedgerStore.hook("onBeforeSave", log => {
      data.savingTrackers = log.trackersArray().map(t => t.tag);
    }).hook("onLogSaved", log => {
      // Clear saving states
      data.savingTrackers = [];
      data.searching = false;
      data.addedTrackers = [];
    });
  });

  // Component Methods
  const methods = {
    editBoard() {
      navigate(`/board/${$BoardStore.activeBoard.id}`);
    },
    setBoardTrackers() {
      if ($BoardStore.active == "all") {
        appTitle = "All";
        // Convert trackers to array
        boardTrackers = Object.keys($TrackerStore)
          .map(tag => {
            return $TrackerStore[tag] || new Tracker({ tag: tag });
          })
          // Sort ALL by label
          .sort((a, b) => {
            return a.label > b.label ? 1 : -1;
          });
      } else {
        // Get Board Trackers from active Board
        appTitle = ($BoardStore.activeBoard || {}).label || "";
        // Get trackers from activeBoard
        boardTrackers = (($BoardStore.activeBoard || {}).trackers || []).map(
          tag => {
            return $TrackerStore[tag] || new Tracker({ tag: tag });
          }
        );
      }
    },

    // When user starts searching
    searchKeypress() {
      console.log("Search term", data.searchTerm);
      // Find trackers matching query
      foundTrackers = Object.keys($TrackerStore)
        .map(tag => {
          return $TrackerStore[tag];
        })
        .filter(tracker => {
          // Search the tag and the label
          let regex = new RegExp((data.searchTerm || "").trim(), "gi");
          return `${tracker.tag}-${tracker.label}`.search(regex) > -1;
        });
    },
    // Toggle if the user is searching or not.
    async toggleSearch() {
      if (data.searching) {
        methods.stopSearch();
      } else {
        data.searching = true;
        await tick(200);
        if (_elSearchBar) {
          _elSearchBar.focus();
        }
      }
    },
    stopSearch() {
      data.searchTerm = null;
      data.searching = false;
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
        }
      });
      // If NOT "all" Board
      if ($BoardStore.active != "all") {
        // Add "Existing Tracker" button
        buttons.push({
          title: Lang.t("board.add-existing-tracker"),
          click() {
            Interact.selectTrackers().then(tkrs => {
              BoardStore.addTrackersToActiveBoard(tkrs);
              setTimeout(() => {
                data = data;
              }, 100);
            });
          }
        });
      }
      // Add "Create Tracker" button
      buttons.push({
        title: Lang.t("board.create-custom-tracker"),
        click() {
          // methods.trackerEditor();
          navigate("/tracker/design");
        }
      });

      // Show Menu
      Interact.popmenu({
        buttons: buttons
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
      let b = boards.slice(0);
      // Add All to beginning
      b.unshift({
        id: "all",
        label: "All",
        trackers: Object.keys($TrackerStore || {})
      });
      return b;
    },

    /**
     * Control Tracker Editor
     */
    trackerEditor() {
      Interact.editTracker().then(tracker => {
        BoardStore.addTracker(tracker);
      });
    },

    getLastUsed(tracker) {
      if ($LastUsed.hasOwnProperty(tracker.tag)) {
        let last = $LastUsed[tracker.tag];
        if (last) {
          return dayjs(last.log.end);
        }
      }
      return null;
    },

    /**
     * Create a new board
     * This will prompt the user to input a name
     * then create the new board
     */
    async newBoard() {
      let res = await Interact.prompt(
        Lang.t("board.add-a-board"),
        Lang.t("board.add-a-board-description"),
        {
          placeholder: Lang.t("board.board-input-placeholder")
        }
      );
      if (res) {
        let label = res.trim();
        BoardStore.addBoard(label).then(board => {
          BoardStore.setActive(board.id);
        });
      }
    },
    // Settings Shortcut - enable boards - tap on logo
    async enableBoards() {
      $UserStore.meta.boardsEnabled = true;
      await UserStore.saveMeta();
      methods.newBoard();
    },
    // User Tapped a Tracker
    async trackerTapped(tracker) {
      // Set selected tracker to this one.
      data.selectedTracker = tracker;
      // Inserting new TrackerInputer
      let inputer = new TrackerInputer(tracker);
      let payload = await inputer.get();

      if (payload instanceof Array) {
        payload
          .filter(item => item)
          .forEach(item => {
            ActiveLogStore.addTag(item.tracker.tag, item.value);
          });
      } else if (payload) {
        ActiveLogStore.addTag(payload.tracker.tag, payload.value);
      }
      // One Tap Trackers
      // TODO move the adding to the activeLogStore here.
      if (tracker.one_tap) {
        LedgerStore.saveLog($ActiveLogStore);
      }
    },
    /**
     * Get Tracker Value
     * Used to get the current value of today for a given tracker
     * This will total or avg their values depending on the tracker calcuate
     */
    getTrackerValue(tracker) {
      // Default to null
      let value = null;

      // Does this tracker exist in today's map?
      if (today.hasOwnProperty(tracker.tag)) {
        // What type of Math should we do?
        if (tracker.math === "sum") {
          // Sum it up!
          value = math.round(math.sum(today[tracker.tag].values));
        } else {
          // Round things!
          value = math.round(math.average(today[tracker.tag].values));
        }
      }
      return value ? NomieUOM.format(value, tracker.uom) : null;
    },
    getPositivity(tracker) {
      let value = methods.getTrackerValue(tracker);
      if (value) {
        let trackerResults = today[tracker.tag];
        if (trackerResults && trackerResults.logs) {
          let scores = trackerResults.logs.map(log => {
            return log.score;
          });
          return math.sum(scores);
        }
      } else {
        return 0;
      }
    },
    /**
     * Get Hours Used
     * Used for generating the time-balls on the trackers
     * It maybe shouldn't be here, but it is for now
     */
    getHoursUsed(tracker) {
      if (today.hasOwnProperty(tracker.tag)) {
        return today[tracker.tag].hours;
      } else {
        return [];
      }
    },
    // Show Tracker Options
    showTrackerOptions(tracker) {
      // Make it a real tracker in case it's not - doubling up shouldn't be a problem.
      tracker = new Tracker(tracker);
      // Define buttons
      let buttons = [
        {
          title: "Stats",
          click() {
            Interact.openStats(tracker.tag);
          }
        },
        {
          title: "Edit Tracker",
          click() {
            Interact.editTracker(tracker);
          }
        }
      ];
      // Remove Tracker Button Prompts
      const removeButton = {
        title: `${Lang.t("general.remove")}...`,
        click() {
          // If we're on All - warn the hell out of the user
          if ($BoardStore.active === "all") {
            Interact.confirm(
              Lang.t("general.delete-from-nomie", { thing: tracker.label }),
              Lang.t("tracker.delete-description")
            ).then(res => {
              if (res) {
                // User said to delete it - so delete it.
                TrackerStore.deleteTracker(tracker).then(done => {});
              }
            });
          } else {
            // We're on another board - allow them to just remove the tracker
            Interact.confirm(
              `Remove ${tracker.label} from this board?`,
              "You can always re-add it later"
            ).then(res => {
              if (res) {
                // Remove it from the active Board
                BoardStore.removeTrackerFromBoard(tracker, $BoardStore.active);
              }
            });
          }
        }
      };

      // If a Last Used is present
      if ($LastUsed.hasOwnProperty(tracker.tag)) {
        let last = $LastUsed[tracker.tag];
        if (last.log) {
          buttons.push({
            title: `${Lang.t("board.last-used", "Last used")} ${dayjs(
              last.date
            ).fromNow()}`,
            click: async () => {
              let log = await LedgerStore.getLog(last.log, last.book);
              if (log) {
                Interact.openShareImage(log);
              } else {
                Interact.alert(
                  Lang.t("general.error", "Error"),
                  Lang.t(
                    "general.log-not-found",
                    "Sorry, that log was not found, was it deleted?"
                  )
                );
              }
            }
          });
        }
      }
      // Add Remove button to array
      buttons.push(removeButton);

      // Fire Pop menu
      Interact.popmenu({
        title: `${tracker.emoji || "⚪️"} ${tracker.label || tracker.tag}`,
        buttons: buttons
      });
    } // end showTrackerOptions
  };

  let boardUnsub;
  let ledgerUnsub;
  let activeLogUnsub;
  let trackerUnsub;
  let lastTrackers;

  onMount(() => {
    trackerUnsub = TrackerStore.subscribe(trackerStore => {
      setTimeout(() => {
        boardTrackers = boardTrackers;
        methods.setBoardTrackers();
      }, 120);
    });

    // Wait for changes to happen to the boardstore
    boardUnsub = BoardStore.subscribe(boardPayload => {
      isReady.boards = true;
      checkIfReady("boardPayload");
      // If the board is ready, and it changes
      // Refire the setBoard Trackers for the new changes
      if (isReady.done) {
        methods.setBoardTrackers();
      }
      /**
       * Board Check
       * If this board doesn't exist (user clears localstorage, switching data store, imports etc)
       * then we should set it to the ALL board
       **/
      if (
        boardPayload.boards.map(b => b.id).indexOf(boardPayload.active) == -1 &&
        boardPayload.active !== "all"
      ) {
        setTimeout(() => {
          BoardStore.setActive("all");
        }, 100);
      }
    });

    // Ledger Store Change
    ledgerUnsub = LedgerStore.subscribe(ledgerPayload => {
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
    activeLogUnsub = ActiveLogStore.subscribe(log => {
      /**
       * Active Log Change
       * When the log changes, extract the trackers so we can
       * make them pulse
       */
      data.addedTrackers = new NomieLog(log).trackersArray().map(t => t.tag);
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

  .n-board {
    padding: 0px 0px;
    background-color: var(--color-bg);
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    @include media-breakpoint-up(md) {
      padding-top: 20px;
    }

    .new-user {
      font-size: 0.7rem;
      max-width: 280px;
      border-radius: 30px;
      background-color: transparent;
      border: var(--modal-border);
      color: var(--color-inverse-2);
      margin: 10px auto;
      padding: 6px 20px;
      line-height: 115%;
      flex-grow: 0;
      .main {
        text-align: center;
      }
      .btn {
        &:active {
          color: var(--color-inverse);
        }
      }
    }
  }
  .n-add-button {
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

  .zmdi-search.active {
    transform: scale(1.5);
    background-color: var(--color-solid) !important;
    color: var(--color-green) !important;
    box-shadow: var(--box-shadow-float) !important;
    border-radius: 50% !important;
    z-index: 1000;
  }
  .zmdi-search {
    z-index: 10;
    color: var(--color-inverse);
  }
  .n-board .trackers {
    // max-width: 100%;
    // min-height: 30vh;
    // padding: 10px 0;
    // display: flex;
    // flex-direction: row;
    // flex-wrap: wrap;
    // align-items: flex-start;
    // justify-content: center;
  }

  .board-edit-button {
    min-width: 40px;
    min-height: 40px;
    width: 40px;
    height: 40px;
    flex-grow: 0;
    flex-shrink: 0;
    border-radius: 20px;
    font-size: 22px;
    background-color: var(--color-faded-1);
    color: var(--color-inverse) !important;
  }
  .board-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px;
    margin-bottom: 32px;
    padding: 0 10px;
  }
</style>

<!-- Start App Layout -->
<AppLayout title={appTitle}>
  <div slot="header">
    {#if $BoardStore.boards.length || $UserStore.meta.boardsEnabled}
      <div class="container p-0 n-row h-100">
        {#if TrackerStore.getAsArray().length > 13}
          <button class="btn tap-icon px-2" on:click={methods.toggleSearch}>
            <NIcon
              name="search"
              className={data.searching ? 'fill-primary-bright' : 'fill-faded-2'} />
          </button>
        {/if}

        <NBoardTabs
          boards={methods.injectAllBoard($BoardStore.boards || [])}
          active={$BoardStore.active}
          on:create={methods.newBoard}
          on:tabTap={event => {
            methods.stopSearch();
            BoardStore.setActive(event.detail.id);
          }}>
          {#if $BoardStore.boards.length > 1}
            <button
              class="btn btn-clear tap-icon px-2 pl-1"
              on:click={() => {
                Interact.toggleBoardSorter();
              }}>
              <NIcon name="sort" className="fill-primary-bright" />
            </button>
          {/if}
        </NBoardTabs>
      </div>
    {:else}
      <NToolbarGrid>
        <div slot="main" class="align-items-center">
          <LogoType size={20} on:click={methods.enableBoards} />
        </div>
        <button
          slot="right"
          class="btn btn-clear btn-icon tap-icon"
          on:click={methods.enableBoards}>
          <NIcon name="newTab" size="20" />
        </button>
      </NToolbarGrid>
    {/if}
    {#if data.searching}
      <NSearchBar
        bind:this={_elSearchBar}
        className="mt-2"
        autocomplete
        on:clear={() => {
          data.searchTerm = null;
        }}
        on:change={value => {
          data.searchTerm = value.detail;
          methods.searchKeypress();
          console.log('On Change?', value.detail);
        }}
        placeholder="{Lang.t('general.search-trackers', 'Search Trackers')}...">
        <button
          slot="right-inside"
          class="btn btn-clear"
          on:click={methods.toggleSearch}>
          <NIcon name="close" className="fill-faded-2" />
        </button>
      </NSearchBar>
    {/if}
  </div>
  <!-- end header-->
  <div slot="content" class="container board-container">
    {#if user}
      {#if !isReady.done}
        <div class="empty-notice">
          <Spinner />
        </div>
      {:else}
        <main class="n-board h-100">

          <!-- Loop over trackers -->
          <div class="trackers n-grid">

            {#if (foundTrackers || boardTrackers || []).length === 0}
              {#if foundTrackers != null}
                <div class="no-trackers">
                  {Lang.t('board.no-search-results', 'No trackers found')}
                </div>
              {/if}
            {/if}
            <!-- lastUsed={methods.getLastUsed(tracker)} -->
            {#each foundTrackers || boardTrackers as tracker (tracker.tag)}
              <NTrackerButton
                {tracker}
                value={methods.getTrackerValue(tracker)}
                hoursUsed={methods.getHoursUsed(tracker)}
                positivity={methods.getPositivity(tracker)}
                on:click={() => {
                  methods.trackerTapped(tracker);
                }}
                disabled={data.savingTrackers.indexOf(tracker.tag) > -1}
                className={`${data.addedTrackers.indexOf(tracker.tag) > -1 ? 'added pulse' : ''} ${data.savingTrackers.indexOf(tracker.tag) > -1 ? 'wiggle saving' : ''}`}
                on:longpress={() => {
                  methods.showTrackerOptions(tracker);
                }} />
            {/each}
            {#if !data.searching}
              <NTrackerButton
                on:click={methods.addButtonTap}
                tracker={{ label: 'Add', emoji: '➕' }} />
            {/if}
          </div>

          <!-- Include User Tips - shit should be a component -->
          <NTip {tips} />

          <div class="board-actions">
            {#if $BoardStore.activeBoard}
              <button
                on:click={methods.editBoard}
                class="btn btn btn-round board-edit-button clickable">
                <i class="zmdi zmdi-more" />
              </button>
            {/if}
          </div>

        </main>
      {/if}
    {/if}
  </div>
  <div slot="footer">
    <div id="note-capture">
      <CaptureLog />
    </div>
  </div>
  <!-- end content-->
</AppLayout>

{#if $Interact.boardSorter.show}
  <BoardSortModal />
{/if}

{#if data.showStartPacks}
  <NModal title="Starter Packs">
    <div slot="header">
      <NBoardTabs boards={StarterPacks.methods.asArray()} />
    </div>
  </NModal>
{/if}
