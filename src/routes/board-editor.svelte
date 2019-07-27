<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";

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
    refreshing: false
  };

  let ready = false;
  let path = window.location.href.split("/");
  let id = path[path.length - 1];

  // $: if ((data.board || {}).hasOwnProperty("trackers")) {
  //   data.trackers = data.board.trackers.map(tag => {
  //     return $TrackerStore[tag] || new Tracker({ tag: tag });
  //   });
  // }

  $: if ($BoardStore.activeBoard && ready == false) {
    console.log("Board Store loaded", $BoardStore);
    ready = true;
    data.updatedLabel = $BoardStore.activeBoard.label;
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
      BoardStore.saveBoard($BoardStore.activeBoard).then(() => {
        window.history.back();
      });
    },
    deleteBoard() {
      Interact.confirm(
        "Delete fro" + $BoardStore.activeBoard.label + " completely?",
        "You can recreate it later, but it's not super easy."
      ).then(res => {
        if (res === true) {
          BoardStore.deleteBoard($BoardStore.activeBoard.id);
        }
      });
    },
    removeTracker(event, tracker) {
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
            console.log("Deleted");
          });
        } // accepted
      });
    },
    moveTag(fromTag, aboveTag) {
      console.log(`going to move ${fromTag} to above ${aboveTag}`);
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
      console.log({ trackers });
      $BoardStore.activeBoard.trackers = trackers;

      // data.board.trackers = trackers;
      // console.log("Moved", data.board.trackers);
      data.draggingTag = null;
      data.droppedTag = null;
    }
  };

  // TODO: Make sorting work
  export function dragstart(ev, group, item) {
    data.draggingTag = $BoardStore.activeBoard.trackers[item];
    console.log("dragging", { ev, item, tag: data.draggingTag });
  }
  export function dragover(ev) {
    ev.target.classList.add("hovered");
    ev.preventDefault();
  }
  export function dragleave(ev) {
    ev.target.classList.remove("hovered");
    ev.preventDefault();
  }
  export function drop(ev, new_g, i) {
    data.droppedTag = ev.target.id;
    ev.target.classList.remove("hovered");
    console.log("drop", {
      ev,
      target: ev.target,
      dragging: data.draggingTag,
      dropped: data.droppedTag
    });

    if (data.draggingTag && data.droppedTag) {
      methods.moveTag(data.draggingTag, data.droppedTag);
    }
    // ev.target.style.backgroundColor = "black";
  }

  UserStore.onReady(() => {
    methods.initialize();
  });
</script>

<style lang="scss">
  div.tracker-grabber {
    position: relative;
    .btn-delete {
      $size: 30px;
      width: $size;
      height: $size;
      border-radius: $size * 0.5;
      background-color: var(--color-solid);
      box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
      font-size: $size * 0.6;
      line-height: $size;
      border: none;
      position: absolute;
      top: -6px;
      right: -6px;
      z-index: 100;
    }
  }

  :global(div.tracker-grabber .n-tracker-button) {
    &:after {
      position: absolute;
      content: "";
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    margin-bottom: 12px;

    &:nth-child(2n) {
      animation-name: keyframes1;
      animation-iteration-count: infinite;
      transform-origin: 50% 10%;
    }

    &:nth-child(2n-1) {
      animation-name: keyframes2;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      transform-origin: 30% 5%;
    }
  } // end global

  :global(div[draggable] .hovered) {
    padding-left: 100px;
  }

  .grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
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

    <div class="container pt-3">

      <div
        class="grid"
        on:drop={event => drop(event, 'list')}
        on:touchend={event => drop(event, 'list')}
        on:dragover={dragover}
        on:dragleave={dragleave}>
        {#each methods.getTrackers() as tracker, i (tracker.tag)}
          <div
            class="tracker-grabber"
            draggable={true}
            on:touchstart={event => dragstart(event, 'list', i)}
            on:touchmove={event => dragstart(event, 'list', i)}
            on:dragstart={event => dragstart(event, 'list', i)}>
            <button
              class="btn-delete zmdi zmdi-close"
              on:click={event => {
                methods.removeTracker(event, tracker);
              }} />
            <NTrackerButton
              {tracker}
              id={tracker.tag}
              className={i % 2 ? 'wiggle' : 'wiggle-other'} />
            <!-- <NItem title={tracker.label} borderBottom id={tracker.tag}>
              <span class="text-lg emoji" slot="left">{tracker.emoji}</span>
            </NItem> -->
          </div>
        {/each}
      </div>
      <div class="n-row">
        <div class="filler" />
        <button
          class="btn btn mt-4 btn-danger flex-grow"
          on:click={methods.deleteBoard}>
          Delete
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
