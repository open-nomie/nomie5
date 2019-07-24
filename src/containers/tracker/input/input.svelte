<script>
  // svelte
  import { createEventDispatcher, onMount } from "svelte";

  // Components
  import NModal from "../../../components/modal/modal.svelte";

  //Container Helpers
  import SliderInput from "./slider.svelte";
  import NKeypad from "./keypad.svelte";
  import NTimer from "./timer.svelte";

  // Utils
  import NomieUOM from "../../../utils/nomie-uom/nomie-uom";

  // Stores
  import { TrackerStore } from "../../../store/trackers";

  // Props
  export let tracker = undefined;
  export let show = true;
  export let value = undefined;
  export let hideAdd = undefined;
  export let saveLabel = "Save";

  // Consts
  const dispatch = createEventDispatcher();

  let data = {
    value: null,
    timerStarted: false,
    tracker: null,
    ready: false
  };

  $: if (value && !data.value) {
    data.value = value;
  }

  const methods = {
    onSave() {
      dispatch("save", {
        value: data.value,
        tracker: tracker
      });
    },
    onAdd() {
      dispatch("add", {
        value: data.value,
        tracker: tracker
      });
    },
    onCancel() {
      dispatch("cancel");
    },
    startTimer() {
      data.tracker.started = new Date().getTime();
      // TrackerStore.saveTracker(data.tracker);
      $TrackerStore[data.tracker.tag].started = new Date().getTime();
      TrackerStore.save();
    },
    stopTimer() {
      let s = (new Date().getTime() - tracker.started) / 1000;
      setTimeout(() => {
        data.tracker.started = null;
        data.value = s;
        $TrackerStore[data.tracker.tag].started = null;
        TrackerStore.save();
      }, 1);
    }
  };

  $: if (tracker) {
    data.tracker = tracker;
  }

  onMount(() => {
    console.log("Input Value", value, data.value);
    data.ready = true;
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
  }
</style>

<NModal show={true} title={tracker.label} className="tracker-input">
  {#if data.ready}
    {#if tracker.type === 'range'}
      <SliderInput
        value={(data.value || tracker.min) + ''}
        min={(tracker.min || 0) + ''}
        max={(tracker.max || 0) + ''}
        on:change={value => {
          data.value = value.detail;
        }} />
    {/if}

    {#if tracker.type === 'value' || tracker.type === 'tick'}
      <NKeypad
        {tracker}
        {value}
        on:change={value => {
          data.value = value.detail;
        }} />
    {/if}

    {#if tracker.type === 'timer'}
      <NTimer
        {value}
        tracker={data.tracker}
        bind:value={data.value}
        on:change={event => {
          data.value = event.detail;
        }} />
    {/if}
  {:else}...{/if}

  <div
    class="footer d-flex flex-row align-center justify-content-between w-100"
    slot="footer">

    {#if data.tracker.type !== 'timer'}
      <button
        on:click={methods.onCancel}
        class="btn btn-clear btn-lg w-25 {data.tracker.type == 'timer' && !data.tracker.started ? 'd-none' : ''}">
        <span class=" zmdi zmdi-close" />
      </button>
    {/if}

    {#if data.tracker.type == 'timer'}
      <button
        on:click={methods.onCancel}
        class="btn btn-light btn-lg mr-2 {data.value ? 'w-25' : 'w-100'}">
        {#if data.value}
          <span class=" zmdi zmdi-close" />
        {:else}Close{/if}
      </button>
    {/if}

    {#if data.tracker.type == 'timer' && data.value}
      <button on:click={methods.onSave} class="btn btn-primary btn-lg w-100">
        {saveLabel} Time
      </button>
    {/if}

    {#if data.tracker.type != 'timer'}
      <button on:click={methods.onSave} class="btn btn-primary btn-lg w-100">
        {saveLabel}
      </button>
    {/if}

    {#if data.tracker.type == 'timer' && !data.tracker.started && !data.value}
      <button
        on:click={methods.startTimer}
        class="btn btn-success btn-lg w-100">
        Start
      </button>
    {/if}

    {#if data.tracker.type == 'timer' && data.tracker.started !== null}
      <button
        on:click={methods.stopTimer}
        class="btn btn-danger btn-lg btn-block {data.tracker.started > 0 ? '' : 'd-none'}">
        Stop
      </button>
    {/if}

    {#if (data.tracker.type !== 'timer' || data.value) && hideAdd !== true}
      <button
        on:click={methods.onAdd}
        class="btn btn-clear btn-lg w-25 {tracker.started ? 'd-none' : ''}">
        <!-- local hack to make plus match with close-->
        <span class=" zmdi zmdi-plus" style="font-size:1.5rem;" />
      </button>
    {/if}

  </div>
  <!-- <div
    class="w-25 btn btn-clear {tracker.started ? 'd-inline-block' : 'd-none'}" /> -->
</NModal>
