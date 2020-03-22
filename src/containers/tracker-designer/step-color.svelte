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

<div
  class="step emoji n-panel vertical color-grid n-panel scroll-y
  center-horizontal">

  <div class="container-sm">
    <ColorPicker grid={true} bind:value={$TrackerDesignerStore.tracker.color} />
  </div>

</div>
