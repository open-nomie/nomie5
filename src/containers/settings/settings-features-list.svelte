<script lang="ts">
  import { wait } from './../../utils/tick/tick.ts'
  import ListItem from '../../components/list-item/list-item.svelte'
  import ToggleSwitch from '../../components/toggle-switch/toggle-switch.svelte'
  import { FeatureStore } from '../../store/feature-store'

  import { Lang } from '../../store/lang'
  import { UserStore } from '../../store/user-store'
  import { Interact } from '../../store/interact'
  import nid from '../../modules/nid/nid'
  import tick from '../../utils/tick/tick'
  import { onMount } from 'svelte'
  import Button from '../../components/button/button.svelte'

  let hasPin: boolean = false

  $: if (($UserStore.meta.access_pin || '').length) {
    hasPin = true
  }

  onMount(() => {
    if ($UserStore.meta.access_pin) {
      hasPin = true
    }
  })

  let methods = {
    settingChange() {
      UserStore.saveMeta()
    },

    async getNewPin(): Promise<string | undefined> {
      let pin: any = await Interact.inputPin(
        Lang.t('settings.pin-details', 'Set your Pin'),
        true,
      )
      if (pin) {
        await wait(1000)
        let confirmPin: any = await Interact.inputPin(
          Lang.t('settings.confirm-pin', 'Confirm Pin'),
          true,
        )
        if (!confirmPin) {
          return undefined
        } else if (pin == confirmPin) {
          return pin
        } else {
          Interact.error(
            Lang.t('settings.pins-do-not-match', 'Pins do not match'),
          )
          return undefined
        }
      }
    },

    async lockToggle(change) {
      await tick(100)
      let shouldLock = change
      if (shouldLock === true) {
        hasPin = false
        let pin: any = await methods.getNewPin()

        if (!pin) {
          UserStore.saveMeta({
            lock: false,
            access_pin: null,
          })
        } else {
          UserStore.saveMeta({
            lock: true,
            access_pin: pin,
          })
        }
      } else {
        let confirmDisable = await Interact.confirm('Disable Pin?')
        if (confirmDisable) {
          UserStore.saveMeta({
            lock: false,
            access_pin: null,
          })
          hasPin = false
        }
      }
    },
  }
</script>

<div class="py-2 my-2 n-list features lg:rounded-lg">
  <ListItem
    className="py-2"
    title={Lang.t('settings.feature-people-tracking', 'People Tracking')}
    description={Lang.t('settings.feature-people-description', 'Keep track of those you interact with the most')}>
    <div slot="right" class="pl-2">
      <ToggleSwitch
        value={$FeatureStore.people}
        on:change={(change) => {
          FeatureStore.toggle('people', change.detail)
        }} />
    </div>
  </ListItem>
  <hr class="divider center" />
  <ListItem
    className="py-2"
    title={Lang.t('settings.feature-dashboard', 'Personal Dashboard')}
    description={Lang.t('settings.feature-dashboard-description', 'A dedicated tab for creating custom views of your data')}>
    <div slot="right" class="ml-2">
      <ToggleSwitch
        value={$FeatureStore.dashboard}
        on:change={(change) => {
          FeatureStore.toggle('dashboard', change.detail)
        }} />
    </div>
  </ListItem>
  <hr class="divider center" />
  <ListItem
    title={Lang.t('settings.use-location', 'Track Location')}
    description={Lang.t('settings.use-location-description', 'Lookup location each time you save a log')}>
    <div slot="right" class="ml-2">
      <ToggleSwitch
        bind:value={$UserStore.alwaysLocate}
        on:change={(event) => {
          UserStore.setAlwaysLocate(event.detail)
        }} />
    </div>
  </ListItem>
  <hr class="divider center" />
  <!-- Pin Code -->
  <ListItem
    title={Lang.t('settings.require-pin', 'Require Access Pin')}
    description={Lang.t('settings.require-pin-description', "Require a pin to launch Nomie. Don't forget it!")}>
    <div slot="right" class="ml-2">
      {#if hasPin}
        <Button
          className="toggle-pin-button"
          size="sm"
          color="danger"
          on:click={() => {
            methods.lockToggle(false)
          }}>
          {Lang.t('general.disable', 'Disable')}
        </Button>
      {:else}
        <Button
          className="toggle-pin-button"
          size="sm"
          on:click={() => {
            methods.lockToggle(true)
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
