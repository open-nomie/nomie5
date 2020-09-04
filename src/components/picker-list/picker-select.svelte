<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import NItem from "../list-item/list-item.svelte";
  import NInput from "../input/input.svelte";
  import NIcon from "../icon/icon.svelte";
  import LabelMeta from "../label-meta/label-meta.svelte";

  import { TrackerStore } from "../../store/tracker-store";
  import type { ITracker } from "../../modules/tracker/tracker";

  const dispatch = createEventDispatcher();

  export let tracker: ITracker;

  let active = [];
  let activeValue;

  function toggle(pick) {
    if (active.indexOf(pick) > -1) {
      active = active.filter((p) => {
        return p !== pick;
      });
    } else {
      active.push(pick);
    }
    active = active;
    setTimeout(() => {
      try {
        document.activeElement.blur();
      } catch (e) {}
    }, 120);
    fireChange();
  }

  function add() {
    tracker.picks = tracker.picks || [];
    tracker.picks.push(`${activeValue}`);
    activeValue = null;
    TrackerStore.saveTracker(tracker);
    tracker.picks = tracker.picks;
  }

  function fireChange() {
    dispatch("change", active.join(" "));
  }

  function isHeader(pick) {
    let lastCharacter = pick.trim().substr(pick.trim().length - 1, 1);
    return lastCharacter === ":";
  }
</script>

<style lang="scss">
  .tracker-input.picker {
    width: 100%;
  }
</style>

<div class="tracker-input picker">
  <div class="n-list solo">
    {#each tracker.picks || [] as pick}
      {#if isHeader(pick)}
        <NItem className="item-divider compact">{pick.replace(' :', '')}</NItem>
      {:else}
        <NItem
          compact
          clickable
          className="bottom-line compact {active.indexOf(pick) > -1 ? 'bg-primary-bright' : ''}"
          on:click={() => {
            toggle(pick);
          }}>
          <LabelMeta str={pick} titleClass={active.indexOf(pick) > -1 ? 'text-white' : ''} />
          <button class="btn btn-clear" slot="right">
            {#if active.indexOf(pick) > -1}
              <NIcon name="radioFilled" className="fill-white" />
            {:else}
              <NIcon name="radio" className="fill-primary-bright" />
            {/if}
          </button>
        </NItem>
      {/if}
    {/each}
    <!-- <NItem>
      <NInput on:enter={add} compact placeholder="Add an Item" bind:value={activeValue}>
        <button slot="right" class="btn btn-clear" on:click={add}>
          <NIcon name="addOutline" />
        </button>
      </NInput>
    </NItem> -->
    <div class="n-row">
      <slot name="bottom" />
    </div>
  </div>
  <!-- <div class="value">{tempValue}</div>
  <input
    type="range"
    bind:value={tempValue}
    {min}
    {max}
    on:change={() => {
      dispatch('change', parseInt(tempValue));
    }} /> -->

</div>