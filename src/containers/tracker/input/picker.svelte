<script>
  import { createEventDispatcher } from "svelte";
  import NItem from "../../../components/list-item/list-item.svelte";
  import NIcon from "../../../components/icon/icon.svelte";
  import LabelMeta from "../../../components/label-meta/label-meta.svelte";
  const dispatch = createEventDispatcher();

  export let tracker;
  let active = [];

  function toggle(pick) {
    if (active.indexOf(pick) > -1) {
      active = active.filter(p => {
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

  function fireChange() {
    dispatch("change", active.join(" "));
  }
</script>

<style lang="scss">
  @import "../../../scss/vendor/bootstrap/base";
  .tracker-input.picker {
    width: 100%;
  }
</style>

<div class="tracker-input picker">
  <div class="n-list solo">
    {#each tracker.picks as pick}
      <NItem
        clickable
        className="py-2 bottom-line"
        on:click={() => {
          toggle(pick);
        }}>
        <div slot="left">
          {#if active.indexOf(pick) > -1}
            <NIcon name="checkmark" />
          {/if}
        </div>
        <LabelMeta
          str={pick}
          titleClass={active.indexOf(pick) > -1 ? 'text-primary-bright' : ''} />
        <button class="btn btn-clear" slot="right">
          {#if active.indexOf(pick) > -1}
            <NIcon name="radioFilled" className="fill-primary-bright" />
          {:else}
            <NIcon name="radio" className="fill-primary-bright" />
          {/if}
        </button>
      </NItem>
    {/each}
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
