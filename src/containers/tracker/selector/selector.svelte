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
  import { Lang } from "../../../store/lang";

  // Props
  export let show = false;
  // export let multiple = false;

  // Consts
  const dispatch = createEventDispatcher();

  // State
  let data = {
    selected: {},
    trackers: []
  };

  // Holder of the alphabet for the list
  let alphaGroup = {};

  // When tracker store loads. Turn trackers into array sorted by label
  $: data.trackers = Object.keys($TrackerStore || {})
    .map(tag => {
      return $TrackerStore[tag];
    })
    .sort((a, b) => {
      return a.label.substr(0, 1).toLowerCase() >=
        b.label.substr(0, 1).toLowerCase()
        ? 1
        : -1;
    });

  // When selected, auto create an array of selected trackers
  $: data.selectedArray = Object.keys(data.selected).map(tag => {
    alphaGroup = {};
    return data.selected[tag];
  });

  // If show changes, set selected to notihng
  $: if (show) {
    data.selected = {};
    alphaGroup = {};
  }

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
    close() {
      dispatch("cancel");
    },
    // Check if a letter has been shown
    alphaGroupExists(tracker) {
      if (data.trackers.length > 10) {
        // get first letter
        let alpha = tracker.label.substr(0, 1).toLowerCase();
        // If it has value - return true...
        if (alphaGroup.hasOwnProperty(alpha)) {
          return true;
        } else {
          // Else - populate the alphaGroup, then return false
          alphaGroup[alpha] = true;
          return false;
        }
      } else {
        // if it's less than 10 trackers - just show them without the letters
        return true;
      }
    }
  };
</script>

<style lang="scss">
  :global(.tracker-selector-modal .sticky-top) {
    position: sticky;
    top: 0px;
  }
</style>

{#if show}
  <NModal
    title={Lang.t('tracker.tracker-selector')}
    type="fullscreen"
    className="tracker-selector-modal"
    allowClose={true}
    on:close={methods.close}>
    <div class="list">
      {#each data.trackers as tracker}
        {#if !methods.alphaGroupExists(tracker)}
          <NItem
            className="bg-light text-faded sticky-top"
            title={tracker.label.substr(0, 1).toUpperCase()} />
        {/if}
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
      <button class="btn btn-light btn-lg w-100 mr-2" on:click={methods.close}>
        {Lang.t('general.close')}
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
