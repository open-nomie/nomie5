<script lang="ts">
  // Utils
  import Logger from '../../utils/log/log'
  import time from '../../utils/time/time'

  //Svelte
  import { createEventDispatcher, onMount } from 'svelte'

  // Vendor
  import dayjs from 'dayjs'

  // Modules
  import NomieLog from '../../modules/nomie-log/nomie-log'

  // Components
  import NModal from '../../components/modal/modal.svelte'
  import NPositivitySelector from '../../components/positivity-selector/positivity-selector.svelte'
  import AutoComplete from '../../components/auto-complete/auto-complete.svelte'
  import HScroller from '../../components/h-scroller/h-scroller.svelte'
  import NMap from '../../domains/map/map.svelte'

  import NInput from '../../components/input/input.svelte'
  import NIcon from '../../components/icon/icon.svelte'
  import DateTimeBar from '../../components/date-time-bar/date-time-bar.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import { Lang } from '../../store/lang'
  import ListItem from '../../components/list-item/list-item.svelte'
  import { Locations } from '../../store/locations'
  import Button from '../../components/button/button.svelte'
  import tick from '../../utils/tick/tick'
  import Icon from '../../components/icon/icon.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Text from '../../components/text/text.svelte'
  import List from '../../components/list/list.svelte'
  import Input from '../../components/input/input.svelte'
  import DatePicker from '../../components/date-picker/date-picker.svelte'
  import Map from '../../domains/map/map.svelte'
  import { fade } from 'svelte/transition'
  import type NLog from '../../modules/nomie-log/nomie-log'
  import math from '../../utils/math/math'
  import { Interact } from '../../store/interact'
  import type Location from '../../modules/locate/Location'
  import { ChevronDown } from 'svelte-hero-icons'

  // Props
  export let log = undefined

  let textarea
  // consts
  const console = new Logger('log-editor.svelte')
  const dispatch = createEventDispatcher()

  interface LogEditorState {
    log: NLog | undefined
    saving: boolean
    mapReady: boolean
  }

  // Setup state
  let state: LogEditorState = {
    saving: false,
    mapReady: false,
    log: undefined,
  }

  // Watch for Log
  // $: if (log) {
  //   state.log = new NomieLog(log);
  // }

  // Set up Methods
  const methods = {
    init() {
      if (log) {
        state.log = new NomieLog(log)
        // Add a space to avoid auto complete
        state.log.note = `${state.log.note} `
      }
      state.mapReady = true
    },
    getLocations() {
      let locations = []
      if (state.log.lat) {
        locations.push({
          lat: state.log.lat,
          lng: state.log.lng,
          name: state.log.location,
        })
      }
      return locations
    },
    save() {
      state.saving = true
      dispatch('save', state.log)
      // dispatch("close");
    },
  }

  let toggleMap = false

  async function selectLocation() {
    // let location = await Locations.selectLocation();
    let _location: any = await Interact.pickLocation()
    if (_location) {
      let location: Location = _location
      state.log.lat = location.lat
      state.log.lng = location.lng
      state.log.location = location.name
    }
  }

  onMount(() => {
    methods.init()
  })
</script>

<style lang="postcss" global>
  .log-editor {
    z-index: 1301 !important;
  }
  .log-editor .n-map-container {
    height: 300px;
  }

  .log-editor .view-port .date-time {
    height: 350px;
    width: 100vw;
    max-width: 320px;
  }
</style>

{#if state.log}
  <NModal className="log-editor" fullscreen bodyClass="bg-bg">
    <div slot="header" class="w-100">
      <ToolbarGrid>
        <div slot="left">
          <Button
            icon
            className="tap-icon"
            on:click={() => {
              dispatch('close')
            }}>
            <Icon name="close" />
          </Button>
        </div>
        <div slot="main">
          <Text>{Lang.t('general.edit-log', 'Edit Record')}</Text>
        </div>
        <div slot="right">
          <Button type="clear" on:click={methods.save}>
            {Lang.t('general.save', 'Save')}
          </Button>
        </div>
      </ToolbarGrid>
    </div>

    <List transparent>
      <ListItem
        title="Location"
        className={toggleMap ? 'mt-3' : 'my-3'}
        on:click={selectLocation}>
        <div slot="right" class="flex">
          {#if state.log.lat}
            <Text size="sm">
              {state.log.location || `${math.round(state.log.lat, 100)},${math.round(state.log.lng, 100)}`}
            </Text>
          {:else}
            <Text size="sm">{Lang.t('general.select', 'Select')}</Text>
          {/if}
          <Icon icon={ChevronDown} size={16} className="ml-2" />
        </div>
      </ListItem>
      {#if toggleMap}
        <ListItem className="mb-3 p-0">
          <Map
            height="250"
            picker
            locations={state.log.lat ? [{ lat: state.log.lat, lng: state.log.lng, name: state.log.location }] : []}
            on:change={(event) => {
              state.log.lat = event.detail.lat
              state.log.lng = event.detail.lng
              state.log.location = event.detail.name
            }} />
        </ListItem>
      {/if}
      <ListItem className="my-3 py-0" title={Lang.t('general.end', 'End')}>
        <div slot="right">
          <DatePicker bind:time={state.log.end} />
        </div>
      </ListItem>
      <ListItem
        title={Lang.t('general.positivity', 'Positivity')}
        className="my-3">
        <div slot="right">
          <NPositivitySelector
            transparent
            size="md"
            score={state.log.score}
            on:change={(evt) => {
              state.log.score = evt.detail
            }} />
        </div>
      </ListItem>

      <ListItem className="my-3">
        <textarea
          class="form-control text-md"
          rows="5"
          bind:this={textarea}
          bind:value={state.log.note} />
        <AutoComplete
          scroller
          input={state.log.note}
          on:select={(evt) => {
            state.log.note = evt.detail.note
            textarea.focus()
            textarea.setSelectionRange(textarea.value.length, textarea.value.length)
          }} />
      </ListItem>

    </List>

    <!-- <div class="view-port">

      <div class="p-2" />

      {#if state.view == 'note'}

      {:else if state.view == 'where'}
        {#if state.log && state.mapReady}
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
        {#if $Locations.length}
          <ListItem compact clickable detail on:click={selectLocation} title={Lang.t('location.saved-locations', 'Saved Locations')}>
            <div slot="left">
              <Icon name="star" className="fill-orange" />
            </div>
          </ListItem>
        {/if}
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
    </div> -->

    <div class="buttons flex" slot="footer" />

  </NModal>
{/if}
