<script lang="ts">
  /** Timer.svelte
   *
   * Used to show either the Active Counter (if tracker.started is set)
   * or to show a manual time entry component
   *
   */

  // svelte
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  // Components
  import Counter from "../../../components/counter/counter.svelte";
  import ManualTime from "../../../components/counter/manual-time.svelte";

  // Utils
  import NomieUOM from "../../../utils/nomie-uom/nomie-uom";
  import Logger from "../../../utils/log/log";

  // Stores
  import { TrackerStore } from "../../../store/tracker-store";
  import Button from "../../../components/button/button.svelte";
  import { Lang } from "../../../store/lang";
  import Icon from "../../../components/icon/icon.svelte";
import { Play } from "svelte-hero-icons";

  // Consts
  const dispatch = createEventDispatcher();
  const console = new Logger("⏲ <Timer Parent>");

  // Props
  export let value;
  export let tracker:any;

  // Data
  let data = {
    tempValue: (value || "") + "" || "",
    changed: false,
    started: tracker.started,
  };

  const methods = {
    // dispatch("change", parseFloat(data.tempValue));
    start() {
      tracker.started = new Date().getTime();
      TrackerStore.saveTracker(tracker);
      data = data;
    },
  };

  onMount(() => {
    data.tempValue = value;
  });
</script>



<div class="tracker-input n-timer-input w-100 ">
  {#if tracker.started}
    <Counter started={tracker.started} lg className="py-5 bg-light" on:change={(event) => {}} />
  {:else}
    <div class="n-panel center-all column">
      <div class="filler" />
      <ManualTime
        {value}
        on:change={(event) => {
          dispatch('change', event.detail);
        }} />
      <Button
        on:click={() => {
          dispatch('forceStart');
        }}
        color="light"
        shape="circle"
        size="md"
        className="text-white animate up {value ? 'visible' : 'hidden'}">
        <Icon icon={Play} size={32} className="text-primary-500" />
      </Button>
      <div class="filler" />
    </div>
  {/if}
</div>
