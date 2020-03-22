<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import math from "../../utils/math/math";
  import TrackerTypes from "../../modules/tracker-types/tracker-types";
  import NItem from "../../components/list-item/list-item.svelte";

  const types = [
    {
      id: "sum",
      label: "Sum",
      description: "Sum daily totals. Good for temps, water, distance"
    },
    {
      id: "mean",
      label: "Average",
      description: "Average daily totals. Good for mood, stress, feelings"
    }
  ];

  const selectType = type => {
    $TrackerDesignerStore.tracker.math = type.id;
  };
</script>

<div class="step emoji n-panel vertical center-all">
  <section class="container-xs">
    <div class="n-list">
      {#each types as type}
        <NItem
          className="clickable {$TrackerDesignerStore.tracker.math == type.id ? 'active' : ''}}"
          on:click={() => {
            selectType(type);
          }}>
          <div slot="left">
            {#if $TrackerDesignerStore.tracker.math == type.id}
              <span class="text-lg zmdi zmdi-dot-circle text-primary" />
            {:else}
              <span class="text-lg zmdi zmdi-circle-o" />
            {/if}
          </div>
          <div
            class={`title text-md ${$TrackerDesignerStore.tracker.math == type.id ? 'font-weight-bold' : ''}`}>
            {type.label}
          </div>
          <div class="description text-sm text-faded-3">{type.description}</div>
        </NItem>
      {/each}
    </div>
  </section>
</div>
