<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  let tag = "";
  $: if ($TrackerDesignerStore.tracker) {
    tag = $TrackerDesignerStore.tracker.toTag(
      $TrackerDesignerStore.tracker.label
    );
    $TrackerDesignerStore.tracker.tag = tag;
  }
</script>

<div class="step label n-panel center-all vertical">
  <section class="container-xs">

    <NItem className="py-2">
      <NInput
        type="text"
        bind:value={$TrackerDesignerStore.tracker.label}
        placeholder="Tracker Label"
        label="Tracker Label"
        help="e.g. Water, Walked, Sleep, Angry, Mood." />
    </NItem>

    {#if $TrackerDesignerStore.tracker.tag.length}
      <NItem class="tag m-4">
        <div class="text-lg text-primary text-center">#{tag}</div>
      </NItem>
    {/if}
  </section>
</div>
