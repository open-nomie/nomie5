<script>
  // components
  import NText from "../../../components/text/text.svelte";
  import NModal from "../../../components/modal/modal.svelte";
  import NItem from "../../../components/list-item/list-item.svelte";
  import NIcon from "../../../components/icon/icon.svelte";

  //Utils
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  // Stores
  import { TrackerStore } from "../../../store/tracker-store";
  import { Lang } from "../../../store/lang";

  // Props
  export let show = false;
  export let multiple = false;
  // export let multiple = false;

  // Consts
  const dispatch = createEventDispatcher();

  // State
  let state = {
    selected: {},
    trackers: [],
    multiple,
  };

  // Holder of the alphabet for the list
  let alphaGroup = {};

  // When tracker store loads. Turn trackers into array sorted by label
  $: state.trackers = Object.keys($TrackerStore.trackers || {})
    .map((tag) => {
      return $TrackerStore.trackers[tag];
    })
    .sort((a, b) => {
      return a.label.substr(0, 1).toLowerCase() >= b.label.substr(0, 1).toLowerCase() ? 1 : -1;
    });

  // When selected, auto create an array of selected trackers
  $: state.selectedArray = Object.keys(state.selected).map((tag) => {
    alphaGroup = {};
    return state.selected[tag];
  });

  // If show changes, set selected to notihng
  $: if (show) {
    state.selected = {};
    alphaGroup = {};
  }

  // Methods
  const methods = {
    toggle(tracker) {
      if (state.selected.hasOwnProperty(tracker.tag)) {
        delete state.selected[tracker.tag];
        data = data;
      } else {
        state.selected[tracker.tag] = tracker;
      }
    },
    close() {
      dispatch("cancel");
    },
    // Check if a letter has been shown
    alphaGroupExists(tracker) {
      if (state.trackers.length > 10) {
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
    },
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
    title={Lang.t('general.tracker-selector', 'Tracker Selector')}
    type="fullscreen"
    className="tracker-selector-modal"
    allowClose={true}
    on:close={methods.close}>
    <div class="list">
      {#each state.trackers as tracker}
        {#if !methods.alphaGroupExists(tracker)}
          <NItem className="bg-light text-faded sticky-top" title={tracker.label.substr(0, 1).toUpperCase()} />
        {/if}
        <NItem
          className="bottom-line {state.selected.hasOwnProperty(tracker.tag) ? 'bg-selected' : ''}"
          title={tracker.label}
          on:click={() => {
            methods.toggle(tracker);
          }}>
          <span slot="left">
            <NText size="lg">{tracker.emoji}</NText>
          </span>
          <span slot="right">
            {#if state.selected.hasOwnProperty(tracker.tag)}
              d
              <NIcon name="checkmarkOutline" className="fill-primary-bright" />
            {/if}
          </span>
        </NItem>
      {/each}
    </div>
    <div slot="footer" class="n-row">
      <button class="mr-2 btn btn-light btn-lg w-100" on:click={methods.close}>{Lang.t('general.close')}</button>
      {#if state.selectedArray.length > 0}
        <button
          transition:fade
          class="btn btn-primary btn-lg w-100"
          on:click={() => {
            dispatch('select', state.selectedArray);
          }}>
          Select
        </button>
      {/if}
    </div>
  </NModal>
{/if}
