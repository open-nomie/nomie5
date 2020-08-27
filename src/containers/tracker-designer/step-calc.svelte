<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import math from "../../utils/math/math";
  import TrackerTypes from "../../modules/tracker-types/tracker-types";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";

  const types = [
    {
      id: "sum",
      label: "Sum",
      description: "Add totals together. Good for water, distances, sleep, walking",
    },
    {
      id: "mean",
      label: "Average",
      description: "Average daily totals. Good for mood, stress, feelings, temp",
    },
  ];

  const selectType = (type) => {
    $TrackerDesignerStore.tracker.math = type.id;
  };
</script>

<div class="step emoji n-panel vertical center-all">
  <section class="container-xs">
    <NItem title="How should we calculate totals for the day, week and month?" className="bg-transparent text-center" />
    <div class="n-list bg-transparent">
      {#each types as type}
        <NItem
          clickable
          className={$TrackerDesignerStore.tracker.math == type.id ? 'active solo text-primary-bright' : 'bg-transparent'}
          on:click={() => {
            selectType(type);
          }}>
          <div slot="left">
            {#if $TrackerDesignerStore.tracker.math == type.id}
              <NIcon name="radioFilled" />
            {:else}
              <NIcon name="radio" />
            {/if}
          </div>
          <div class={`title text-md ${$TrackerDesignerStore.tracker.math == type.id ? 'font-weight-bold' : ''}`}>{type.label}</div>
          <div class="description text-sm text-faded-3">{type.description}</div>
        </NItem>
      {/each}
    </div>
  </section>
</div>
