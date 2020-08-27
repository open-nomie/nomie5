<script lang="ts">
  import Text from "../../components/text/text.svelte";

  import { TrackerDesignerStore } from "./tracker-designer-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  import { Lang } from "../../store/lang";
  let tag = "";
  $: if ($TrackerDesignerStore.tracker) {
    tag = $TrackerDesignerStore.tracker.toTag($TrackerDesignerStore.tracker.label);
    $TrackerDesignerStore.tracker.tag = tag;
  }
</script>

<div class="step label n-panel center-all vertical">
  <section class="container-xs">
    <NItem title="What should we call this tracker?" className="bg-transparent text-center py-0" />
    <NItem className="bg-transparent py-0">
      <NInput type="text" bind:value={$TrackerDesignerStore.tracker.label} placeholder="Tracker Label" label="Tracker Label" />
    </NItem>
    <NItem compact className="py-1 text-xs bg-transparent text-center">Examples: Water, Walked, Sleep, Angry, Mood</NItem>

    {#if $TrackerDesignerStore.tracker.tag.length}
      <NItem className="bg-transparent">
        {Lang.t('tracker.tag', 'Hashtag')}:
        <span class="text-primary">#{tag}</span>
        <Text size="xs" faded>
          {Lang.t('tracker.tag_description', 'This will be the trackers hashtag. Note: once set its hard to undo, so make sure you like it!')}
        </Text>
      </NItem>
    {/if}
  </section>
</div>
