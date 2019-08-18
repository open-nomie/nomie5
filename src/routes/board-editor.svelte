<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";
  import { tap } from "@sveltejs/gestures";

  // Utils
  import Logger from "../utils/log/log";
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

  const console = new Logger("🎲 Board Editor");

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

  $: if (data.draggingTag && data.draggingTag !== data.lastDraggingTag) {
    data.lastDraggingTag = data.draggingTag;
    data.draggingTracker =
      $TrackerStore[data.draggingTag] || new Tracker({ tag: data.draggingTag });
  }

  const methods = {
    refresh() {
      data.refreshing = true;
      setInterval(() => {
        data.refreshing = false;
      }, 100);
    },
    initialize() {},
    getTrackers() {
      return $BoardStore.activeBoard.trackers.map(tag => {
        return $TrackerStore[tag] || new Tracker({ tag: tag });
      });
    },
    save() {
      $BoardStore.activeBoard.label = data.updatedLabel;
      BoardStore.saveBoard($BoardStore.activeBoard).then(() => {
        window.history.back();
      });
    },
    deleteBoard() {
      Interact.confirm(
        "Delete board " + $BoardStore.activeBoard.label + " completely?",
        "You can recreate it later, but it's not super easy."
      ).then(res => {
        if (res === true) {
          BoardStore.deleteBoard($BoardStore.activeBoard.id).then(() => {
            window.location.href = "/";
          });
        }
      });
    },
    removeTracker(event, tracker) {
      event.preventDefault();
      event.stopPropagation();
      Interact.confirm(
        "Delete from " + $BoardStore.activeBoard.label + "?",
        "You can always add it later"
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
    moveTag(fromTag, aboveTag) {
      // trackers witout fromTag
      let indexToPlace = 0;
      let trackers = $BoardStore.activeBoard.trackers
        .filter((tag, index) => {
          return tag !== fromTag;
        })
        .map((tag, index) => {
          if (tag === aboveTag) {
            indexToPlace = index;
          }
          return tag;
        });
      trackers.splice(indexToPlace, 0, fromTag);
      $BoardStore.activeBoard.trackers = trackers;

      data.draggingTag = null;
      data.droppedTag = null;
    },
    drag: {
      start(event, index, isTouch) {
        console.log("Started Drag");
        isTouch = isTouch === true ? true : false;
        document.body.classList.add("no-scroll");
        data.draggingTag = event.target.dataset.id;
        showDeletes = false;
        // data.draggingTag = $BoardStore.activeBoard.trackers[item];
      },
      touchmove(evt) {
        // let ball = document.getElementById("ball");

        // THIS IS HACKY HAS IT GETS

        // Let's move the target with us
        data.draggingTag = evt.target.id;
        document.body.classList.add("no-scroll");
        // let trackerDom = document.getElementById

        // Define touching points
        let y = evt.changedTouches[0].clientY;
        let x = evt.changedTouches[0].clientX;

        // Move tracker
        evt.target.style.position = "absolute";
        evt.target.style.top = y - 75 + "px";
        evt.target.style.left = x - 75 + "px";
        evt.target.style.zIndex = 3000;

        let parent = document.getElementById("edit-grid");
        let hoverY = y - 75;
        let hoverElement = document.elementFromPoint(x, hoverY);

        // Testing ball
        ball.style.left = x + "px";
        ball.style.top = y + "px";
        ball.style.display = "block";

        if (hoverElement !== evt.target) {
          data.hoverTag = hoverElement.id;
        }
      },
      touchend(evt) {
        ball.style.display = "none";
        evt.target.style.position = "relative";
        evt.target.style.top = "inherit";
        evt.target.style.left = "inherit";
        evt.target.style.zIndex = "inherit";
        if (data.draggingTag && data.hoverTag) {
          methods.moveTag(data.draggingTag, data.hoverTag + "");
          data.hoverTag = null;
        } else {
          data.hoverTag = null;
        }
        setTimeout(() => {
          document.body.classList.remove("no-scroll");
          showDeletes = true;
          data.draggingTag = null;
          data.draggingTracker = null;
          data.lastDraggingTag = null;
        }, 120);
      },
      over(ev) {
        if (ev.target.id) {
          data.hoverTag = ev.target.id;
        }
        ev.preventDefault();
      },
      leave(ev) {
        ev.preventDefault();
      },
      drop(ev) {
        data.droppedTag = ev.target.id || data.hoverTag;

        setTimeout(() => {
          document.body.classList.remove("no-scroll");
          showDeletes = true;
        }, 120);

        if (data.draggingTag && data.droppedTag) {
          data.hoverTag = null;
          methods.moveTag(data.draggingTag, data.droppedTag);
        }
      }
    }
  };

  // TODO: Make sorting work
  // export function dragstart(ev, group, item) {
  //   document.body.classList.add("no-scroll");
  //   data.draggingTag = $BoardStore.activeBoard.trackers[item];
  //   console.log("dragging", { ev, item, tag: data.draggingTag });
  // }
  // export function dragover(ev) {
  //   console.log("over", ev);
  //   ev.target.classList.add("hovered");
  //   ev.preventDefault();
  // }
  // export function dragleave(ev) {
  //   ev.target.classList.remove("hovered");
  //   ev.preventDefault();
  // }
  // export function drop(ev, new_g, i) {
  //   data.droppedTag = ev.target.id;
  //   ev.target.classList.remove("hovered");
  //   setTimeout(() => {
  //     document.body.classList.remove("no-scroll");
  //   }, 120);
  //   console.log("drop", {
  //     ev,
  //     target: ev.target,
  //     dragging: data.draggingTag,
  //     dropped: data.droppedTag
  //   });

  //   if (data.draggingTag && data.droppedTag) {
  //     methods.moveTag(data.draggingTag, data.droppedTag);
  //   }
  //   // ev.target.style.backgroundColor = "black";
  // }

  UserStore.onReady(() => {
    methods.initialize();
  });
</script>

<style lang="scss">
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
      background-color: var(--color-solid);
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
      <div class="filler" />
      <h1>Edit Board</h1>
      <div class="filler" />
    </div>

    <div slot="sub-header">
      <NItem className="w-100">
        <div class="input-group mb-2">
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
    <div class="container">
      <div class="n-row">
        <div class="filler" />
        <button
          class="btn btn mt-4 btn-danger flex-grow"
          on:click={methods.deleteBoard}>
          Destroy
        </button>
        <button
          class="btn btn mt-4 btn-light mx-3 flex-grow"
          on:click={() => {
            window.history.back();
          }}>
          Cancel
        </button>
        <button
          class="btn btn mt-4 btn-success flex-grow"
          on:click={methods.save}>
          Save
        </button>
        <div class="filler" />
      </div>
    </div>
    <!-- /.container -->

    <div class="container pt-3 px-0 grid-container">

      <div
        class="grid"
        id="edit-grid"
        on:drop={methods.drag.drop}
        on:touchend={methods.drag.touchend}
        on:dragover={methods.drag.over}
        on:dragleave={methods.drag.leave}>
        {#each methods.getTrackers() as tracker, i (tracker.tag)}
          <div
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
            <!-- <NItem title={tracker.label} borderBottom id={tracker.tag}>
              <span class="text-lg emoji" slot="left">{tracker.emoji}</span>
            </NItem> -->
          </div>
        {/each}
        <div id="ball" />
      </div>
      <div class="filler" />
      {#if isMobile}
        <div class="container">
          <div class="n-row pt-3 justify-content-center">
            <NText class="xs" className="text-center">
              <!-- TODO: Fix Sorting on MObile -->
              Sorting on mobile is currently jacked.
            </NText>
          </div>
        </div>
      {/if}

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
