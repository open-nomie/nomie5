<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import NItem from "../../components/list-item/list-item.svelte";
  let tag = "";
  $: if ($TrackerDesignerStore.tracker) {
    tag = $TrackerDesignerStore.tracker.toTag(
      $TrackerDesignerStore.tracker.label
    );
  }
</script>

<div class="step label">
  <NItem class="mb-3">Hello, let's make something to track.</NItem>
  <NItem>
    <input
      type="input"
      bind:value={$TrackerDesignerStore.tracker.label}
      class="form-control input-lg"
      placeholder="What's a good label?" />
  </NItem>
  <NItem className="text-sm mt-2 text-faded-3">
    Examples: Water, Walked, Sleep, Angry, Beer
  </NItem>

  {#if tag.length}
    <NItem class="tag mt-4">
      <div>
        <div class="text-lg text-primary text-center">#{tag}</div>
        <div class="text-sm text-faded-3">
          When writing a note, you can use #{tag} to add the tracker.
        </div>
      </div>
    </NItem>
  {/if}

</div>
