<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "../../../components/button/button.svelte";
  import Icon from "../../../components/icon/icon.svelte";
  import PickerListEditor from "../../../components/picker-list/picker-editor.svelte";
  import PickerSelect from "../../../components/picker-list/picker-select.svelte";
  import type TrackerConfig from "../../../modules/tracker/tracker";
  import { Lang } from "../../../store/lang";
  import { TrackerStore } from "../../../store/tracker-store";

  const dispatch = createEventDispatcher();

  export let tracker: TrackerConfig;

  let selected = [];
  let mode: "view" | "edit" = "view";

  function fireChange(evt) {
    dispatch("change", evt.detail);
  }

  function toggleMode() {
    if (mode === "edit") {
      TrackerStore.saveTracker(tracker);
      mode = "view";
      dispatch("enterView");
    } else {
      dispatch("enterEdit");
      mode = "edit";
    }
  }
</script>

<style lang="scss">
  .tracker-input.picker {
    width: 100%;
    justify-content: center;
    align-items: flex-start;
    position: relative;
  }
  :global(.picker-toggle) {
    position: absolute !important;
    top: 10px;
    right: 10px;
    z-index: 2000;
  }
</style>

<div class="tracker-input picker">
  <Button shape="circle" color={mode == 'view' ? 'primary' : 'green'} className="picker-toggle" on:click={toggleMode}>
    {#if mode == 'view'}
      <Icon name="edit" size="16" />
    {:else}
      <Icon name="checkmark" size="16" />
    {/if}
  </Button>
  {#if mode == 'edit'}
    <PickerListEditor
      className="mx-3 mt-3"
      list={tracker.picks}
      on:change={(evt) => {
        tracker.picks = evt.detail;
      }}
      showHeaderContent={false} />
  {:else}
    <PickerSelect {tracker} active={selected} on:change={fireChange} />
  {/if}

</div>
