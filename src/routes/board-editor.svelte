<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";
  import { tap } from "@sveltejs/gestures";
  import { onMount, onDestroy } from "svelte";

  // Utils
  import Logger from "../utils/log/log";
  import arrayUtils from "../utils/array/array_utils";
  // Modules
  import Tracker from "../modules/tracker/tracker";
  // Components
  import NText from "../components/text/text.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NTrackerButton from "../containers/board/tracker-button.svelte";

  // containers
  import NPage from "../containers/layout/page.svelte";

  //store
  import { BoardStore } from "../store/boards";
  import { UserStore } from "../store/user";
  import { TrackerStore } from "../store/trackers";
  import { Interact } from "../store/interact";
  import { Lang } from "../store/lang";

  const console = new Logger("🎲 Board Editor");
  let trackers = [];

  let data = {
    board: null,
    updatedLabel: null,
    trackers: null,
    draggingTag: null,
    droppedTag: null,
    hoverTag: null,
    refreshing: false,
    notice: "Notice",
    lastDraggingTag: null,
    draggingTracker: null
  };

  let ready = false;
  let path = window.location.href.split("/");
  let id = path[path.length - 1];
  let showDeletes = true;
  let isMobile =
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1;

  // $: if ((data.board || {}).hasOwnProperty("trackers")) {
  //   data.trackers = data.board.trackers.map(tag => {
  //     return $TrackerStore[tag] || new Tracker({ tag: tag });
  //   });
  // }

  $: if ($BoardStore.activeBoard && ready == false) {
    ready = true;
    data.updatedLabel = $BoardStore.activeBoard.label;
  }

  // $: if (data.draggingTag && data.draggingTag !== data.lastDraggingTag) {
  //   data.lastDraggingTag = data.draggingTag;
  //   data.draggingTracker =
  //     $TrackerStore[data.draggingTag] || new Tracker({ tag: data.draggingTag });
  // }

  const methods = {
    refresh() {
      data.refreshing = true;
      setInterval(() => {
        data.refreshing = false;
      }, 100);
    },
    initialize() {},
    getTrackers() {},
    save() {
      $BoardStore.activeBoard.label = data.updatedLabel;
      BoardStore.saveBoard($BoardStore.activeBoard).then(() => {
        window.history.back();
      });
    },
    deleteBoard() {
      Interact.confirm(
        "Delete " + $BoardStore.activeBoard.label + " tab?",
        "You can recreate it later, but it's not super easy."
      ).then(res => {
        if (res === true) {
          data.refreshing = true;
          BoardStore.deleteBoard($BoardStore.activeBoard.id).then(() => {
            navigate("/");
          });
        }
      });
    },
    removeTracker(event, tracker) {
      event.preventDefault();
      event.stopPropagation();
      Interact.confirm(
        `Remove ${tracker.label} from ${$BoardStore.activeBoard.label}?`,
        "You can always add it later."
      ).then(res => {
        if (res === true) {
          event.preventDefault();
          BoardStore.removeTrackerFromBoard(
            tracker,
            $BoardStore.activeBoard.id
          ).then(() => {
            data.refreshing = true;
            setTimeout(() => {
              data.refreshing = false;
            }, 100);
          });
        } // accepted
      });
    },
    trackerIndex(tracker) {
      return trackers.indexOf(tracker);
    },
    moveUp(tracker) {
      let index = methods.trackerIndex(tracker);
      console.log("Move Up", index);
      if (index > 0) {
        setTimeout(() => {
          BoardStore.update(b => {
            b.activeBoard.trackers = arrayUtils
              .move(trackers, index, index - 1)
              .map(r => r.tag);
            return b;
          });
        }, 120);
        // BoardStore.update(b => {
        //   b.activeBoard.trackers = arr;
        //   return b;
        // });
      }
    },
    moveDown(tracker) {
      let index = methods.trackerIndex(tracker);
      if (index < trackers.length - 1) {
        setTimeout(() => {
          BoardStore.update(b => {
            b.activeBoard.trackers = arrayUtils
              .move(trackers, index, index + 1)
              .map(r => r.tag);
            return b;
          });
        }, 120);
      }
    }
  };

  let boardUnsub;

  onMount(() => {
    boardUnsub = BoardStore.subscribe(b => {
      if (b.activeBoard) {
        trackers = b.activeBoard.trackers.map(tag => {
          return $TrackerStore[tag] || new Tracker({ tag: tag });
        });
      } else {
        navigate("/");
      }
    });
  });

  onDestroy(() => {
    boardUnsub();
  });

  UserStore.onReady(() => {
    methods.initialize();
  });
</script>

<style lang="scss">
  .input-group {
    .input-group-text {
      color: var(--color-inverse-2);
      background-color: var(--color-faded-1);
    }
    input {
      padding-left: 16px;
    }
  }
  div.tracker-grabber {
    position: relative;
    padding: 8px;
    margin: 0px;
    .btn-delete {
      $size: 30px;
      width: $size;
      max-width: $size;
      height: $size;
      padding: 0;
      border-radius: $size * 0.5;
      background-color: #fff;
      box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
      font-size: $size * 0.6;
      line-height: $size;
      border: none;
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 100;
    }
    // transition: all 0.4s ease-in-out;
    &.hovered {
      // transition: all 0.8s ease-in-out;
      padding-left: 120px;
      position: relative;
      &:after {
        content: "Here";
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-faded-2);
        background-color: var(--color-faded);
        border: dotted 3px var(--color-faded-3);
        border-radius: 12px;
        top: 12px;
        left: 12px;
        right: 55%;
        bottom: 6px;
        position: absolute;
      }
    }
  }

  :global(div.tracker-grabber .n-tracker-button) {
    pointer-events: none;
    &:after {
      position: absolute;
      z-index: 1200;
      content: "";
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  } // end global

  .grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
  }
  .grid-container {
    display: flex;
    flex-direction: column;
    align-items: space-around;
    min-height: 50vh;
  }

  #ball {
    background-color: red;
    height: 20px;
    width: 20px;
    position: fixed;
    z-index: 3000;
    border-radius: 10px;
    display: none;
  }

  .btn-group {
    .btn {
      width: 36px;
    }
  }
  .notice {
    position: fixed;
    bottom: 70px;
    left: 10px;
    right: 10px;
    padding: 5px;
    border: solid 1px blue;
    color: blue;
  }

  // Animation from https://www.kirupa.com/html5/creating_the_ios_icon_jiggle_wobble_effect_in_css.htm
</style>

{#if $BoardStore.activeBoard}
  <NPage className="stats" withBack={true}>

    <div slot="header" class="n-row">
      <h1 class="text-center flex-grow text-inverse">Edit Tab</h1>
      <button class="btn btn btn-clear text-danger " on:click={methods.save}>
        {Lang.t('general.save')}
      </button>
    </div>

    <div slot="sub-header" class="py-1">
      <NItem className="w-100 p-0 ">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">Label</span>
          </div>
          <input
            type="text"
            class="form-control"
            placeholder="Board Label"
            aria-label="Board Label"
            bind:value={data.updatedLabel}
            aria-describedby="basic-addon1" />
        </div>
      </NItem>
    </div>
    <!-- /.container -->

    <div class="container pt-3 px-0 grid-container">

      <div class="n-list">
        {#each trackers as tracker, i (tracker.tag)}
          <NItem>
            <div slot="right" class="n-row">
              <button
                class="btn btn-icon zmdi zmdi-close text-red"
                on:click={evt => {
                  methods.removeTracker(evt, tracker);
                }} />
            </div>
            <div class="n-row filler">
              <div class="emoji text-lg mr-2">{tracker.emoji}</div>
              {tracker.label}
              <div class="filler" />
            </div>
            <div class="btn-group flex-shrink-off" slot="left">
              <button
                class="btn px-2 btn-lg btn-light {i === 0 ? 'disabled' : ''}"
                on:click={() => {
                  methods.moveUp(tracker);
                }}>
                <i class="zmdi zmdi-long-arrow-up" />
              </button>
              <button
                class="btn px-2 btn-lg btn-light {i === trackers.length - 1 ? 'disabled' : ''}"
                on:click={() => {
                  methods.moveDown(tracker);
                }}>
                <i class="zmdi zmdi-long-arrow-down" />
              </button>
            </div>
          </NItem>
        {/each}
      </div>

      <!-- <div
        class="grid"
        id="edit-grid"
        on:drop={methods.drag.drop}
        on:touchend={methods.drag.touchend}
        on:dragover={methods.drag.over}
        on:dragleave={methods.drag.leave}>
        {#each methods.getTrackers() as tracker, i (tracker.tag)}
          <NItem>
            <div class="emoji" slot="left" />
            <h1 class="title">{tracker.label}</h1>
          </NItem> -->

      <!-- <div
            class="tracker-grabber {data.hoverTag == tracker.tag ? 'hovered' : ''}"
            data-id={tracker.tag}
            id={tracker.tag}
            draggable={true}
            on:touchmove={event => methods.drag.touchmove(event, i)}
            on:touchend={methods.drag.touchend}
            xon:touchstart={event => methods.drag.start(event, i, 'touch')}
            on:dragstart={event => methods.drag.start(event, i)}>
            {#if showDeletes}
              <button
                class="btn-delete zmdi zmdi-close"
                on:click={event => {
                  methods.removeTracker(event, tracker);
                }} />
            {/if}
            <NTrackerButton
              {tracker}
              className={i % 2 ? 'wiggle' : 'wiggle-other'} />
          </div> -->
      <!-- {/each}
        <div id="ball" />
      </div>
      <div class="filler" /> -->

    </div>
    <div class="n-row p-2">
      <div class="filler" />
      <button
        class="btn btn btn-clear text-danger "
        on:click={methods.deleteBoard}>
        Delete this Tab
      </button>
      <div class="filler" />
    </div>
  </NPage>
{:else}
  <NPage>
    <div slot="header" class="n-row">
      <div class="filler" />
      <h1>Loading...</h1>
      <div class="filler" />
    </div>
  </NPage>
{/if}

<!-- <div class="notice">{data.notice}</div> -->
