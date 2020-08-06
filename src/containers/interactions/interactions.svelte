<script>
  /**
   * Jun 12 2020 - Good god this file has turned into a nightmare.
   */

  import { onMount } from "svelte";
  // vendors
  import md5 from "md5";

  //modules
  import Tracker from "../../modules/tracker/tracker";
  import NomieLog from "../../modules/nomie-log/nomie-log";
  // utils
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import Storage from "../../modules/storage/storage";
  // Components
  import Toast from "../../components/toast/toast.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NAlertBox from "../../components/alertbox/alertbox.svelte";
  import NPopMenu from "../../components/pop-menu/pop-menu.svelte";
  import PinLock from "../pin-lock/pin-lock.svelte";
  import NTextualize from "../../components/note-textualizer/note-textualizer.svelte";

  import NShareImage from "../../components/share-image/share-image.svelte";

  import NLocationModal from "../../containers/map/location-modal.svelte";

  // import NCamera from "../../components/camera/camera.svelte";
  // Containers
  import NMap from "../map/map.svelte";
  import TrackerSelector from "../tracker/selector/selector.svelte";
  import NSelector from "../selector/selector.svelte";
  import NTrackerEditor from "../tracker/editor/editor.svelte";
  import TrackerInput from "../tracker/input/input.svelte";
  import LogEditor from "../log-editor/log-editor.svelte";
  // Store
  import { Interact } from "../../store/interact";
  import { UserStore } from "../../store/user-store";
  import { ActiveLogStore } from "../../store/active-log";
  import { LedgerStore } from "../../store/ledger";
  import { BoardStore } from "../../store/boards";
  import { TrackerStore } from "../../store/tracker-store";

  let promptInput;
  let logEditorTracker;
  let lastId;

  $: if ($Interact.prompt.show && promptInput) {
    promptInput.focus();
  }

  let ready = false;

  const methods = {
    getLogTrackers(log) {
      return Object.keys(log.trackers).map((tag) => {
        return {
          value: log.trackers[tag].value || 0,
          tag: tag,
          tracker: $TrackerStore.trackers[tag] || new Tracker({ tag: tag }),
        };
      });
    },
    getTracker(tag) {
      return $TrackerStore.trackers[tag] || new Tracker({ tag: tag });
    },
    onCameraPhoto(photo) {
      const path = `camera/${md5(photo)}`;
      Storage.put(path, photo).then(() => {
        if ($Interact.camera.onInteract) {
          $Interact.camera.onInteract(path);
        }
      });
    },
    editLogDataOnSave(event) {
      let tracker = event.detail.tracker;
      let value = event.detail.value;
      let valueSet = false;
      let newNote = $Interact.logDataEditor.log.note.split(" ").map((word) => {
        if (word.search(`#${$Interact.logDataEditor.tag}`) === -1) {
          return word;
        } else if (!valueSet) {
          valueSet = true;
          return `#${tracker.tag}(${value})`;
        } else {
          return "";
        }
      });
      newNote.push();
      $Interact.logDataEditor.log.note = newNote.join(" ");
      $Interact.logDataEditor.log = new NomieLog($Interact.logDataEditor.log);
      $Interact.logDataEditor.log.expanded();
      $Interact.logDataEditor.tag = null;
    },
  };
  ready = true;
</script>

<NPopMenu
  title={$Interact.popmenu.title}
  description={$Interact.popmenu.description}
  show={$Interact.popmenu.show}
  buttons={$Interact.popmenu.buttons}
  on:close={() => {
    Interact.dismiss();
  }} />

<NAlertBox
  show={$Interact.alert.show}
  title={$Interact.alert.title}
  message={$Interact.alert.message}
  ok={$Interact.alert.ok}
  cancel={$Interact.alert.cancel}
  onInteract={(answer) => {
    $Interact.alert.onInteract(answer);
    Interact.dismiss();
  }} />

<!-- <NCamera
  show={$Interact.camera.show}
  on:photo={event => {
    methods.onCameraPhoto(event.detail);
  }}
  on:close={Interact.closeCamera} /> -->

<NAlertBox
  show={$Interact.prompt.show}
  title={$Interact.prompt.title}
  message={$Interact.prompt.message}
  cancel={$Interact.prompt.cancel}
  onInteract={(answer) => {
    if (answer) {
      if ($Interact.prompt.onInteract) {
        $Interact.prompt.onInteract($Interact.prompt.value);
      }
    }
    Interact.dismiss();
  }}>
  {#if $Interact.prompt.valueType == 'textarea'}
    <textarea
      name="value"
      title="input value"
      bind:this={promptInput}
      placeholder={$Interact.prompt.placeholder}
      bind:value={$Interact.prompt.value}
      class="form-control mt-2"
      style="min-height:200px;" />
  {:else if $Interact.prompt.valueType == 'number'}
    <input
      name="value"
      pattern="[0-9]*"
      inputmode="numeric"
      title="input value"
      bind:this={promptInput}
      placeholder={$Interact.prompt.placeholder}
      bind:value={$Interact.prompt.value}
      on:focus={this.select}
      type="number"
      class="form-control mt-2" />
  {:else if $Interact.prompt.valueType == 'datetime'}
    <input
      name="value"
      title="input value"
      bind:this={promptInput}
      on:focus={this.select}
      placeholder={$Interact.prompt.placeholder}
      bind:value={$Interact.prompt.value}
      type="datetime-local"
      class="form-control mt-2" />
  {:else}
    <input
      title="input value"
      name="value"
      bind:this={promptInput}
      placeholder={$Interact.prompt.placeholder}
      bind:value={$Interact.prompt.value}
      class="form-control mt-2" />
  {/if}
</NAlertBox>

<Toast />

<NLocationModal />

{#if ($UserStore.meta || {}).lock}
  <PinLock />
{/if}

<!-- Tracker Editor -->

<NTrackerEditor
  tracker={new Tracker($Interact.trackerEditor.tracker)}
  on:save={(tracker) => {
    $Interact.trackerEditor.show = false;
    $Interact.trackerEditor.tracker = null;
    if ($Interact.trackerEditor.onInteract) {
      $Interact.trackerEditor.onInteract(tracker);
    }
  }}
  on:close={() => {
    Interact.dismissEditTracker();
  }} />

<!-- Tracker Selector -->

<TrackerSelector
  show={$Interact.trackerSelector.show}
  multiple={$Interact.trackerSelector.multiple}
  on:cancel={() => {
    Interact.dismissTrackerSelector();
  }}
  on:select={(event) => {
    let trackers = event.detail;
    if ($Interact.trackerSelector.onInteract) {
      $Interact.trackerSelector.onInteract(trackers);
      Interact.dismissTrackerSelector();
    } else {
      Interact.dismissTrackerSelector();
    }
  }} />

<NSelector
  show={$Interact.selector.show}
  multiple={$Interact.selector.multiple}
  on:cancel={() => {
    Interact.dismissSelector();
  }}
  on:select={(event) => {
    let trackers = event.detail;
    if ($Interact.selector.onInteract) {
      $Interact.selector.onInteract(trackers);
      Interact.dismissSelector();
    } else {
      Interact.dismissSelector();
    }
  }} />

<!-- Share Image -->
{#if $Interact.shareImage.log}
  <NShareImage />
{/if}

<!-- Tracker Input -->

{#if $Interact.trackerInput.show}
  <TrackerInput
    on:save={(event) => {
      if ($Interact.trackerInput.onInteract) {
        $Interact.trackerInput.onInteract(event.detail);
      }
      Interact.dismissTrackerInput();
      $ActiveLogStore.score = ActiveLogStore.calculateScore($ActiveLogStore.note, $TrackerStore.trackers);
      LedgerStore.saveLog($ActiveLogStore).then(() => {
        ActiveLogStore.clear();
      });
    }}
    on:add={(event) => {
      if ($Interact.trackerInput.onInteract) {
        $Interact.trackerInput.onInteract(event.detail);
      }
      Interact.dismissTrackerInput();
    }}
    on:cancel={() => {
      if ($Interact.trackerInput.onInteract) {
        $Interact.trackerInput.onInteract(null);
      }
      Interact.dismissTrackerInput();
    }}
    on:cancelAll={() => {
      Interact.dismissTrackerInput();
    }}
    show={$Interact.trackerInput.show}
    tracker={new Tracker($Interact.trackerInput.tracker)}
    value={$Interact.trackerInput.value} />
{/if}

{#if $Interact.locationViewer.show}
  <!-- TODO make this use the Location Modal in the future -->
  <NModal
    show={true}
    fullscreen
    flexBody
    allowClose={true}
    title={$Interact.locationViewer.locations[0].title || 'Location'}
    on:close={Interact.dismissLocations}>
    <NMap locations={$Interact.locationViewer.locations} />
    <div class="mt-2" slot="footer" />
  </NModal>
{/if}
{#if $Interact.logEditor.show}
  <LogEditor
    log={$Interact.logEditor.log}
    on:close={() => {
      Interact.dismissEditLog();
    }}
    on:save={async (evt) => {
      try {
        let log = evt.detail;
        let updatedLog = await LedgerStore.updateLog(log, $Interact.logEditor.log.end);
        if ($Interact.logEditor.onInteract) {
          $Interact.logEditor.onInteract(log);
        }
        Interact.dismissEditLog();
      } catch (e) {
        Interact.alert(e.message);
      }
    }} />
{/if}
