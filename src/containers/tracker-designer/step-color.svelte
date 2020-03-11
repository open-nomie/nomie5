<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import math from "../../utils/math/math";
  import ColorPicker from "../../components/color-picker/color-picker.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
</script>

<style lang="scss">
  :global(.color-grid .color-btn) {
    margin: 4px;
  }
</style>

<div class="step emoji app-panel">
  <NItem class="mb-3">Pick a Color for this Tracker</NItem>
  <div class="n-list color-grid app-panel scroll-y">
    <ColorPicker grid={true} bind:value={$TrackerDesignerStore.tracker.color} />
  </div>
</div>
