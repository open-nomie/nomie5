<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";
  import { tap } from "@sveltejs/gestures";

  import { onMount, onDestroy } from "svelte";

  // Utils
  import Logger from "../utils/log/log";
  import arrayUtils from "../utils/array/array_utils";
  import tick from "../utils/tick/tick";
  // Modules
  import Tracker from "../modules/tracker/tracker";
  // Components
  import NText from "../components/text/text.svelte";
  import NInput from "../components/input/input.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NTrackerButton from "../containers/board/tracker-button.svelte";
  import NBall from "../components/tracker-ball/ball.svelte";
  import NBackButton from "../components/back-button/back-button.svelte";

  import NSortableList from "../components/sortable-list/sortable-list.svelte";

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

  $: if ($BoardStore.activeBoard && ready == false) {
    ready = true;
    data.updatedLabel = $BoardStore.activeBoard.label;
  }

  let titleChange = false;
  $: if (data.updatedLabel !== $BoardStore.activeBoard.lable) {
    titleChange = true;
  } else {
    titleChange = false;
  }

  const methods = {
    refresh() {
      data.refreshing = true;
      setInterval(() => {
        data.refreshing = false;
      }, 100);
    },
    initialize() {},
    getTrackers() {},
    async save(options = {}) {
      options.silent = options.silent == false ? false : true;
      try {
        BoardStore.update(state => {
          state.activeBoard.label = data.updatedLabel;
          state.activeBoard.trackers = trackers.map(tracker => tracker.tag);
          return state;
        });
        await tick(10);
        let saved = await BoardStore.saveBoard($BoardStore.activeBoard);
        if (!options.silent) {
          Interact.toast(Lang.t("general.saved", "Saved"));
        }
      } catch (e) {
        Interact.alert(Lang.t("general.error", "Error"), e.message);
      }
    },
    async deleteBoard() {
      let confirmed = await Interact.confirm(
        "Delete " + $BoardStore.activeBoard.label + " tab?",
        "You can recreate it later, but it's not super easy."
      );
      if (confirmed === true) {
        data.refreshing = true;
        await BoardStore.deleteBoard($BoardStore.activeBoard.id);
        navigate("/");
        Interact.toast("Deleted");
      }
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
    }
  };

  function trackersSorted(evt) {
    setTimeout(() => {
      trackers = evt.detail;
      methods.save({ silent: true });
    }, 10);
  }

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

  let list = [
    { id: 1, name: "First Item" },
    { id: 2, name: "Second Item" },
    { id: 3, name: "Third Item" }
  ];
  const sortList = ev => {
    trackers = ev.detail;
  };
</script>

<style lang="scss">
  .grid-container {
    display: flex;
    flex-direction: column;
    align-items: space-around;
    min-height: 50vh;
  }

  .btn-group {
    .btn {
      width: 36px;
    }
  }

  // Animation from https://www.kirupa.com/html5/creating_the_ios_icon_jiggle_wobble_effect_in_css.htm
</style>

{#if $BoardStore.activeBoard}
  <NPage>

    <div class="n-toolbar-grid" slot="header">
      <div class="left">
        <NBackButton />
      </div>
      <div class="main">
        <h1 class="title">Edit Tab</h1>
      </div>
    </div>
    <!-- /.container -->

    <div class="container px-0">

      <div class="n-list pt-2">
        <NItem className="py-2">
          <NInput
            type="text"
            placeholder="Tab Label"
            bind:value={data.updatedLabel}>
            <div slot="right">
              {#if data.updatedLabel != $BoardStore.activeBoard.label}
                <button class="btn text-primary-bright" on:click={methods.save}>
                  {Lang.t('general.save')}
                </button>
              {/if}
            </div>

          </NInput>
        </NItem>

        {#if trackers}
          <NSortableList
            bind:items={trackers}
            handle=".zmdi-menu"
            key="tag"
            on:update={trackersSorted}
            let:item>
            <NItem className="py-2 bottom-line">
              <div slot="left" class="n-row">
                <button
                  class="btn btn-icon zmdi zmdi-minus-circle text-red mr-2"
                  on:click={evt => {
                    methods.removeTracker(evt, item);
                  }} />
                <NBall className="frame" emoji={item.emoji} size={40} />
              </div>
              {item.label}
              <i class="zmdi zmdi-menu text-faded-3" slot="right" />
            </NItem>
          </NSortableList>
        {/if}

        <!-- {#each trackers as tracker, i (tracker.tag)}
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
        {/each} -->
      </div>

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
