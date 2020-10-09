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

  import NInput from "../../components/input/input.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import DateTimeBar from "../../components/date-time-bar/date-time-bar.svelte";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import { Lang } from "../../store/lang";
  import ListItem from "../../components/list-item/list-item.svelte";
  import { Locations } from "../../store/locations";
  import Button from "../../components/button/button.svelte";

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
    saving: false,
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
        state.dateTimeValue = dayjs(new Date(log.end)).format("YYYY-MM-DDTHH:mm");
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
          name: state.log.location,
        });
      }
      return locations;
    },
    save() {
      state.saving = true;
      // let updatedDate = time.datetimeLocal(state.dateTimeValue);
      // state.log.start = updatedDate.getTime();
      // state.log.end = updatedDate.getTime();
      dispatch("save", state.log);
      // dispatch("close");
    },
  };

  async function selectLocation() {
    let location = await Locations.selectLocation();
    if (location) {
      state.log.lat = location.lat;
      state.log.lng = location.lng;
      state.log.location = location.name;
    }
  }

  onMount(() => {
    methods.init();
  });
</script>

<style lang="scss">
  :global(.log-editor) {
    z-index: 1301 !important;
  }
  :global(.log-editor .view-port .n-map-container) {
    height: 300px;
  }

  :global(.log-editor .view-port .date-time) {
    height: 350px;
    width: 100vw;
    max-width: 320px;
  }

  :global(.log-editor .n-modal) {
    max-width: 300px;
    width: 300px;
  }

  .view-port {
    min-height: 200px;
    textarea {
      font-size: 1em;
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
      min-height: 350px;
      padding: 0px;
    }
  }
</style>

{#if state.log}
  <NModal title="Log Options" className="log-editor">
    <div slot="header" class="w-100 p-2">
      <ButtonGroup
        buttons={[{ label: Lang.t('general.note', 'Note'), active: state.view === 'note', click() {
              methods.setView('note');
            } }, { label: Lang.t('general.score', 'Score'), active: state.view === 'score', click() {
              methods.setView('score');
            } }, { label: Lang.t('general.where', 'Where'), active: state.view === 'where', click() {
              methods.setView('where');
            } }, { label: Lang.t('general.when', 'When'), active: state.view === 'when', click() {
              methods.setView('when');
            } }]} />
    </div>

    <div class="view-port">
      {#if state.view == 'note'}
        <div class="p-2">
          <textarea class="form-control" bind:this={textarea} bind:value={state.log.note} />
          <AutoComplete
            scroller
            input={state.log.note}
            on:select={(evt) => {
              state.log.note = evt.detail.note;
              textarea.focus();
              textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            }} />

        </div>
      {:else if state.view == 'where'}
        {#if state.log}
          <div style="height:200px; max-height:200px; min-height:200px; overflow:hidden">
            <NMap
              style="max-height:200px;"
              locations={state.log.lat ? [{ lat: state.log.lat, lng: state.log.lng, name: state.log.location }] : []}
              picker={true}
              on:change={(event) => {
                state.log.lat = event.detail.lat;
                state.log.lng = event.detail.lng;
                state.log.location = event.detail.location;
              }} />
          </div>
        {/if}
        <ListItem compact clickable detail on:click={selectLocation}>Pick from my locations</ListItem>
      {:else if state.view == 'score'}
        <div class="score center-content">
          <NPositivitySelector
            size="xl"
            score={state.log.score}
            on:change={(evt) => {
              state.log.score = evt.detail;
            }} />
        </div>
      {:else if state.view == 'when'}
        <div class="date-time center-content p-0">
          <DateTimeBar
            opened
            style="padding:0px;"
            date={dayjs(state.log.end)}
            on:change={(evt) => {
              state.log.end = evt.detail.toDate().getTime();
            }} />
        </div>
      {/if}
    </div>

    <div class="buttons n-row" slot="footer">
      {#if !state.saving}
        <Button
          size="lg"
          className="w-50"
          type="clear"
          on:click={() => {
            dispatch('close');
          }}>
          Cancel
        </Button>
        <Button size="lg" className="w-50" on:click={methods.save}>Save</Button>
      {:else}
        <Button size="lg" className="w-100" disabled>Saving...</Button>
      {/if}
    </div>

  </NModal>
{/if}
