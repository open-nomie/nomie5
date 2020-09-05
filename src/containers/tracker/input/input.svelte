<script>
  /**
   * Tracker Input Mege Component
   * This is a beast... Brace yourself.
   * Officialy "walk through" - Nov 2 2019
   */

  // svelte
  import { createEventDispatcher, onMount } from "svelte";
  import { slide } from "svelte/transition";

  // Components
  import NModal from "../../../components/modal/modal.svelte";
  import NIcon from "../../../components/icon/icon.svelte";

  //Container for Slider (range), Keypad and Timer
  import SliderInput from "./slider.svelte";
  import PickerInput from "./picker.svelte";
  import NTimer from "./timer.svelte";
  import NCalculator from "../../../components/calculator/calculator.svelte";

  // Utils
  import NomieUOM from "../../../utils/nomie-uom/nomie-uom";

  // Stores
  import { TrackerStore } from "../../../store/tracker-store";
  import { Interact } from "../../../store/interact";
  import { Lang } from "../../../store/lang";
  import Icon from "../../../components/icon/icon.svelte";
  import Button from "../../../components/button/button.svelte";

  // Props
  export let tracker = undefined; // You can provide a tracker
  export let show = undefined; // If it should show or not
  export let value = undefined; // If a valid is provided
  export let hideAdd = undefined; // If the Add button should be hidden
  export let saveLabel = Lang.t("general.save", "Save"); // The label of the save Button
  // Consts
  const dispatch = createEventDispatcher(); // Setup the dispatcher

  let data = {
    value: null, // holds current value
    tracker: null, // holds current tracker
    ready: false,
    suffix: "",
    calcUsed: false, // when it's ready
  };

  // Set up the Methods
  const methods = {
    // When the Save is hit
    onSave() {
      // Dispatch value and tracker
      dispatch("save", {
        value: data.value,
        tracker: tracker,
        suffix: data.suffix,
      });
    },
    // When Add is hit
    onAdd() {
      // Dispatch add
      dispatch("add", {
        value: data.value,
        tracker: tracker,
        suffix: data.suffix,
      });
    },
    onCancel() {
      if (!$Interact.trackerInput.allowSave) {
        dispatch("cancelAll");
      } else {
        dispatch("cancel");
      }
    },
    // When the user starts the time
    startTimer() {
      // Set the date to epoch time (best to avoid timezones);
      data.tracker.started = new Date().getTime();
      // Start the Timer for this tracker
      TrackerStore.startTimer(data.tracker);
      methods.onCancel();
    },
    // Stop the Timer
    stopTimer() {
      // Get the Seconds between now and when the tracker started
      data.value = (new Date().getTime() - tracker.started) / 1000;
      // Clear local
      data.tracker.started = null;
      // tell store to stop timer
      TrackerStore.stopTimer(data.tracker);
    },
  };

  // If Tracker Changes
  // FIres each time something happens to this object
  $: if (tracker && data.tracker && data.tracker !== tracker) {
    // Set to local variable
    setTimeout(() => {
      // Set to not ready and the new tracker
      data.ready = true; // TODO: make this lack janky
      data.tracker = tracker;
      data.value = tracker.default || 0;
      data.ready = true;
      data.suffix = "";
    }, 1);
  }

  function editTracker() {
    TrackerStore.trackerOptions(tracker, {
      click() {
        Interact.dismissTrackerInput();
      },
    });
    // Interact.editTracker(tracker);
  }

  // When Component Mounts
  onMount(() => {
    // If the value changes, and no data.value exists.
    if (value && !data.value) {
      data.value = value;
    } else {
      data.value = tracker.default || 0;
      value = data.value;
    }
    data.tracker = tracker;
    setTimeout(() => {
      data.ready = true;
    }, 12);
  });
</script>

<style lang="scss">
  .tracker-input {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    flex-grow: 1;
    height: 100%;
    .btn.w-25 {
      width: 30% !important;
      &:first-child {
        margin-right: 10px;
      }
    }
  }
  :global(.tracker-input .edit-toggle) {
    position: fixed;
    top: 20px;
    z-index: 1000;
  }
  .footer .btn {
    border-radius: 50px;
  }
</style>

<NModal
  show={show || $Interact.trackerInput.show}
  type="fullscreen"
  bodyClass={`${tracker.type == 'picker' ? 'no-scroll' : ''}`}
  className="tracker-input">
  <div class="n-toolbar-grid n-row" slot="header">
    <div class="left truncate pl-3" />
    <div class="main">
      <span class="animate up text-md {data.ready ? 'visible' : 'hidden'}">{tracker.emoji} {tracker.label}</span>
    </div>
    <button class="btn btn-clear tap-icon right" on:click={editTracker}>
      <NIcon name="more" size="26" />
    </button>
  </div>
  <!-- Is the data ready -->
  {#if data.ready === true}
    <!-- Slide in the input -->
    <div class="input-model type-{tracker.type}">

      {#if tracker.type === 'range'}
        <SliderInput
          {tracker}
          value={(data.value || tracker.min) + ''}
          min={(tracker.min || 0) + ''}
          max={(tracker.max || 0) + ''}
          on:change={(value) => {
            data.value = value.detail;
          }} />
      {:else if tracker.type === 'picker'}
        <div class="p-2">
          <PickerInput
            {tracker}
            on:change={(evt) => {
              data.suffix = evt.detail;
            }} />
        </div>
      {:else if tracker.type === 'value' || tracker.type === 'tick'}
        <div id="keypad-holder">
          <NCalculator
            {value}
            displayFormat={(input) => {
              return tracker.displayValue(input || '');
            }}
            on:change={(changedValue) => {
              data.value = changedValue.detail;
            }} />
        </div>
      {:else if tracker.type === 'timer'}
        <NTimer
          tracker={data.tracker}
          bind:value={data.value}
          on:change={(event) => {
            data.value = event.detail;
          }} />
      {:else}
        <div id="keypad-holder">
          <NCalculator
            {value}
            displayFormat={(input) => {
              return tracker.displayValue(input || '');
            }}
            on:change={(value) => {
              data.value = value.detail;
            }} />
        </div>
      {/if}
    </div>
  {/if}

  <div class="footer n-toolbar-grid" slot="footer">

    {#if data.tracker}
      <div class="left">
        <Button
          color="transparent"
          shape="circle"
          size="lg"
          style="width:40px; height:40px;"
          title="Cancel"
          on:click={() => {
            methods.onCancel();
          }}>
          <Icon name="close" size="40" />
        </Button>
      </div>
      <!-- end left toolbar -->

      <div class="main px-2">

        {#if (data.tracker.type == 'timer' && data.value && $Interact.trackerInput.allowSave !== false) || (data.tracker.type != 'timer' && $Interact.trackerInput.allowSave !== false)}
          <Button
            size="lg"
            shape="round"
            block
            style="max-width:130px"
            on:click={methods.onSave}
            className="text-white"
            title="Save this log">
            {saveLabel}
          </Button>
        {/if}

        {#if data.tracker.type == 'timer' && !data.tracker.started && !data.value && $Interact.trackerInput.allowSave !== false}
          <Button
            color="success"
            shape="round"
            size="lg"
            block
            on:click={methods.startTimer}
            style="max-width:130px"
            title="Start Timer"
            className="text-white">
            {Lang.t('general.start', 'Start')}
          </Button>
        {/if}

        {#if data.tracker.type == 'timer' && data.tracker.started !== null}
          <Button
            color="danger"
            shape="round"
            size="lg"
            block
            on:click={methods.stopTimer}
            style="max-width:130px"
            title="Stop Timer"
            className="text-white {data.tracker.started > 0 ? '' : 'd-none'}">
            {Lang.t('general.stop', 'Stop')}
          </Button>
        {/if}

      </div>
      <!-- end main toolbar-grid-->

      <div class="right">

        {#if (data.tracker.type !== 'timer' || data.value) && hideAdd !== true}
          <Button
            color="transparent"
            shape="circle"
            style="width:42px; height:42px;"
            size="lg"
            on:click={methods.onAdd}
            title="Add this to the note, but don't save yet"
            className={tracker.started ? 'd-none' : ''}>
            <!-- local hack to make plus match with close-->
            {#if !$Interact.trackerInput.allowSave}
              <NIcon name="chevronRight" size="40" />
            {:else}
              <NIcon name="add" size="46" />
            {/if}
          </Button>
        {/if}
      </div>
      <!-- end toolbar-grid right -->
    {/if}

  </div>

  <!-- <div
    class="w-25 btn btn-clear {tracker.started ? 'd-inline-block' : 'd-none'}" /> -->
</NModal>
