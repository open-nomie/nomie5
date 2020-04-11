<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import trackerTypes from "../../modules/tracker-types/tracker-types";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";

  const getTrackerInput = async target => {
    const response = await Interact.trackerInput(
      $TrackerDesignerStore.tracker,
      { value: $TrackerDesignerStore.tracker.default, allowSave: false }
    );
    if (response && response.value) {
      $TrackerDesignerStore.tracker[target] = response.value;
    }
  };
</script>

<div
  class="step label n-panel vertical scroll-y {$TrackerDesignerStore.tracker.type == 'range' ? '' : 'center-all'}">
  <section class="container-xs">

    {#if ['tick', 'note'].indexOf($TrackerDesignerStore.tracker.type) == -1}
      <NItem>
        <div class="title text-md flex-grow w-100">
          Default
          {#if $TrackerDesignerStore.tracker.default}
            <span class="text-faded">
              {$TrackerDesignerStore.tracker.displayValue($TrackerDesignerStore.tracker.default)}
            </span>
          {/if}
        </div>
        <div slot="right">
          <NInput
            type="number"
            pattern="[0-9\.\-]"
            bind:value={$TrackerDesignerStore.tracker.default}
            placeholder="Default Value">
            <button
              class="btn btn-icon clickable mr-2"
              slot="right"
              on:click={() => {
                getTrackerInput('default');
              }}>
              <NIcon name="addOutline" class="fill-primary-bright" />
            </button>
          </NInput>
        </div>
      </NItem>
    {/if}

    {#if $TrackerDesignerStore.tracker.type == 'note'}
      <NItem>
        <textarea
          bind:value={$TrackerDesignerStore.tracker.note}
          placeholder={Lang.t('tracker.note-placeholder')}
          class="form-control w-100 mt-2" />
      </NItem>
      <NItem description={Lang.t('tracker.note-description')} />
    {/if}

    {#if $TrackerDesignerStore.tracker.type == 'tick'}
      <NItem>
        <div class="content">
          <div class="title text-md">
            {Lang.t('tracker.save-on-tap', 'Save on Tap')}
          </div>
          <div class="note">
            Automatically saves the tracker note when tapped
          </div>
        </div>
        <div slot="right">
          <NToggle bind:value={$TrackerDesignerStore.tracker.one_tap} />
        </div>
      </NItem>
    {/if}
    {#if $TrackerDesignerStore.tracker.type == 'range'}
      <hr class="my-0" />
      <NItem>
        <span class="title">Min</span>
        <div slot="right">
          <NInput
            type="number"
            pattern="[0-9\.\-]"
            bind:value={$TrackerDesignerStore.tracker.min}
            placeholder="Min Value">
            <button
              class="btn btn-icon clickable mr-2"
              slot="right"
              on:click={() => {
                getTrackerInput('min');
              }}>
              <NIcon name="addOutline" class="fill-primary-bright" />
            </button>
          </NInput>
        </div>
      </NItem>

      <NItem>
        <span class="title">Max</span>
        <div slot="right">
          <NInput
            type="number"
            pattern="[0-9\.\-]"
            bind:value={$TrackerDesignerStore.tracker.max}
            placeholder="Max Value">
            <button
              class="btn btn-icon clickable mr-2"
              slot="right"
              on:click={() => {
                getTrackerInput('max');
              }}>
              <NIcon name="addOutline" class="fill-primary-bright" />
            </button>
          </NInput>
        </div>
      </NItem>
    {/if}
  </section>
</div>
