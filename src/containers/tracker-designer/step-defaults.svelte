<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import trackerTypes from "../../modules/tracker-types/tracker-types";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";
  import PickerList from "../../components/picker-list/picker-list.svelte";

  const getTrackerInput = async (target) => {
    const response = await Interact.trackerInput($TrackerDesignerStore.tracker, {
      value: $TrackerDesignerStore.tracker.default,
      allowSave: false,
    });
    if (response && response.value) {
      $TrackerDesignerStore.tracker[target] = response.value;
    }
  };
</script>

<div class="step label n-panel vertical scroll-y {$TrackerDesignerStore.tracker.type == 'range' ? '' : 'center-all'}">
  <section class="container-xs">

    {#if ['tick', 'note', 'picker'].indexOf($TrackerDesignerStore.tracker.type) == -1}
      <NItem title="Want to set a default value?" className="bg-transparent text-center py-0" />
      <NItem className="bg-transparent">
        <NInput type="number" pattern="[0-9\.\-]" bind:value={$TrackerDesignerStore.tracker.default} placeholder="Default Value ">
          <div slot="right" class="text-faded-2 text-sm text-right">
            {$TrackerDesignerStore.tracker.default ? $TrackerDesignerStore.tracker.displayValue($TrackerDesignerStore.tracker.default) : ''}
          </div>
          <button
            class="btn btn-icon clickable mr-2"
            slot="right"
            on:click={() => {
              getTrackerInput('default');
            }}>
            <NIcon name="addOutline" />
          </button>
        </NInput>

      </NItem>
    {/if}

    {#if $TrackerDesignerStore.tracker.type == 'picker'}
      <PickerList bind:list={$TrackerDesignerStore.tracker.picks} on:change={(evt) => {}} />
    {/if}

    {#if $TrackerDesignerStore.tracker.type == 'note'}
      <NItem className="bg-transparent">
        <textarea
          bind:value={$TrackerDesignerStore.tracker.note}
          placeholder={Lang.t('tracker.note-placeholder')}
          class="form-control w-100 mt-2" />
      </NItem>
      <NItem className="bg-transparent" description={Lang.t('tracker.note-description')} />
    {/if}

    {#if $TrackerDesignerStore.tracker.type == 'tick'}
      <NItem
        className="bg-transparent"
        title={Lang.t('tracker.save-on-tap', 'Save on Tap')}
        description="Automatically save this tracker when it's tapped?">
        <div slot="right">
          <NToggle bind:value={$TrackerDesignerStore.tracker.one_tap} />
        </div>
      </NItem>
    {/if}
    {#if $TrackerDesignerStore.tracker.type == 'range'}
      <hr class="my-0" />
      <NItem className="bg-transparent">
        <NInput type="number" pattern="[0-9\.\-]" bind:value={$TrackerDesignerStore.tracker.min} placeholder="Min Value">
          <div slot="right" class="text-faded-2 text-sm text-right">
            {$TrackerDesignerStore.tracker.min ? $TrackerDesignerStore.tracker.displayValue($TrackerDesignerStore.tracker.min) : ''}
          </div>
          <button
            class="btn btn-icon clickable mr-2"
            slot="right"
            on:click={() => {
              getTrackerInput('min');
            }}>
            <NIcon name="addOutline" />
          </button>
        </NInput>
        <NInput type="number" pattern="[0-9\.\-]" bind:value={$TrackerDesignerStore.tracker.max} placeholder="Max Value">
          <div slot="right" class="text-faded-2 text-sm text-right">
            {$TrackerDesignerStore.tracker.max ? $TrackerDesignerStore.tracker.displayValue($TrackerDesignerStore.tracker.max) : ''}
          </div>
          <button
            class="btn btn-icon clickable mr-2"
            slot="right"
            on:click={() => {
              getTrackerInput('max');
            }}>
            <NIcon name="addOutline" />
          </button>
        </NInput>
      </NItem>
    {/if}
  </section>
</div>
