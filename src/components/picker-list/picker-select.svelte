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

  export let active = [];
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
  <div class="n-list">
    {#each tracker.picks || [] as pick}
      {#if isHeader(pick)}
        <NItem className="item-divider compact">{pick.replace(' :', '')}</NItem>
      {:else}
        <NItem
          compact
          clickable
          className="px-3 compact {active.indexOf(pick) > -1 ? 'bg-solid-1' : ''}"
          on:click={() => {
            toggle(pick);
          }}>
          <LabelMeta str={pick} titleClass={active.indexOf(pick) > -1 ? 'text-primary-bright' : 'text-inverse'} />
          <div slot="right">
            {#if active.indexOf(pick) > -1}
              <div class="badge badge-primary">
                <NIcon name="checkmark" className="fill-white" size="16" />
              </div>
            {/if}
          </div>
        </NItem>
        <hr class="divider center" />
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
