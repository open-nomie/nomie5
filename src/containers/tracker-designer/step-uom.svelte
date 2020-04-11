<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";

  const groupedUOMs = NomieUOM.toGroupedArray();
  delete groupedUOMs.Timer;

  let tag = "";
  $: if ($TrackerDesignerStore.tracker) {
    tag = $TrackerDesignerStore.tracker.toTag(
      $TrackerDesignerStore.tracker.label
    );
  }
</script>

<div class="step label n-panel center-all vertical">
  <section class="container-xs">
    <NItem className="pad">
      <div class="title">Unit of Measure</div>
      <div class="note">
        How will {$TrackerDesignerStore.tracker.label} be measured?
      </div>
    </NItem>
    <NItem className="pad">
      {#if $TrackerDesignerStore.tracker.type !== 'timer' && $TrackerDesignerStore.tracker.type !== 'note' && $TrackerDesignerStore.tracker.type !== 'tick'}
        <NInput
          type="select"
          placeholder="Measurement"
          bind:value={$TrackerDesignerStore.tracker.uom}>
          {#each Object.keys(groupedUOMs) as groupKey (groupKey)}
            <option disabled>-- {groupKey}</option>
            {#each groupedUOMs[groupKey] as uom (`${groupKey}-${uom.key}`)}
              <option
                value={uom.key}
                disabled={uom.key == 'time' && $TrackerDesignerStore.tracker.type != 'timer'}>
                {NomieUOM.plural(uom.key)}
              </option>
            {/each}
          {/each}
        </NInput>
      {:else if $TrackerDesignerStore.tracker.type == 'timer'}
        <input type="form-control" disabled value="Time (hh:mm:ss)" />
      {:else if $TrackerDesignerStore.tracker.type == 'tick'}
        <input type="form-control" disabled value="Value of 1" />
      {:else if $TrackerDesignerStore.tracker.type == 'note'}
        <input type="form-control" disabled value="Multiple Trackers" />
      {/if}
    </NItem>
  </section>
</div>
