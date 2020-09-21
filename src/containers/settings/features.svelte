<script lang="ts">
  import ListItem from "../../components/list-item/list-item.svelte";
  import ToggleSwitch from "../../components/toggle-switch/toggle-switch.svelte";
  import { FeatureStore } from "../../store/feature-store";

  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import { Interact } from "../../store/interact";
  import nid from "../../modules/nid/nid";

  let methods = {
    settingChange() {
      UserStore.saveMeta();
    },
    async lockToggle(change) {
      let shouldLock = change.detail;

      if (shouldLock === true) {
        let pin: any = await Interact.prompt(Lang.t("settings.pin-details"), null, {
          value: "",
          valueType: "number",
        });

        if (!pin) {
          $UserStore.meta.lock = false;
          $UserStore.meta.access_pin = null;
          UserStore.saveMeta();
        } else {
          $UserStore.meta.lock = true;
          $UserStore.meta.access_pin = nid(`${pin}`.trim());
          UserStore.saveMeta();
        }
      } else {
        $UserStore.meta.lock = false;
        $UserStore.meta.access_pin = null;
        UserStore.saveMeta();
      }
    },
  };
</script>

<div class="n-list my-2 features">
  <ListItem bottomLine className="py-2" title="People Tracking" description="Keep track of those you interact with the most">
    <div slot="right" class="pl-2">
      <ToggleSwitch
        value={$FeatureStore.people}
        on:change={(change) => {
          FeatureStore.toggle('people', change.detail);
        }} />
    </div>
  </ListItem>
  <ListItem
    bottomLine
    className="py-2"
    title="Dashboard"
    description="Enabled customized dashboards with charts, values, positivity and more. ">
    <div slot="right" class="ml-2">
      <ToggleSwitch
        value={$FeatureStore.dashboard}
        on:change={(change) => {
          FeatureStore.toggle('dashboard', change.detail);
        }} />
    </div>
  </ListItem>
  <ListItem bottomLine title={Lang.t('settings.use-location')} description="Lookup location each time you save a log">
    <div slot="right" class="ml-2">
      <ToggleSwitch
        bind:value={$UserStore.alwaysLocate}
        on:change={(event) => {
          UserStore.setAlwaysLocate(event.detail);
        }} />
    </div>
  </ListItem>
  <!-- Pin Code -->
  <ListItem
    title={Lang.t('settings.require-pin')}
    description="Require a pin to launch Nomie. Warning if you lose your pin, there's nothing you can do.">
    <div slot="right" class="ml-2">
      <ToggleSwitch value={$UserStore.meta.lock} on:change={methods.lockToggle} />
    </div>
  </ListItem>
  {#if $UserStore.meta.hiddenFeatures}
    <ListItem title="Soon my friend!" />
  {/if}
</div>
