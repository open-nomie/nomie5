<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import trackerTypes from "../../modules/tracker-types/tracker-types";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";

  const getTrackerInput = async target => {
    const response = await Interact.trackerInput(
      $TrackerDesignerStore.tracker,
      { value: $TrackerDesignerStore.tracker.default, allowSave: false }
    );
    console.log("Got input from tracker", response);
    if (response.value) {
      $TrackerDesignerStore.tracker.default = response.value;
    }
  };
</script>

<div
  class="step label n-panel vertical scroll-y {$TrackerDesignerStore.tracker.type == 'range' ? '' : 'center-all'}">
  <section class="container-xs">

    {#if ['tick', 'note'].indexOf($TrackerDesignerStore.tracker.type) == -1}
      <NItem>
        <span class="title text-md">Default Value</span>
        <div class="n-row" slot="right">
          <span class="text-faded-3 mr-2">
            {$TrackerDesignerStore.tracker.displayValue($TrackerDesignerStore.tracker.default)}
          </span>
          <input
            style="min-width:100px; max-width:100px; text-align:center"
            type="number"
            pattern="[0-9\.\-]"
            on:click={() => {
              getTrackerInput('default');
            }}
            bind:value={$TrackerDesignerStore.tracker.default}
            class="form-control input-lg pl-1"
            placeholder="Default" />
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

        <input
          slot="right"
          style="min-width:100px; max-width:100px; text-align:center"
          type="number"
          pattern="[0-9\.\-]"
          bind:value={$TrackerDesignerStore.tracker.min}
          class="form-control input-lg pl-1"
          placeholder="Value" />

      </NItem>

      <NItem>
        <span class="title">Max</span>

        <input
          slot="right"
          style="min-width:100px; max-width:100px; text-align:center"
          type="number"
          pattern="[0-9\.\-]"
          bind:value={$TrackerDesignerStore.tracker.max}
          class="form-control input-lg pl-1"
          placeholder="Value" />

      </NItem>
    {/if}
  </section>
</div>
