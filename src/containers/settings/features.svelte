<script lang="ts">
  import ListItem from "../../components/list-item/list-item.svelte";
  import ToggleSwitch from "../../components/toggle-switch/toggle-switch.svelte";
  import { FeatureStore } from "../../store/feature-store";

  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import { Interact } from "../../store/interact";
  import nid from "../../modules/nid/nid";
  import tick from "../../utils/tick/tick";
  import { onMount } from "svelte";
  import Button from "../../components/button/button.svelte";

  let hasPin: boolean = false;

  $: if (($UserStore.meta.access_pin || "").length) {
    hasPin = true;
  }

  onMount(() => {
    if ($UserStore.meta.access_pin) {
      hasPin = true;
    }
  });

  let methods = {
    settingChange() {
      UserStore.saveMeta();
    },

    async getNewPin(): Promise<string | undefined> {
      let pin: any = await Interact.inputPin(Lang.t("settings.pin-details"), true);
      if (pin) {
        await tick(300);
        let confirmPin: any = await Interact.inputPin(Lang.t("settings.confirm-pin", "Confirm Pin"), true);
        if (!confirmPin) {
          return undefined;
        } else if (pin == confirmPin) {
          return pin;
        } else {
          Interact.error(Lang.t("settings.pins-do-not-match", "Pins do not match"));
          return undefined;
        }
      }
    },

    async lockToggle(change) {
      await tick(100);
      let shouldLock = change;
      if (shouldLock === true) {
        hasPin = false;
        console.log("Setting has Pin to false");
        let pin: any = await methods.getNewPin();
        if (!pin) {
          console.log("no pin set to false");
          UserStore.saveMeta({
            lock: false,
            access_pin: null,
          });
        } else {
          console.log("has pin, set to tru", pin);
          UserStore.saveMeta({
            lock: true,
            access_pin: pin,
          });
        }
      } else {
        let confirmDisable = await Interact.confirm("Disable Pin?");
        if (confirmDisable) {
          UserStore.saveMeta({
            lock: false,
            access_pin: null,
          });
          hasPin = false;
        }
      }
    },
  };
</script>

<div class="n-list my-2 py-2 features">
  <ListItem className="py-2" title="People Tracking" description="Keep track of those you interact with the most">
    <div slot="right" class="pl-2">
      <ToggleSwitch
        value={$FeatureStore.people}
        on:change={(change) => {
          FeatureStore.toggle('people', change.detail);
        }} />
    </div>
  </ListItem>
  <hr class="divider center" />
  <ListItem className="py-2" title="Personal Dashboard" description="A dedicated tab for creating custom views of your data">
    <div slot="right" class="ml-2">
      <ToggleSwitch
        value={$FeatureStore.dashboard}
        on:change={(change) => {
          FeatureStore.toggle('dashboard', change.detail);
        }} />
    </div>
  </ListItem>
  <hr class="divider center" />
  <ListItem title={Lang.t('settings.use-location')} description="Lookup location each time you save a log">
    <div slot="right" class="ml-2">
      <ToggleSwitch
        bind:value={$UserStore.alwaysLocate}
        on:change={(event) => {
          UserStore.setAlwaysLocate(event.detail);
        }} />
    </div>
  </ListItem>
  <hr class="divider center" />
  <!-- Pin Code -->
  <ListItem title={Lang.t('settings.require-pin')} description="Require a pin to launch Nomie. Don't forget it!">
    <div slot="right" class="ml-2">
      {#if hasPin}
        <Button
          className="toggle-pin-button"
          size="sm"
          color="danger"
          on:click={() => {
            methods.lockToggle(false);
          }}>
          {Lang.t('general.disable', 'Disable')}
        </Button>
      {:else}
        <Button
          className="toggle-pin-button"
          size="sm"
          on:click={() => {
            methods.lockToggle(true);
          }}>
          {Lang.t('settings.set-pin', 'Set Pin')}
        </Button>
      {/if}
      <!-- <ToggleSwitch value={hasPin} on:change={methods.lockToggle} />
      {hasPin ? 'has pin' : 'has no pin'} -->
    </div>
  </ListItem>
  <!-- {#if $UserStore.meta.hiddenFeatures}
    <ListItem title={Lang.t('settings.enable-advanced-buttons', 'Advanced Tracker Buttons')} description="Use advanced tracker button">
      <div slot="right" class="ml-2">
        <ToggleSwitch
          value={$FeatureStore.advancedButtons}
          on:change={(change) => {
            FeatureStore.toggle('advancedButtons', change.detail);
          }} />
      </div>
    </ListItem>
  {/if} -->
</div>
