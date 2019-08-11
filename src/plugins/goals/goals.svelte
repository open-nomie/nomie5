<script>
  // GOALS INCOMPLETE
  // TODO: Finish Goals
  import { onMount } from "svelte";
  // components
  import NItem from "../../components/list-item/list-item.svelte";
  import NText from "../../components/text/text.svelte";
  import KVBlock from "../../components/kv-block/kv-block.svelte";
  // store
  import { UserStore } from "../../store/user";
  import { TrackerStore } from "../../store/trackers";

  let trackers = [];

  $: trackers = Object.keys($TrackerStore || {})
    .map(key => {
      return $TrackerStore[key];
    })
    .filter(t => {
      return t.goal;
    });

  onMount(() => {});
</script>

<div class="plugin page goals">

  {#each trackers as tracker}
    <NItem className="py-2">
      <div slot="left">
        <NText className="avatar" size="xl">{tracker.emoji}</NText>
      </div>
      <div class="n-title pb-1">{tracker.label}</div>
      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          style="width:50%;"
          aria-valuenow="50"
          aria-valuemin="0"
          aria-valuemax="100" />
      </div>
      <div slot="right">
        <KVBlock label="< 200mg" value="$0.33" />
      </div>
    </NItem>
  {/each}

</div>
