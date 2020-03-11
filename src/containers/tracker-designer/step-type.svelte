<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import math from "../../utils/math/math";
  import TrackerTypes from "../../modules/tracker-types/tracker-types";
  import NItem from "../../components/list-item/list-item.svelte";

  const types = Object.keys(TrackerTypes).map(key => {
    let type = TrackerTypes[key];
    type._key = key;
    return type;
  });

  const selectType = type => {
    $TrackerDesignerStore.tracker.type = type._key;
  };
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
  <NItem class="mb-3">
    What type of data are we collecting for {$TrackerDesignerStore.tracker.label}?
  </NItem>
  <div class="n-list">
    {#each types as type}
      <NItem
        className="clickable"
        on:click={() => {
          selectType(type);
        }}>
        <div slot="left">
          {#if $TrackerDesignerStore.tracker.type == type._key}
            <span class="text-lg zmdi zmdi-dot-circle text-primary" />
          {:else}
            <span class="text-lg zmdi zmdi-circle-o" />
          {/if}
        </div>
        <div class="title">{type.label}</div>
        <div class="description">{type.description}</div>
      </NItem>
    {/each}
  </div>
</div>
