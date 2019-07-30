<script>
  // components
  import NText from "../../../components/text/text.svelte";
  import NModal from "../../../components/modal/modal.svelte";
  import NItem from "../../../components/list-item/list-item.svelte";

  //Utils
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  // Stores
  import { TrackerStore } from "../../../store/trackers";

  // Props
  export let show = false;
  export let multiple = false;

  // Consts
  const dispatch = createEventDispatcher();

  // State
  let data = {
    selected: {},
    trackers: [],
    alphaGroup: {}
  };

  $: data.trackers = Object.keys($TrackerStore || {})
    .map(tag => {
      return $TrackerStore[tag];
    })
    .sort((a, b) => {
      return a.label < b.label ? -1 : 1;
    });

  $: data.selectedArray = Object.keys(data.selected).map(tag => {
    return data.selected[tag];
  });

  // Methods
  const methods = {
    toggle(tracker) {
      if (data.selected.hasOwnProperty(tracker.tag)) {
        delete data.selected[tracker.tag];
        data = data;
      } else {
        data.selected[tracker.tag] = tracker;
      }
    },
    alphaGroupExists(tracker) {
      if (data.trackers.length > 10) {
        let alpha = tracker.label.substr(0, 1).toLowerCase();

        if (data.alphaGroup.hasOwnProperty(alpha)) {
          return true;
        } else {
          data.alphaGroup[alpha] = true;
          return false;
        }
      } else {
        return true;
      }
    }
  };
</script>

<style lang="scss">

</style>

{#if show}
  <NModal title="Tracker Selector" allowClose={true}>
    <div class="list">
      {#each data.trackers as tracker (tracker.tag)}
        <!-- {#if !methods.alphaGroupExists(tracker)}
          <NItem
            className="bg-light text-faded"
            title={tracker.label.substr(0, 1).toUpperCase()} />
        {/if} -->
        <NItem
          borderBottom
          className={data.selected.hasOwnProperty(tracker.tag) ? 'bg-selected' : ''}
          title={tracker.label}
          on:click={() => {
            methods.toggle(tracker);
          }}>
          <span slot="left">
            <NText size="lg">{tracker.emoji}</NText>
          </span>
          <span slot="right">
            {#if data.selected.hasOwnProperty(tracker.tag)}
              <i class="zmdi zmdi-check-circle text-primary" />
            {/if}
          </span>
        </NItem>
      {/each}
    </div>
    <div slot="footer" class="n-row">
      <button
        class="btn btn-light btn-lg w-100 mr-2"
        on:click={() => {
          dispatch('cancel');
        }}>
        Close
      </button>
      {#if data.selectedArray.length > 0}
        <button
          transition:fade
          class="btn btn-primary btn-lg w-100"
          on:click={() => {
            dispatch('select', data.selectedArray);
          }}>
          Select
        </button>
      {/if}
    </div>
  </NModal>
{/if}
