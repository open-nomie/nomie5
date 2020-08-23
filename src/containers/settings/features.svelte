<script lang="ts">
  import ListItem from "../../components/list-item/list-item.svelte";
  import ToggleSwitch from "../../components/toggle-switch/toggle-switch.svelte";
  import { FeatureStore } from "../../store/feature-store";
  import Booster from "../booster/booster.svelte";
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import { Interact } from "../../store/interact";

  let methods = {
    settingChange() {
      UserStore.saveMeta();
    },
    async lockToggle(change) {
      console.log("Toggle Lock", change, $UserStore.meta.lock);
      let shouldLock = change.detail;

      if (shouldLock === true) {
        if (($UserStore.meta.pin || "").length == 0) {
          // TODO: figure out how to handle a cancel in the interact prompt
          let pin: any = await Interact.prompt(Lang.t("settings.pin-details"), null, {
            value: "",
            valueType: "number",
          });

          console.log({ pin });

          if (!pin) {
            $UserStore.meta.lock = false;
            $UserStore.meta.pin = null;
            UserStore.saveMeta();
          } else {
            $UserStore.meta.lock = true;
            $UserStore.meta.pin = parseInt(pin);
            UserStore.saveMeta();
          }
        }
      } else {
        $UserStore.meta.lock = false;
        $UserStore.meta.pin = null;
        UserStore.saveMeta();
      }
    },
  };
</script>

<div class="n-list solo my-2">
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
    bottomLine
    title={Lang.t('settings.require-pin')}
    description="Require a pin to launch Nomie. Warning if you lose your pin, there's nothing you can do.">
    <div slot="right" class="ml-2">
      <ToggleSwitch value={$UserStore.meta.lock} on:change={methods.lockToggle} />
    </div>
  </ListItem>
</div>

<!-- <Booster /> -->
