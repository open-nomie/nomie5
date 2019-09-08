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

  // Components
  import NTrackerButton from "./tracker-button.svelte";
  import NTrackerEditor from "../tracker/editor/editor.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NBoardTabs from "../../components/board-tabs/board-tabs.svelte";
  import TrackerInput from "../tracker/input/input.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NHScroll from "../../components/h-scroller/h-scroller.svelte";

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

  // Consts
  const console = new Logger("board.svelte");

  // Local Vars
  let ledger = undefined;
  let user = undefined;
  let refreshing = false;
  let today = {};
  let trackers = null;
  let board = null;

  // Data Storage
  let data = {
    board: { label: "All", trackers: [] }, // Holds current board
    showEditor: false, // Should show editor?
    selectedTracker: null,
    trackers: $UserStore.trackers,
    boards: null,
    showStartPacks: false,
    checks: 0,
    loading: true,
    savingTrackers: []
    // gotToBeLoaded: false,
  };

  // Wait for the User to be ready
  UserStore.onReady(() => {
    user = $UserStore;
    // Hook a before save - to highlight saving trackers
    LedgerStore.hook("onBeforeSave", log => {
      data.savingTrackers = log.trackersArray().map(t => t.tag);
    });
    // Hook on Save to clear saving Trackers
    LedgerStore.hook("onLogSaved", log => {
      data.savingTrackers = [];
    });
  });

  // Set Local Variables
  let activeTrackers = [];
  let currentActive = undefined;

  $: activeTrackers = BoardStore.getActiveTrackerTags();
  $: activeBoard = $BoardStore.activeBoard;

  // If Today length - then lets set it ... but it should be a watch
  $: if (Object.keys($LedgerStore.today).length) {
    today = $LedgerStore.today;
    methods.refresh();
  }

  $: if ($TrackerStore && $BoardStore.active) {
    activeTrackers = BoardStore.getActiveTrackerTags().map(tag => {
      return $TrackerStore[tag] || new Tracker({ tag: tag });
    });
    trackers = $TrackerStore;
    data.loading = false;
    LedgerStore.getToday().then(() => {
      today = $LedgerStore.today;
    });
    methods.refresh();
  }

  const methods = {
    editBoard() {
      navigate(`/board/${activeBoard.id}`);
    },
    isSwipeEnough(e) {
      // TODO: See if https://www.npmjs.com/package/@composi/gestures can detect how much they swiped
      // Otherwise it's too sensitive
      return false;
    },
    swipeLeft(e) {
      // if (methods.isSwipeEnough(e)) {
      //   BoardStore.nextBoard();
      // }
    },
    swipeRight(e) {
      // if (methods.isSwipeEnough(e)) {
      //   BoardStore.previousBoard();
      // }
    },
    addTapped() {
      if ($BoardStore.active == "all") {
        methods.trackerEditor();
      } else {
        Interact.popmenu({
          buttons: [
            {
              title: "Create a New Tracker",
              click() {
                methods.trackerEditor();
              }
            },
            {
              title: "Add Existing Trackers Here",
              click() {
                Interact.selectTrackers().then(tkrs => {
                  BoardStore.addTrackersToActiveBoard(tkrs);
                });
              }
            }
          ]
        });
      }
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
        methods.refresh();
      });
    },

    /**
     * Review View
     * TODO: Look at why this is needed... slop!
     */
    refresh() {
      // NO LONGER NEEDED!
      // Hacky way to get some reactive things to work.
      // Currently when starting timers it's not reacting.
      // this should force it - but will cause a hitch.
      // and should be fixed at some point.
      // refreshing = true;
      // let sTop = document.documentElement.scrollTop;
      // setTimeout(() => {
      //   refreshing = false;
      //   setTimeout(() => {
      //     document.documentElement.scrollTop = sTop;
      //   });
      // });
    },

    /**
     * Create a new board
     */
    newBoard() {
      Interact.prompt("Board Label?", { placeholder: "Name or Emoji 👍" }).then(
        res => {
          if (res) {
            let label = res.trim();
            BoardStore.addBoard(label).then(board => {
              Interact.alert(
                "Created",
                "Board was created. Go and add some trackers."
              ).then(() => {
                BoardStore.setActive(board.id);
              });
            });
          }
        }
      );
    },

    /**
     * Tacker Tapped
     */
    trackerTapped(tracker) {
      data.selectedTracker = tracker;
      // If it's a plain old tick tracker
      if (tracker.type === "tick") {
        ActiveLogStore.addTag(tracker.tag);
        if (tracker.one_tap === true) {
          let note = $ActiveLogStore.note + "";
          // Account for Positivity calculation
          $ActiveLogStore.score = ActiveLogStore.calculateScore(
            note,
            $TrackerStore
          );
          LedgerStore.saveLog($ActiveLogStore).then(() => {
            Interact.toast(`Saved ${note}`);
            ActiveLogStore.clear();
            data.savingTrackers = [];
          });
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
        // Step over each one...
        promiseStep(items, item => {
          return new Promise((resolve, reject) => {
            // testing if going direct works
            $Interact.trackerInput.show = false;
            $Interact.trackerInput.tracker = null;
            $Interact.trackerInput.onInteract = null;
            setTimeout(() => {
              Interact.trackerInput(item.tracker, item.value)
                .then(resolve)
                .catch(reject);
            }, 300);
          });
        });
      } else {
        // It's an input of some sort
        Interact.trackerInput(tracker);
      } // end if tick or others
    },

    /**
     * Tag to Tracker
     */
    tagToTracker(tag) {
      if (tag instanceof Tracker) {
        return tag;
      } else {
        return $TrackerStore[tag]
          ? $TrackerStore[tag]
          : new Tracker({ tag: tag || "unknown" });
      }
    },

    /**
     * Get Tracker Value
     * Used to get the current value of today for a given tracker
     * This will total or avg their values depending on the tracker calcuate
     */
    getTrackerValue(tracker) {
      let value = null;
      if ($LedgerStore.today.hasOwnProperty(tracker.tag)) {
        if (tracker.math === "sum") {
          value = math.round(math.sum($LedgerStore.today[tracker.tag].values));
        } else {
          value = math.round(
            math.average($LedgerStore.today[tracker.tag].values)
          );
        }
      }
      return value ? NomieUOM.format(value, tracker.uom) : null;
    },

    /**
     * Sho Tracker Options
     */
    showTrackerOptions(tracker) {
      // Make it a real tracker in case it's not - doubling up shouldn't be a problem.
      tracker = new Tracker(tracker);
      // Define buttons
      let buttons = [
        {
          title: "Stats",
          click() {
            navigate(`/stats/${tracker.tag}`, { tracker: tracker });
          }
        },
        {
          title: "Edit Tracker",
          click() {
            Interact.editTracker(tracker);
          }
        }
      ];

      const removeButton = {
        title: `Remove...`,
        click() {
          if ($BoardStore.active === "all") {
            Interact.confirm(
              `Delete ${tracker.label} from Nomie`,
              "You can always recreate it later. No historic data will be deleted deleted."
            ).then(res => {
              if (res) {
                TrackerStore.deleteTracker(tracker).then(done => {});
              }
            });
          } else {
            Interact.confirm(
              `Remove ${tracker.label} from this board?`,
              "You can always re-add it later"
            ).then(res => {
              if (res) {
                BoardStore.removeTrackerFromBoard(tracker, $BoardStore.active);
              }
            });
          }
        }
      };

      buttons.push(removeButton);
      // Fire Popmenu
      Interact.popmenu({
        title: `${tracker.emoji || "⚪️"} ${tracker.label || tracker.tag}`,
        buttons: buttons
      });
    }
  };
</script>

<style type="text/scss" name="scss">
  @import "../../scss/utils/_utils";
  @import "../../scss/vendor/bootstrap/base";
  .n-board {
    display: flex;
    flex-direction: column;
    padding: 0px 0px;
    background-color: var(--color-bg);
    flex-grow: 1;
    top: 0;
    bottom: 50px;
    left: 0;
    right: 0;
    padding-bottom: 100px;
    overflow-y: scroll;
    width: 100%;
  }
  .n-board .trackers {
    max-width: 100%;
    padding: 10px 0;
    // display: grid;
    // grid-gap: 10px;
    // grid-template-columns: auto auto auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-evenly;
    :global(.n-tracker-button) {
      margin: 4px;
    }
  }
  .sub-header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: stretch;
    align-items: stretch;
    height: 50px;
    z-index: 350;
    background-color: var(--color-solid);
    border-bottom: var(--color-solid-2);
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.04);
  }

  .board-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px;
    .btn {
      min-width: 220px;
      margin-left: 10px;
      margin-right: 10px;
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
    .btn-outline-dark {
      color: var(--color-inverse-3);
      border: solid 1px var(--color-inverse-3);
      max-width: 300px;
      min-width: 100px;
      flex-grow: 1;
      &:hover {
        background-color: var(--color-inverse-3);
        border: solid 1px var(--color-inverse-3);
        color: var(--color-bg);
      }
      &:active,
      &:focus {
        border: solid 1px rgba(0, 0, 0, 0.4);
        background-color: rgba(0, 0, 0, 0.4);
        color: rgba(0, 0, 0, 0.9);
      }
    }
  }
</style>

{#if user}
  {#if $BoardStore.boards}
    <div class="sub-header">
      <div class="container p-0 h-100">
        <NBoardTabs
          boards={methods.injectAllBoard($BoardStore.boards || [])}
          active={$BoardStore.active}
          on:create={methods.newBoard}
          on:tabTap={event => {
            BoardStore.setActive(event.detail.id);
          }} />
      </div>
    </div>
  {/if}
  {#if data.loading}
    <div class="empty-notice">
      <Spinner size="50" speed="750" color="#666" thickness="2" gap="40" />
    </div>
  {:else}
    <div class="container p-0">
      <main class="n-board">

        <div class="trackers">

          {#each activeTrackers as tracker (tracker.tag)}
            <NTrackerButton
              {tracker}
              value={methods.getTrackerValue(tracker)}
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
          <button class="btn btn btn-light" on:click={methods.addTapped}>
            Add Tracker
          </button>

          {#if activeBoard}
            <button on:click={methods.editBoard} class="btn btn btn-light">
              Edit {(activeBoard || {}).label || null} Board
            </button>
          {/if}
        </div>

      </main>
    </div>
  {/if}
{/if}

{#if data.showStartPacks}
  <NModal title="Starter Packs">
    <div slot="header">
      <NBoardTabs boards={StarterPacks.methods.asArray()} />
      <!-- TODO: Finish this starter pack add trackers, make them installable. -->
    </div>
  </NModal>
{/if}
