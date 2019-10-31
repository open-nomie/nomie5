<script>
  /**
   * Brace yourself - this is a massive file
   *
   * It's usually the case with the main board of all versions of nomie
   * eventually it might be cleaned up - but for now, its about getting things to work.
   */
  // svelte
  import { navigate, Link } from "svelte-routing";
  import { onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import md5 from "md5";

  // Components
  import NTrackerButton from "./tracker-button.svelte";
  import NTrackerEditor from "../tracker/editor/editor.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NBoardTabs from "../../components/board-tabs/board-tabs.svelte";
  import TrackerInput from "../tracker/input/input.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NHScroll from "../../components/h-scroller/h-scroller.svelte";
  import Elephant from "../../components/elephant.svelte";
  import CaptureLog from "../../components/capture-log.svelte";

  import AppLayout from "../../containers/layout/app.svelte";

  // Vendors
  import Spinner from "svelte-spinner";

  // Modules/Libs
  import Tracker from "../../modules/tracker/tracker";
  import NomieLog from "../../modules/nomie-log/nomie-log";
  import StarterPacks from "../../modules/packs/starter-packs";

  // Utils
  import math from "../../utils/math/math";
  import Logger from "../../utils/log/log";
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import extractor from "../../utils/extract-trackers/extract-trackers";
  import promiseStep from "../../utils/promise-step/promise-step";

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
  let lastLedgerStoreHash = null; // for making so svelte doesnt get loop happy
  let lastMasterHash = null; // for making sure svelte doesn't loop
  let _trackers = null; // holder of trackers when store updates
  let _board = null; // holder of current board data
  let boardTrackers = []; // Actual array to display to user
  let appTitle = "(Loading)";

  // Data Storage
  let data = {
    selectedTracker: null, // populated when user tabs tracker
    showStartPacks: false, // shows the start library
    loading: true, // show spinner
    savingTrackers: [], // to highlight trackers that are being saved
    searching: false, // if the user is searching
    searchTerm: null // the search term the user is typing
  };

  // Wait for the User to be ready
  UserStore.onReady(() => {
    user = $UserStore; // Kick off
    // Hook a before save - to highlight saving trackers
    LedgerStore.hook("onBeforeSave", log => {
      data.savingTrackers = log.trackersArray().map(t => t.tag);
    });
    // Hook on Save to clear saving Trackers
    LedgerStore.hook("onLogSaved", log => {
      data.savingTrackers = [];
    });
    LedgerStore.getToday();
  });

  /**
   * If the Ledger Changes
   *
   * A new event has been registered
   * we need to stop loading, and populate today
   * and reload the trackers (for reacting to value changes)
   */
  $: if ($LedgerStore.hash !== lastLedgerStoreHash) {
    lastLedgerStoreHash = $LedgerStore.hash;
    setTimeout(() => {
      today = $LedgerStore.today;
      data.loading = false;
      boardTrackers = boardTrackers || [];
    }, 12);
  }

  /**
   * Boards, Trackers and Ledger
   *
   * If we have all three - we're ready to go.
   * But we need to hash things so we don't get into a
   * a reactive loop. Create a hash of the active board, plus
   * tracker data - this way it reacts if someone edits a tracker too
   */
  $: if ($BoardStore && $TrackerStore && $LedgerStore) {
    // Create a hash for this compbo
    let boardHash = ($BoardStore.activeBoard || {}).trackers || [].join(",");
    let mh = [$BoardStore.active, boardHash, JSON.stringify(_trackers)];
    let masterHash = md5(mh.join(","));

    appTitle = `${
      $BoardStore.active !== "all" ? $BoardStore.activeBoard.label : "All"
    }`;
    // Compare hashes
    if (lastMasterHash != masterHash) {
      // Update hash to new one.
      lastMasterHash = masterHash;
      // Are we on the All board?
      if ($BoardStore.active == "all") {
        // Get all trackers from TrackerStore, convert to array
        boardTrackers = Object.keys($TrackerStore)
          .map(tag => {
            return $TrackerStore[tag] || new Tracker({ tag: tag });
          })
          .sort((a, b) => {
            return a.label > b.label ? 1 : -1;
          });
      } else {
        // Get Board Trackers from active Board
        boardTrackers = $BoardStore.activeBoard.trackers.map(tag => {
          return $TrackerStore[tag] || new Tracker({ tag: tag });
        });
      }
    } // end making sure we don't get into a loop
  }

  /**
   * METHODS
   */
  const methods = {
    editBoard() {
      navigate(`/board/${$BoardStore.activeBoard.id}`);
    },
    // When Tracker Subscribe
    onTrackersChange(trackers) {
      _trackers = trackers;
    },
    // When Board Subscribe
    onBoardChange(boardPayload) {
      _board = boardPayload;
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

      // If it's a plain old tick tracker
      if (tracker.type === "tick") {
        // Just add the tag to the note
        ActiveLogStore.addTag(tracker.tag);

        // If it's one_tap - then save it
        if (tracker.one_tap === true) {
          // Make the note
          let note = $ActiveLogStore.note + "";

          // Account for Positivity calculation
          // This is for display only, the scores are always
          // dynamically calculated
          $ActiveLogStore.score = ActiveLogStore.calculateScore(
            note,
            $TrackerStore
          );
          try {
            // Save the log
            await LedgerStore.saveLog($ActiveLogStore);

            // Let user Know it was saved
            Interact.toast(`Saved ${note}`);

            // Clear Log
            ActiveLogStore.clear();
          } catch (e) {
            // Catch any problems
            Interact.alert("Error", e.message);
          }
          // Refresh View
          setTimeout(() => {
            data.savingTrackers = [];
            data = data;
          }, 100);
        }
        // If it's a note (combined trackers)
      } else if (tracker.type === "note") {
        // Extract Trackers
        let trackerTags = extractor(tracker.note);

        // Add Tag to the note first...
        ActiveLogStore.addTag(tracker.tag);

        // Create array of items to pass to promise step
        let items = Object.keys(trackerTags).map(tag => {
          return {
            tracker: $TrackerStore[tag] || new Tracker({ tag: tag }),
            value: trackerTags[tag].value // not being used
          };
        });

        /**
         * Promise Step
         * Loop over each of the items { tracker: [object], value: value }
         * If this is a multiple tracker request we will show each of the
         * tracker inputs one at a time using the promise step function
         */
        promiseStep(items, item => {
          return new Promise((resolve, reject) => {
            // testing if going direct works
            $Interact.trackerInput.show = false;
            $Interact.trackerInput.tracker = null;
            $Interact.trackerInput.onInteract = null;

            // Wait for timeout
            setTimeout(() => {
              // Show Tracker Input for this given tracker
              // then return the promise and move on to the next
              Interact.trackerInput(item.tracker, item.value)
                .then(resolve)
                .catch(reject);
            }, 12);
          });
        });
      } else {
        // It's an input of some sort
        Interact.trackerInput(tracker);
      } // end if tick or others
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
      if ($LedgerStore.today.hasOwnProperty(tracker.tag)) {
        // What type of Math should we do?
        if (tracker.math === "sum") {
          // Sum it up!
          value = math.round(math.sum($LedgerStore.today[tracker.tag].values));
        } else {
          // Round things!
          value = math.round(
            math.average($LedgerStore.today[tracker.tag].values)
          );
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
      if ($LedgerStore.today.hasOwnProperty(tracker.tag)) {
        return $LedgerStore.today[tracker.tag].hours;
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

  // Wait for changes to happen to the boardstore
  BoardStore.subscribe(boardPayload => {
    methods.onBoardChange(boardPayload);
  });

  // Wait for changes to happen to the tracker store
  TrackerStore.subscribe(trackers => {
    methods.onTrackersChange(trackers);
  });
</script>

<style type="text/scss" name="scss">
  @import "../../scss/utils/_utils";
  @import "../../scss/vendor/bootstrap/base";

  .n-board {
    padding: 0px 0px;
    background-color: var(--color-bg);
    width: 100%;
  }

  .no-trackers {
    min-height: 300px;
    height: 50vh;
    display: flex;
    color: var(--color-solid-2);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .zmdi-search.active {
    transform: scale(1.3);
    color: var(--color-red);
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
    padding: 0 10px;
    .btn {
      min-width: 220px;
      margin-left: 10px;
      margin-right: 10px;
      max-width: 200px;
    }
    @include media-breakpoint-down(xs) {
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
          }} />
      </div>
    {:else}
      <NToolbar>
        <div class="filler" />
        <!-- Make the logo clickable - but prompt to enable tabs when they do-->
        <img
          src="/images/nomie-words.svg"
          aria-label="Nomie Logo"
          height="20"
          on:click={methods.enableBoards} />
        <div class="filler" />
      </NToolbar>
    {/if}
  </div>
  <!-- end header-->
  <div slot="content" class="container board-container">
    {#if user}
      {#if data.loading}
        <div class="empty-notice">
          <Spinner size="50" speed="750" color="#666" thickness="2" gap="40" />
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
              <div class="no-trackers">
                {#if foundTrackers != null}
                  {Lang.t('board.no-search-results', 'No trackers found')}
                {:else}{Lang.t('board.board-empty')}{/if}
              </div>
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
                className={`${data.savingTrackers.indexOf(tracker.tag) > -1 ? 'wiggle saving' : ''}`}
                on:longpress={() => {
                  Interact.vibrate();
                  methods.showTrackerOptions(tracker);
                }} />
            {/each}
          </div>

          <div class="board-actions">
            <button class="btn btn btn-text" on:click={methods.addButtonTap}>
              <i class="zmdi zmdi-plus" />
              {Lang.t('tracker.add-tracker')}
            </button>

            {#if $BoardStore.activeBoard}
              <button
                on:click={methods.editBoard}
                class="btn btn btn-text btn-sm">
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

{#if data.showStartPacks}
  <NModal title="Starter Packs">
    <div slot="header">
      <NBoardTabs boards={StarterPacks.methods.asArray()} />
    </div>
  </NModal>
{/if}
