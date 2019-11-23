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

  // Components
  import NTrackerButton from "./tracker-button.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NBoardTabs from "../../components/board-tabs/board-tabs.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NHScroll from "../../components/h-scroller/h-scroller.svelte";
  import LogoType from "../../components/logo/logo.svelte";
  import LogoMark from "../../components/elephant.svelte";

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
    "Press and hold a tracker button for more options",
    "The History tab shows you everything you've done",
    "Check out the settings to change the theme",
    "Enable auto location in the Settings for deeper data",
    "Want to organize your trackers? Click the nomie logo above to enable Tabs",
    "Want to auto import data?  Settings -> Nomie API"
  ];

  // Wait for the User to be ready
  UserStore.onReady(() => {
    console.log("User onReady");
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
    nextTip() {
      if (data.activeTip == tips.length - 1) {
        data.activeTip = 0;
      } else {
        data.activeTip++;
      }
    },
    previousTip() {
      if (data.activeTip == 0) {
        data.activeTip = tips.length - 1;
      } else {
        data.activeTip--;
      }
    },
    // When user starts searching
    searchKeypress() {
      // Find trackers matching query
      foundTrackers = Object.keys($TrackerStore)
        .map(tag => {
          return $TrackerStore[tag];
        })
        .filter(tracker => {
          // Search the tag and the label
          let regex = new RegExp(data.searchTerm.trim(), "gi");
          return `${tracker.tag}-${tracker.label}`.search(regex) > -1;
        });
    },
    // Toggle if the user is searching or not.
    toggleSearch() {
      if (data.searching) {
        methods.stopSearch();
      } else {
        data.searching = true;
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
          methods.trackerEditor();
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
      let res = await Interact.confirm(
        "Enable tabs?",
        "This will allow you to organize a bunch of trackers."
      );
      $UserStore.meta.boardsEnabled = res;
      UserStore.saveMeta();
    },
    // User Tapped a Tracker
    async trackerTapped(tracker) {
      // Set selected tracker to this one.
      data.selectedTracker = tracker;

      // Inserting new TrackerInputer
      let inputer = new TrackerInputer(tracker);

      inputer.get().then(value => {
        console.log("Got the value", value);
      });

      // // If it's a plain old tick tracker
      // if (tracker.type === "tick") {
      //   // Just add the tag to the note
      //   ActiveLogStore.addTag(tracker.tag);

      //   // If it's one_tap - then save it
      //   if (tracker.one_tap === true) {
      //     // Make the note
      //     let note = $ActiveLogStore.note + "";

      //     // Account for Positivity calculation
      //     // This is for display only, the scores are always
      //     // dynamically calculated
      //     $ActiveLogStore.score = ActiveLogStore.calculateScore(
      //       note,
      //       $TrackerStore
      //     );
      //     try {
      //       // Save the log
      //       await LedgerStore.saveLog($ActiveLogStore);

      //       // Let user Know it was saved
      //       Interact.toast(`Saved ${note}`);

      //       // Clear Log
      //       ActiveLogStore.clear();
      //     } catch (e) {
      //       // Catch any problems
      //       Interact.alert("Error", e.message);
      //     }
      //     // Refresh View
      //     setTimeout(() => {
      //       data.savingTrackers = [];
      //       data = data;
      //     }, 100);
      //   }
      //   // If it's a note (combined trackers)
      // } else if (tracker.type === "note") {
      //   /**
      //    * Note Tracker Type
      //    * This is a note tracker type and will
      //    * ask the user to provide inputs for
      //    * each type of note
      //    **/

      //   // Get Trackers from the Note
      //   let trackerTags = extractor(tracker.note);

      //   // Add Note Tracker Tag to the note first...
      //   // This way we can look up some stats on it too
      //   ActiveLogStore.addTag(tracker.tag);

      //   // Create array of items to pass to promise step
      //   let items = Object.keys(trackerTags).map(tag => {
      //     return {
      //       tracker: $TrackerStore[tag] || new Tracker({ tag: tag }),
      //       value: trackerTags[tag].value // not being used
      //     };
      //   });

      //   /**
      //    * Promise Step
      //    * Loop over each of the items { tracker: [object], value: value }
      //    * If this is a multiple tracker request we will show each of the
      //    * tracker inputs one at a time using the promise step function
      //    */
      //   promiseStep(items, item => {
      //     return new Promise((resolve, reject) => {
      //       // testing if going direct works
      //       $Interact.trackerInput.show = false;
      //       $Interact.trackerInput.tracker = null;
      //       $Interact.trackerInput.onInteract = null;
      //       // Wait for timeout
      //       setTimeout(() => {
      //         // Show Tracker Input for this given tracker
      //         // then return the promise and move on to the next
      //         Interact.trackerInput(item.tracker, item.value)
      //           .then(resolve)
      //           .catch(reject);
      //       }, 12);
      //     });
      //   });
      // } else {
      //   // It's an input of some sort
      //   Interact.trackerInput(tracker);
      // } // end if tick or others
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
    color: var(--color-inverse);
  }
  .n-board .trackers {
    max-width: 100%;
    min-height: 30vh;
    padding: 10px 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-evenly;
  }

  .board-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px;
    margin-bottom: 32px;
    padding: 0 10px;
    .btn {
      min-width: 220px;
      margin-left: 10px;
      margin-right: 10px;
      max-width: 200px;
    }

    @include media-breakpoint-down(sm) {
      min-width: 300px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;

      flex-direction: column;
      .btn {
        flex-grow: 1;
        width: 100%;
        display: block;
        margin-bottom: 6px;
      }
    }

    padding-top: 16px;
    > * {
      margin: 0 4px;
    }
  }
</style>

<!-- Start App Layout -->
<AppLayout title={appTitle}>
  <div slot="header">
    {#if $BoardStore.boards.length || $UserStore.meta.boardsEnabled}
      <div class="container p-0 n-row h-100">
        {#if TrackerStore.getAsArray().length > 13}
          <button
            style="margin:2px; border-radius:8px; padding:0 12px;"
            class="btn btn-icon zmdi zmdi-search py-2 {data.searching ? 'active' : 'btn-clear'}"
            on:click={methods.toggleSearch} />
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
              class="btn btn-clear btn-icon zmdi zmdi-sort-amount-desc"
              on:click={() => {
                Interact.toggleBoardSorter();
              }} />
          {/if}
        </NBoardTabs>
      </div>
    {:else}
      <NToolbar>
        <i
          on:click={methods.enableBoards}
          class="zmdi zmdi-tab clickable ml-2 text-xs"
          style="opacity:0" />
        <div class="filler" />
        <LogoType size={20} on:click={methods.enableBoards} />
        <div class="filler" />
        <i
          on:click={methods.enableBoards}
          class="zmdi zmdi-tab clickable ml-2 text-xs text-faded-2" />
      </NToolbar>
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

          {#if data.searching}
            <NToolbar className="mt-3 bg-transparent">
              <div
                class="d-flex d-row justify-content-between align-items-center
                w-100 search-bar">

                <input
                  type="search"
                  autofocus
                  bind:this={searchInput}
                  bind:value={data.searchTerm}
                  on:input={methods.searchKeypress}
                  placeholder="{Lang.t('general.search-trackers', 'Search Trackers')}..."
                  class="search-input" />

              </div>
            </NToolbar>
          {/if}

          <!-- Loop over trackers -->
          <div class="trackers">
            {#if (foundTrackers || boardTrackers || []).length === 0}
              {#if foundTrackers != null}
                <div class="no-trackers">
                  {Lang.t('board.no-search-results', 'No trackers found')}
                </div>
              {/if}
            {/if}

            {#each foundTrackers || boardTrackers as tracker (tracker.tag)}
              <NTrackerButton
                {tracker}
                value={methods.getTrackerValue(tracker)}
                hoursUsed={methods.getHoursUsed(tracker)}
                on:click={() => {
                  methods.trackerTapped(tracker);
                }}
                disabled={data.savingTrackers.indexOf(tracker.tag) > -1}
                className={`${data.addedTrackers.indexOf(tracker.tag) > -1 ? 'added pulse' : ''} ${data.savingTrackers.indexOf(tracker.tag) > -1 ? 'wiggle saving' : ''}`}
                on:longpress={() => {
                  Interact.vibrate();
                  methods.showTrackerOptions(tracker);
                }} />
            {/each}
            {#if !data.searching}
              <button
                class="n-tracker-button n-add-button"
                on:click={methods.addButtonTap}>
                <i class="emoji">+</i>
              </button>
            {/if}
          </div>

          <!-- Include User Tips - shit should be a component -->
          {#if $UserStore.launchCount < 12 && data.hideTips !== true && $BoardStore.active == 'all'}
            <div class="new-user tip n-row mb-3">
              <button
                class="text-md btn btn-clear btn-sm p-0 btn-icon flex-grow-off"
                on:click={() => {
                  data.hideTips = true;
                }}>
                <i class="text-md zmdi zmdi-close-circle" />
              </button>
              <div class="main filler m-1 ml-2">{tips[data.activeTip]}</div>
              <div class="d-flex flex-row arrows">
                <button
                  class="btn btn-clear btn-icon zmdi px-1 zmdi-chevron-left"
                  on:click={methods.previousTip} />
                <button
                  class="btn btn-clear btn-icon zmdi px-1 pl-2
                  zmdi-chevron-right"
                  on:click={methods.nextTip} />
              </div>
            </div>
          {/if}

          <div class="board-actions">

            {#if $BoardStore.activeBoard}
              <button
                on:click={methods.editBoard}
                class="btn btn btn-clear btn-sm icon-left">
                <i class="zmdi zmdi-edit mr-2" />
                {Lang.t('board.edit-board', {
                  board: ($BoardStore.activeBoard || {}).label || null
                })}
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
