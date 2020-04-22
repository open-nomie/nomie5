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
  import NTimer from "./timer.svelte";
  import NCalculator from "../../../components/calculator/calculator.svelte";

  // Utils
  import NomieUOM from "../../../utils/nomie-uom/nomie-uom";

  // Stores
  import { TrackerStore } from "../../../store/tracker-store";
  import { Interact } from "../../../store/interact";
  import { Lang } from "../../../store/lang";

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
    ready: false // when it's ready
  };

  // Set up the Methods
  const methods = {
    // When the Save is hit
    onSave() {
      // Dispatch value and tracker
      dispatch("save", {
        value: data.value,
        tracker: tracker
      });
    },
    // When Add is hit
    onAdd() {
      // Dispatch add
      dispatch("add", {
        value: data.value,
        tracker: tracker
      });
    },
    onCancel() {
      dispatch("cancel");
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
    }
  };

  // If Tracker Changes
  // FIres each time something happens to this object
  $: if (tracker && data.tracker && data.tracker !== tracker) {
    // Set to local variable
    setTimeout(() => {
      // Set to not ready and the new tracker
      data.ready = true; // TODO: make this lack janky
      data.tracker = tracker;
      console.log("Data Tracker", data.tracker);
      data.value = tracker.default || 0;
      data.ready = true;
    }, 12);
  }

  function editTracker() {
    Interact.editTracker(tracker);
    Interact.dismissTrackerInput();
  }

  // When Component Mounts
  onMount(() => {
    // If the value changes, and no data.value exists.
    if (value && !data.value) {
      data.value = value;
    } else {
      // TODO: Figure out wtf is going on with value and data.value - can we just use value?
      data.value = tracker.default || 0;
      value = data.value;
    }
    data.tracker = tracker;
    setTimeout(() => {
      data.ready = true;
    }, 120);
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
  .footer .btn {
    border-radius: 50px;
  }
</style>

<NModal
  show={show || $Interact.trackerInput.show}
  type="fullscreen"
  className="tracker-input">
  <div class="n-toolbar-grid n-row" slot="header">
    <div class="left truncate pl-3">
      <span class="animate truncate up {data.ready ? 'visible' : 'hidden'}">
        {tracker.label}
      </span>
    </div>
    <div class="main">
      <span class="animate up text-lg {data.ready ? 'visible' : 'hidden'}">
        {tracker.emoji}
        {#if data.tracker}{data.tracker.displayValue(data.value)}{/if}
      </span>
    </div>
    <button class="btn btn-clear tap-icon right" on:click={editTracker}>
      <NIcon name="edit" size="26" />
    </button>
  </div>
  <!-- Is the data ready -->
  {#if data.ready === true}
    <!-- Slide in the input -->
    <div class="input-model type-{tracker.type}">
      {#if tracker.type === 'range'}
        <SliderInput
          value={(data.value || tracker.min) + ''}
          min={(tracker.min || 0) + ''}
          max={(tracker.max || 0) + ''}
          on:change={value => {
            data.value = value.detail;
          }} />
      {:else if tracker.type === 'value' || tracker.type === 'tick'}
        <div id="keypad-holder">
          <NCalculator
            {value}
            displayFormat={input => {
              console.log('Display Input', input);
              return tracker.displayValue(input || '');
            }}
            on:change={value => {
              data.value = value.detail;
            }} />

        </div>
      {:else if tracker.type === 'timer'}
        <NTimer
          tracker={data.tracker}
          bind:value={data.value}
          on:change={event => {
            data.value = event.detail;
          }} />
      {:else}
        <div id="keypad-holder">
          <NCalculator
            {value}
            displayFormat={input => {
              console.log('Display Input', input);
              return tracker.displayValue(input || '');
            }}
            on:change={value => {
              data.value = value.detail;
            }} />
        </div>
      {/if}
    </div>
  {/if}

  <div class="footer n-toolbar-grid" slot="footer">

    {#if data.tracker}
      <div class="left">
        <button
          aria-label="Cancel"
          on:click={methods.onCancel}
          class="btn btn-clear btn-lg">
          {Lang.t('general.cancel', 'Cancel')}
        </button>
      </div>
      <!-- end left toolbar -->

      <div class="main px-2">

        {#if (data.tracker.type == 'timer' && data.value) || (data.tracker.type != 'timer' && $Interact.trackerInput.allowSave !== false)}
          <button
            on:click={methods.onSave}
            class="btn btn-primary btn-lg text-white btn-block "
            aria-label="Save this log">
            {saveLabel}
          </button>
        {/if}

        {#if data.tracker.type == 'timer' && !data.tracker.started && !data.value}
          <button
            on:click={methods.startTimer}
            aria-label="Start Timer"
            class="btn btn-success btn-lg btn-block text-white">
            {Lang.t('general.start', 'Start')}
          </button>
        {/if}

        {#if data.tracker.type == 'timer' && data.tracker.started !== null}
          <button
            on:click={methods.stopTimer}
            aria-label="Stop Timer"
            class="btn btn-danger text-white btn-lg btn-block {data.tracker.started > 0 ? '' : 'd-none'}">
            {Lang.t('general.stop', 'Stop')}
          </button>
        {/if}

      </div>
      <!-- end main toolbar-grid-->

      <div class="right">

        {#if (data.tracker.type !== 'timer' || data.value) && hideAdd !== true}
          <button
            on:click={methods.onAdd}
            title="Add this to the note, but don't save yet"
            class="btn btn-clear btn-lg {tracker.started ? 'd-none' : ''}">
            <!-- local hack to make plus match with close-->
            <NIcon name="add" size="32" />
            Add
          </button>
        {/if}
      </div>
      <!-- end toolbar-grid right -->
    {/if}

  </div>

  <!-- <div
    class="w-25 btn btn-clear {tracker.started ? 'd-inline-block' : 'd-none'}" /> -->
</NModal>
