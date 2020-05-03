<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import math from "../../utils/math/math";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  let tag = "";
  $: if ($TrackerDesignerStore.tracker) {
    tag = $TrackerDesignerStore.tracker.toTag(
      $TrackerDesignerStore.tracker.label
    );
    if ($TrackerDesignerStore.tracker.emoji == "⚪️") {
      $TrackerDesignerStore.tracker.emoji = math.random(["💡", "🔥", "🧐"]);
    }
  }
</script>

<style lang="scss">
  input.input-emoji {
    font-size: 120px;
    max-width: 100px;
    min-width: 200px;
    width: 200px;
    height: 200px;
    border-radius: 100px !important;
    overflow: hidden;
    text-align: center;
  }
</style>

<div class="step emoji n-panel vertical center-all">
  <input
    type="input"
    on:focus={evt => {
      evt.target.select();
    }}
    bind:value={$TrackerDesignerStore.tracker.emoji}
    class="form-control input-lg input-emoji"
    placeholder="" />
  <NItem className="text-sm text-faded-3 compact text-center">
    Pick Tracker Emoji
  </NItem>
</div>
