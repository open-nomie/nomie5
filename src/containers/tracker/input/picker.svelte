<script>
  import { createEventDispatcher } from "svelte";
  import PickerList from "../../../components/picker-list/picker-list.svelte";

  const dispatch = createEventDispatcher();

  export let tracker;

  function fireChange(evt) {
    console.log("Firing picker.svelte change", evt.detail);
    dispatch("change", evt.detail);
  }
</script>

<style lang="scss">
  .tracker-input.picker {
    width: 100%;
    justify-content: center;
  }
</style>

<div class="tracker-input picker">
  <PickerList {tracker} on:change={fireChange} showHeaderContent={false} />
</div>
