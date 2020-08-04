<script lang="ts">
  import ListItem from "../../components/list-item/list-item.svelte";
  import ToggleSwitch from "../../components/toggle-switch/toggle-switch.svelte";
  import { FeatureStore } from "../../store/feature-store";
  import Booster from "../booster/booster.svelte";
</script>

<div class="n-list solo my-2">
  <ListItem bottomLine className="py-2" title="People Tracking" description="Keep track of those you interact with.">
    <div slot="right">
      <ToggleSwitch
        value={$FeatureStore.people}
        on:change={(change) => {
          FeatureStore.toggle('people', change.detail);
        }} />
    </div>
  </ListItem>
  <ListItem
    className="py-2"
    title="Dashboard"
    description="Build your personal customized dashboard with charts, values, positivity and more. ">
    <div slot="right">
      <ToggleSwitch
        value={$FeatureStore.dashboard}
        on:change={(change) => {
          FeatureStore.toggle('dashboard', change.detail);
        }} />
    </div>
  </ListItem>
</div>

<Booster />
