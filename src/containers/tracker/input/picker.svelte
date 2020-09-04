<script>
  import { createEventDispatcher } from "svelte";
  // import ListItem from "../list-item/list-item.svelte";
  // import Input from "../input/input.svelte";
  // import Icon from "../icon/icon.svelte";
  import LabelMeta from "../../../components/label-meta/label-meta.svelte";
  import { TrackerStore } from "../../../store/tracker-store";
  import PickerList from "../../../components/picker-list/picker-list.svelte";
  import Icon from "../../../components/icon/icon.svelte";
  import Input from "../../../components/input/input.svelte";
  import ListItem from "../../../components/list-item/list-item.svelte";

  const dispatch = createEventDispatcher();

  export let tracker;

  function fireChange(evt) {
    console.log("picker.svelte", evt.detail);
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
