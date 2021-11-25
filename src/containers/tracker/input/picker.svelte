<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Button from '../../../components/button/button.svelte'
  import Icon from '../../../components/icon/icon.svelte'
  import PickerListEditor from '../../../components/picker-list/picker-editor.svelte'
  import PickerSelect from '../../../components/picker-list/picker-select.svelte'
  import type TrackerConfig from '../../../modules/tracker/tracker'
  import { TrackerStore } from '../../../store/tracker-store'

  const dispatch = createEventDispatcher()

  export let tracker: TrackerConfig

  let selected = []
  let mode: 'view' | 'edit' = 'view'

  function fireChange(evt) {
    dispatch('change', evt.detail)
  }

  function toggleMode() {
    if (mode === 'edit') {
      TrackerStore.saveTracker(tracker)
      mode = 'view'
      dispatch('enterView')
    } else {
      dispatch('enterEdit')
      mode = 'edit'
    }
  }
</script>

<style lang="postcss" global>
  .tracker-input.picker {
    width: 100%;
    justify-content: center;
    align-items: flex-start;
    position: relative;
  }
  .picker-toggle {
    position: absolute !important;
    top: 10px;
    left: 10px;
    z-index: 2000;
  }
</style>

<div class="">
  <Button
    shape="circle"
    color={mode == 'view' ? 'clear' : 'green'}
    className="picker-toggle {mode == 'view' ? '' : ''}"
    on:click={toggleMode}>
    {#if mode == 'view'}
      <Icon name="edit" size={16} />
    {:else}
      <Icon name="checkmark" size={16} />
    {/if}
  </Button>
  {#if mode == 'edit'}
    <PickerListEditor
      className="mx-3 mt-3"
      list={tracker.picks}
      on:change={(evt) => {
        tracker.picks = evt.detail
      }}
      showHeaderContent={false} />
  {:else}
    <PickerSelect {tracker} active={selected} on:change={fireChange} />
  {/if}

</div>
