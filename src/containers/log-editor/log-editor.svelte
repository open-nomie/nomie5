<script>
  // Utils
  import Logger from "../../utils/log/log";
  import time from "../../utils/time/time";

  //Svelte
  import { createEventDispatcher, onMount } from "svelte";

  // Vendor
  import dayjs from "dayjs";

  // Modules
  import NomieLog from "../../modules/nomie-log/nomie-log";

  // Components
  import NModal from "../../components/modal/modal.svelte";
  import NPositivitySelector from "../../components/positivity-selector/positivity-selector.svelte";
  import AutoComplete from "../../components/auto-complete/auto-complete.svelte";
  import HScroller from "../../components/h-scroller/h-scroller.svelte";
  import NMap from "../../containers/map/map.svelte";
  import NCell from "../../components/cell/cell.svelte";
  import NInput from "../../components/input/input.svelte";
  import NIcon from "../../components/icon/icon.svelte";

  // Props
  export let log = undefined;

  let textarea;
  // consts
  const console = new Logger("log-editor.svelte");
  const dispatch = createEventDispatcher();

  // Setup state
  let state = {
    view: "note",
    dateTimeValue: null,
    saving: false
  };

  // Watch for Log
  // $: if (log) {
  //   state.log = new NomieLog(log);
  // }

  // Set up Methods
  const methods = {
    init() {
      if (log) {
        state.log = new NomieLog(log);
        state.dateTimeValue = dayjs(new Date(log.end)).format(
          "YYYY-MM-DDTHH:mm"
        );
      }
    },
    setView(view) {
      state.view = view;
    },
    getLocations() {
      let locations = [];
      if (state.log.lat) {
        locations.push({
          lat: state.log.lat,
          lng: state.log.lng,
          name: state.log.location
        });
      }
      return locations;
    },
    save() {
      state.saving = true;
      let updatedDate = time.datetimeLocal(state.dateTimeValue);
      state.log.start = updatedDate.getTime();
      state.log.end = updatedDate.getTime();
      dispatch("save", state.log);
      // dispatch("close");
    }
  };

  onMount(() => {
    methods.init();
  });
</script>

<style lang="scss">
  :global(.log-editor) {
    z-index: 1200 !important;
  }
  :global(.log-editor .view-port .n-map-container) {
    height: 300px;
  }

  :global(.log-editor .n-modal) {
    max-width: 300px;
    width: 300px;
  }

  .view-port {
    min-height: 200px;
    textarea {
      font-size: 1rem;
      height: 275px;
    }

    .center-content {
      display: flex;
      width: 100%;
      flex-grow: 1;
      flex-shrink: 1;
      height: 100%;
      align-items: center;
      padding: 16px;
      height: 200px;
    }
    .date-time {
      input {
        border: none;
        border-bottom: solid 2px var(--color-primary);
        background-color: transparent;
        border-radius: 0;
        padding: 7px 0;
        color: var(--color-inverse);
      }
    }
  }
</style>

{#if state.log}
  <NModal title="Log Options" className="log-editor">
    <div class="btn-group w-100 m-2" slot="header">
      <button
        class="btn -text {state.view === 'note' ? 'active' : ''}"
        on:click={() => {
          methods.setView('note');
        }}>
        Note
      </button>
      <button
        class="btn -text {state.view === 'score' ? 'active' : ''}"
        on:click={() => {
          methods.setView('score');
        }}>
        Score
      </button>
      <button
        class="btn -location {state.view === 'where' ? 'active' : ''}"
        on:click={() => {
          methods.setView('where');
        }}>
        Where
      </button>
      <button
        class="btn {state.view === 'when' ? 'active' : ''}"
        on:click={() => {
          methods.setView('when');
        }}>
        When
      </button>
    </div>

    <div class="view-port">
      {#if state.view == 'note'}
        <div class="p-2">
          <textarea
            class="form-control"
            bind:this={textarea}
            bind:value={state.log.note} />
          <AutoComplete
            scroller
            input={state.log.note}
            on:select={evt => {
              state.log.note = evt.detail.note;
              textarea.focus();
              textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            }} />
        </div>
      {:else if state.view == 'where'}
        <NMap
          locations={methods.getLocations()}
          picker={true}
          on:change={event => {
            state.log.lat = event.detail.lat;
            state.log.lng = event.detail.lng;
            state.log.location = event.detail.location;
          }} />
      {:else if state.view == 'score'}
        <div class="score center-content">
          <NPositivitySelector
            size="xl"
            score={state.log.score}
            on:change={evt => {
              state.log.score = evt.detail;
            }} />
        </div>
      {:else if state.view == 'when'}
        <div class="date-time center-content">
          <input
            name="value"
            title="input value"
            bind:value={state.dateTimeValue}
            type="datetime-local"
            class="form-control mt-2" />
        </div>
      {/if}
    </div>

    <div class="buttons n-row" slot="footer">
      {#if !state.saving}
        <button
          class="btn btn-clear w-50"
          on:click={() => {
            dispatch('close');
          }}>
          Cancel
        </button>
        <button class="btn btn-primary w-50" on:click={methods.save}>
          Save
        </button>
      {:else}
        <button class="btn btn-primary w-100" disabled>Saving...</button>
      {/if}
    </div>

  </NModal>
{/if}
