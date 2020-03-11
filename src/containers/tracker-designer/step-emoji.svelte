<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import math from "../../utils/math/math";
  import NItem from "../../components/list-item/list-item.svelte";

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
    font-size: 66px;
    background-color: #555;
    color: #fff;
    border-radius: 1.2rem;
    text-align: center;
  }
</style>

<div class="step emoji">
  <NItem class="text-bold">
    Pick {$TrackerDesignerStore.tracker.label}'s Emoji
  </NItem>
  <NItem>
    <input
      type="input"
      on:focus={evt => {
        evt.target.select();
      }}
      bind:value={$TrackerDesignerStore.tracker.emoji}
      class="form-control input-lg input-emoji"
      placeholder="" />
  </NItem>
</div>
