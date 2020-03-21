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

  //Container for Slider (range), Keypad and Timer
  import SliderInput from "./slider.svelte";
  import NKeypad from "./keypad.svelte";
  import NTimer from "./timer.svelte";

  // Utils
  import NomieUOM from "../../../utils/nomie-uom/nomie-uom";

  // Stores
  import { TrackerStore } from "../../../store/trackers";
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
      setTimeout(() => {
        // Wait to set the value
        data.value = tracker.default || 0;
        data.ready = true;
      }, 200);
    }, 12);
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
  <div class="input-toolbar n-row" slot="header">
    <div class="filler" />
    <span class="animate notice-text {data.ready ? 'visible' : 'hidden'}">
      {tracker.emoji} {tracker.label}
    </span>
    <div class="filler" />
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
          <NKeypad
            {tracker}
            {value}
            on:change={value => {
              data.value = value.detail;
            }} />
        </div>
      {:else if tracker.type === 'timer'}
        <NTimer
          tracker={data.tracker}
          xbind:value={data.value}
          on:change={event => {
            data.value = event.detail;
          }} />
      {:else}
        <div id="keypad-holder">
          <NKeypad
            {tracker}
            value={data.value}
            on:change={value => {
              data.value = value.detail;
            }} />
        </div>
      {/if}
    </div>
  {/if}

  <div
    class="footer d-flex flex-row align-center justify-content-between w-100"
    slot="footer">
    {#if data.tracker}
      {#if data.tracker.type !== 'timer'}
        <button
          aria-label="Cancel"
          on:click={methods.onCancel}
          class="btn btn-clear btn-lg w-25 {data.tracker.type == 'timer' && !data.tracker.started ? 'd-none' : ''}">
          <span class=" zmdi zmdi-close" />
        </button>
      {/if}

      {#if data.tracker.type == 'timer'}
        <button
          on:click={methods.onCancel}
          aria-label="Cancel"
          class="btn btn-clear btn-lg mr-2 {data.value ? 'w-25' : 'w-100'}">
          {#if data.value}
            <span class=" zmdi zmdi-close" />
          {:else}Close{/if}
        </button>
      {/if}

      {#if data.tracker.type == 'timer' && data.value}
        <button
          on:click={methods.onSave}
          class="btn btn-primary btn-lg "
          aria-label="Save this log"
          style="width:105px;">
          {saveLabel}
        </button>
      {/if}

      <!-- Every Other Button -->
      {#if data.tracker.type != 'timer' && $Interact.trackerInput.allowSave !== false}
        <button
          on:click={methods.onSave}
          aria-label="Save this log"
          class="btn btn-primary btn-lg "
          style="width:105px;">
          {saveLabel}
        </button>
      {/if}

      {#if data.tracker.type == 'timer' && !data.tracker.started && !data.value}
        <button
          on:click={methods.startTimer}
          aria-label="Start Timer"
          class="btn btn-success btn-lg w-100">
          Start
        </button>
      {/if}

      {#if data.tracker.type == 'timer' && data.tracker.started !== null}
        <button
          on:click={methods.stopTimer}
          aria-label="Stop Timer"
          class="btn btn-danger btn-lg btn-block {data.tracker.started > 0 ? '' : 'd-none'}">
          Stop
        </button>
      {/if}

      {#if (data.tracker.type !== 'timer' || data.value) && hideAdd !== true}
        <button
          on:click={methods.onAdd}
          title="Add this to the note, but don't save yet"
          class="btn btn-clear btn-lg w-25 {tracker.started ? 'd-none' : ''}">
          <!-- local hack to make plus match with close-->
          <span class="zmdi zmdi-plus" />
        </button>
      {/if}
    {/if}

  </div>

  <!-- <div
    class="w-25 btn btn-clear {tracker.started ? 'd-inline-block' : 'd-none'}" /> -->
</NModal>
