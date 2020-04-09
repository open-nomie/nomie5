<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import math from "../../utils/math/math";
  import TrackerTypes from "../../modules/tracker-types/tracker-types";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";

  const types = Object.keys(TrackerTypes).map(key => {
    let type = TrackerTypes[key];
    type._key = key;
    return type;
  });

  const selectType = type => {
    $TrackerDesignerStore.tracker.type = type._key;
    if (type._key == "timer") {
      $TrackerDesignerStore.tracker.uom = "timer";
    } else {
      $TrackerDesignerStore.tracker.uom = "num";
    }
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

<div class="step emoji n-panel vertical scroll-y">
  <section class="container-xs">

    <div class="n-list">
      {#each types as type}
        <NItem
          className="clickable {$TrackerDesignerStore.tracker.type == type._key ? 'active' : ''}}"
          on:click={() => {
            selectType(type);
          }}>
          <div slot="left">
            {#if $TrackerDesignerStore.tracker.type == type._key}
              <NIcon name="radioFilled" />
            {:else}
              <NIcon name="radio" />
            {/if}
          </div>
          <div
            class={`title text-md ${$TrackerDesignerStore.tracker.type == type._key ? 'font-weight-bold' : ''}`}>
            {type.label}
          </div>
          <div class="description text-sm text-faded-3">{type.description}</div>
        </NItem>
      {/each}
    </div>
  </section>
</div>
