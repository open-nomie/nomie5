<script>
  import { onMount } from "svelte";
  //modules
  import Tracker from "../../modules/tracker/tracker";
  import NomieLog from "../../modules/nomie-log/nomie-log";
  // utils
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  // Components
  import Toast from "../../components/toast/toast.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NAlertBox from "../../components/alertbox/alertbox.svelte";
  import NPopMenu from "../../components/pop-menu/pop-menu.svelte";
  import PinLock from "../pin-lock/pin-lock.svelte";
  import NTextualize from "../../components/note-textualizer/note-textualizer.svelte";
  // Containers
  import NMap from "../map/map.svelte";
  import TrackerSelector from "../tracker/selector/selector.svelte";
  import NTrackerEditor from "../tracker/editor/editor.svelte";
  import TrackerInput from "../tracker/input/input.svelte";
  // Store
  import { Interact } from "../../store/interact";
  import { UserStore } from "../../store/user";
  import { ActiveLogStore } from "../../store/active-log";
  import { LedgerStore } from "../../store/ledger";
  import { BoardStore } from "../../store/boards";
  import { TrackerStore } from "../../store/trackers";

  let promptInput;
  let logEditorTracker;
  $: if ($Interact.prompt.show) {
    promptInput.focus();
  }

  const methods = {
    getLogTrackers(log) {
      return Object.keys(log.trackers).map(tag => {
        return {
          value: log.trackers[tag].value || 0,
          tag: tag,
          tracker: $TrackerStore[tag] || new Tracker({ tag: tag })
        };
      });
    }
  };
</script>

<NPopMenu
  title={$Interact.popmenu.title}
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
  onInteract={answer => {
    $Interact.alert.onInteract(answer);
    Interact.dismiss();
  }} />

<NAlertBox
  show={$Interact.prompt.show}
  title={$Interact.prompt.message}
  cancel={$Interact.prompt.cancel}
  onInteract={answer => {
    if (answer) {
      if ($Interact.prompt.onInteract) {
        $Interact.prompt.onInteract($Interact.prompt.value);
      }
    }
    Interact.dismiss();
  }}>
  {#if $Interact.prompt.valueType == 'textarea'}
    <textarea
      bind:this={promptInput}
      placeholder={$Interact.prompt.placeholder}
      bind:value={$Interact.prompt.value}
      class="form-control mt-2" />
  {:else if $Interact.prompt.valueType == 'number'}
    <input
      bind:this={promptInput}
      placeholder={$Interact.prompt.placeholder}
      bind:value={$Interact.prompt.value}
      type="number"
      class="form-control mt-2" />
  {:else}
    <input
      bind:this={promptInput}
      placeholder={$Interact.prompt.placeholder}
      bind:value={$Interact.prompt.value}
      class="form-control mt-2" />
  {/if}
</NAlertBox>

<Toast message={$Interact.toast.message} show={$Interact.toast.show} />

{#if $Interact.locationFinder.show}
  <NModal title="Pick your location" fullscreen flexBody>
    <NMap
      picker={true}
      on:change={event => {
        $Interact.locationFinder.location = event.detail;
      }} />
    <button
      slot="footer"
      class="btn btn-lg btn-block btn-clear"
      on:click={Interact.dismissPickLocation}>
      Cancel
    </button>
    <button
      slot="footer"
      class="btn btn-lg btn-block btn-primary"
      on:click={() => {
        if ($Interact.locationFinder.onInteract) {
          $Interact.locationFinder.onInteract($Interact.locationFinder.location);
        }
        Interact.dismissPickLocation();
      }}>
      Select
    </button>
  </NModal>
{/if}

{#if ($UserStore.meta || {}).lock}
  <PinLock />
{/if}

{#if $Interact.trackerEditor.show}
  <NTrackerEditor
    show={true}
    tracker={new Tracker($Interact.trackerEditor.tracker)}
    on:save={tracker => {
      $Interact.trackerEditor.show = false;
      $Interact.trackerEditor.tracker = null;
      if ($Interact.trackerEditor.onInteract) {
        $Interact.trackerEditor.onInteract(tracker);
      }
    }}
    on:close={() => {
      $Interact.trackerEditor.show = false;
      $Interact.trackerEditor.tracker = null;
    }} />
{/if}

<TrackerSelector
  show={$Interact.trackerSelector.show}
  multiple={$Interact.trackerSelector.multiple}
  on:cancel={() => {
    Interact.dismissTrackerSelector();
  }}
  on:select={event => {
    let trackers = event.detail;
    if ($Interact.trackerSelector.onInteract) {
      $Interact.trackerSelector.onInteract(trackers);
      Interact.dismissTrackerSelector();
    } else {
      Interact.dismissTrackerSelector();
    }
  }} />

{#if $Interact.trackerInput.show === true}
  <TrackerInput
    on:save={event => {
      Interact.dismissTrackerInput();
      ActiveLogStore.addTag(event.detail.tracker.tag, event.detail.value);
      LedgerStore.saveLog($ActiveLogStore).then(() => {
        ActiveLogStore.clear();
      });
    }}
    on:add={event => {
      ActiveLogStore.addTag(event.detail.tracker.tag, event.detail.value);
      Interact.dismissTrackerInput();
    }}
    on:cancel={() => {
      Interact.dismissTrackerInput();
    }}
    show={true}
    tracker={new Tracker($Interact.trackerInput.tracker)} />
{/if}

{#if $Interact.locationViewer.show}
  <NModal
    show={true}
    fullscreen
    flexBody
    title={$Interact.locationViewer.title || 'Locations'}>
    <NMap locations={$Interact.locationViewer.locations} />
    <button
      class="btn btn-lg btn-primary btn-block mb-0"
      on:click={() => Interact.dismissLocations()}
      slot="footer">
      Close
    </button>
  </NModal>
{/if}

{#if $Interact.logDataEditor.show}
  <NModal show={true} flexBody title="Edit Data">
    <div class="n-list">
      {#each methods.getLogTrackers($Interact.logDataEditor.log) as TrackerValue}
        <NItem
          title={`${TrackerValue.tracker.emoji} ${TrackerValue.tracker.label}`}
          on:click={() => {
            $Interact.logDataEditor.tag = TrackerValue.tag;
            $Interact.logDataEditor.value = TrackerValue.value;
          }}>
          <span slot="right">
            {NomieUOM.format(TrackerValue.value, TrackerValue.tracker.uom)}
          </span>
        </NItem>
      {/each}
    </div>

    {#if $Interact.logDataEditor.tag && $Interact.logDataEditor.log}
      <TrackerInput
        saveLabel="Set"
        hideAdd={true}
        value={$Interact.logDataEditor.value}
        tracker={$TrackerStore[$Interact.logDataEditor.tag] || new Tracker({
            tag: $Interact.logDataEditor.tag
          })}
        on:save={event => {
          let tracker = event.detail.tracker;
          let value = event.detail.value;
          let newNote = $Interact.logDataEditor.log.note
            .split(' ')
            .filter(word => {
              return word.search(`#${$Interact.logDataEditor.tag}`) === -1;
            });
          newNote.push(`#${tracker.tag}(${value})`);
          $Interact.logDataEditor.log.note = newNote.join(' ');
          $Interact.logDataEditor.log = new NomieLog($Interact.logDataEditor.log);
          $Interact.logDataEditor.log.expanded();
          $Interact.logDataEditor.tag = null;
        }}
        on:cancel={() => {
          $Interact.logDataEditor.tag = null;
        }} />
    {/if}

    <button
      class="btn btn-lg btn-light mr-1 flex-grow"
      slot="footer"
      on:click={Interact.dismissEditLogData}>
      Cancel
    </button>
    <button
      class="btn btn-lg btn-primary mr-1 flex-grow"
      slot="footer"
      on:click={() => {
        $Interact.logDataEditor.show = false;
        LedgerStore.updateLog($Interact.logDataEditor.log).then(() => {
          Interact.dismissEditLogData();
          Interact.toast('Updated');
        });
      }}>
      Save
    </button>

  </NModal>
{/if}
