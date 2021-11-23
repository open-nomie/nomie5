<script>
  /**
   * Tracker Input Mege Component
   * This is a beast... Brace yourself.
   * Officialy "walk through" - Nov 2 2019
   */

  // svelte
  import { createEventDispatcher, onMount } from 'svelte'
  import { slide } from 'svelte/transition'
  import _ from 'lodash'
  // Components
  import NModal from '../../../components/modal/modal.svelte'
  import NIcon from '../../../components/icon/icon.svelte'

  //Container for Slider (range), Keypad and Timer
  import SliderInput from './slider.svelte'
  import PickerInput from './picker.svelte'
  import NTimer from './timer.svelte'
  import NCalculator from '../../../components/calculator/calculator-v2.svelte'

  // Utils
  import NomieUOM from '../../../utils/nomie-uom/nomie-uom'

  // Stores
  import { TrackerStore } from '../../../store/tracker-store'
  import { Interact } from '../../../store/interact'
  import { Lang } from '../../../store/lang'
  import Icon from '../../../components/icon/icon.svelte'
  import Button from '../../../components/button/button.svelte'
  import dayjs from 'dayjs'
  import Modal2 from '../../../components/modal/modal2.svelte'
  import Panel from '../../../components/panel/panel.svelte'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'

  // Props
  export let tracker = undefined // You can provide a tracker
  export let show = undefined // If it should show or not
  export let value = undefined // If a valid is provided
  export let hideAdd = undefined // If the Add button should be hidden
  export let saveLabel = Lang.t('general.save', 'Save') // The label of the save Button

  // Consts
  const dispatch = createEventDispatcher() // Setup the dispatcher

  let data = {
    value: null, // holds current value
    tracker: null, // holds current tracker
    ready: false,
    suffix: '',
    calcUsed: false, // when it's ready
    editing: false,
    saving: false,
  }

  // Set up the Methodsx
  const methods = {
    // When the Save is hit
    onSave() {
      // Dispatch value and tracker
      if (!data.saving) {
        data.saving = true
        dispatch('save', {
          value: data.value,
          tracker: tracker,
          suffix: data.suffix,
        })
      }
    },
    // When Add is hit
    onAdd() {
      // Dispatch add
      dispatch('add', {
        value: data.value,
        tracker: tracker,
        suffix: data.suffix,
      })
    },
    onCancel() {
      if (!$Interact.trackerInput.allowSave) {
        dispatch('cancelAll')
      } else {
        dispatch('cancel')
      }
    },
    // When the user starts the time
    startTimer() {
      // Set the date to epoch time (best to avoid timezones);
      let startingDate = dayjs().subtract(data.value, 'second')
      data.tracker.started = startingDate.toDate().getTime()
      // Start the Timer for this tracker
      TrackerStore.startfTimer(data.tracker)
      methods.onCancel()
    },
    // Stop the Timer
    stopTimer() {
      // Get the Seconds between now and when the tracker started
      if (data.tracker.started) {
        data.value = (new Date().getTime() - tracker.started) / 1000
        // Clear local
        data.tracker.started = null
        // tell store to stop timer
        TrackerStore.stopTimer(data.tracker)
      }
    },
  }

  // If Tracker Changes
  // FIres each time something happens to this object
  $: if (tracker && data.tracker && data.tracker !== tracker) {
    // Set to local variable
    setTimeout(() => {
      // Set to not ready and the new tracker
      data.ready = true // TODO: make this lack janky
      data.tracker = tracker
      data.value = tracker.default || 0
      data.ready = true
      data.suffix = ''
    }, 1)
  }

  function editTracker() {
    TrackerStore.trackerOptions(tracker, {
      click() {
        Interact.dismissTrackerInput()
      },
    })
    // Interact.editTracker(tracker);
  }

  // When Component Mounts
  onMount(() => {
    // If the value changes, and no data.value exists.
    if (value && !data.value) {
      data.value = value
    } else {
      data.value = tracker.default || 0
      value = data.value
    }
    data.tracker = tracker
    setTimeout(() => {
      data.ready = true
    }, 12)
  })
</script>

<style global lang="postcss">
  .tracker-input .input-model {
    @apply h-full;
  }
  .tracker-input {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    flex-grow: 1;
    height: 100%;
  }
  .tracker-input .btn.w-25 {
    width: 30% !important;
  }
  .tracker-input .btn.w-25:first-child {
    margin-right: 10px;
  }
  .tracker-input .footer .btn {
    border-radius: 50px;
  }
  .tracker-input .edit-toggle {
    position: fixed;
    top: 20px;
    z-index: 1000;
  }
</style>

<Modal2
  id="tracker-input"
  visible={show || $Interact.trackerInput.show}
  className="tracker-input">
  <Panel>
    <header slot="header">
      <ToolbarGrid>
        <span class="animate up text-md {data.ready ? 'visible' : 'hidden'}">
          <span style="color:{tracker.color}" class="mr-1">
            {tracker.emoji}
          </span>
          {tracker.label}
        </span>
        <div slot="right">
          <Button icon on:click={editTracker}>
            <NIcon name="more" size={26} className="fill-primary-bright" />
          </Button>
        </div>
      </ToolbarGrid>
    </header>

    <main class="flex flex-col h-full border border-green-600">

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
                data.value = value.detail
              }} />
          {:else if tracker.type === 'picker'}
            <PickerInput
              {tracker}
              on:enterEdit={(evt) => {
                data.editing = true
              }}
              on:enterView={() => {
                data.editing = false
              }}
              on:change={(evt) => {
                data.suffix = evt.detail.join(' ')
              }} />
          {:else if tracker.type === 'value' || tracker.type === 'tick'}
            <div id="keypad-holder">
              <NCalculator
                {value}
                displayFormat={(input) => {
                  return tracker.displayValue(input || '')
                }}
                on:change={(changedValue) => {
                  data.value = changedValue.detail
                  data = data
                }} />
            </div>
          {:else if tracker.type === 'timer'}
            <NTimer
              tracker={data.tracker}
              bind:value={data.value}
              on:forceStart={methods.startTimer}
              on:change={(event) => {
                data.value = event.detail
              }} />
          {:else}
            <div id="keypad-holder">
              <NCalculator
                {value}
                displayFormat={(input) => {
                  return tracker.displayValue(input || '')
                }}
                on:change={(value) => {
                  data.value = value.detail
                }} />
            </div>
          {/if}
        </div>
      {/if}

    </main>

    <footer class="px-4 py-2" slot="footer">

      {#if data.tracker}
        <ToolbarGrid>
          <div slot="left" class="pr-2">
            <button
              class="text-lg text-primary-500"
              on:click={() => {
                methods.onCancel()
              }}>
              {Lang.t('general.close', 'Close')}
            </button>
          </div>
          <!-- end left toolbar -->

          <div class="w-full px-2">
            {#if !data.editing && !data.saving}
              {#if (data.tracker.type == 'timer' && data.value && $Interact.trackerInput.allowSave !== false) || (data.tracker.type != 'timer' && $Interact.trackerInput.allowSave !== false)}
                <Button
                  size="lg"
                  shape="round"
                  block
                  style="max-width:230px"
                  on:click={methods.onSave}
                  className="text-white flex-grow flex-shrink w-full"
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
                  <Icon name="stop" size={32} className="fill-white" />
                </Button>
              {/if}
            {/if}
          </div>
          <!-- end main toolbar-grid-->

          <div slot="right">

            {#if (data.tracker.type !== 'timer' || data.value) && hideAdd !== true && !data.editing}
              <button
                title="Add this to the note without immediately saving."
                class="text-lg text-primary-500 {tracker.started ? 'hidden' : ''}"
                on:click={methods.onAdd}>
                {#if !$Interact.trackerInput.allowSave}
                  {Lang.t('general.next', 'Next')}
                {:else}{Lang.t('general.add', 'Add')}{/if}
              </button>
            {/if}
          </div>
        </ToolbarGrid>
        <!-- end toolbar-grid right -->
      {/if}

    </footer>

  </Panel>

  <!-- <div
    class="w-25 btn btn-clear {tracker.started ? 'd-inline-block' : 'd-none'}" /> -->
</Modal2>
