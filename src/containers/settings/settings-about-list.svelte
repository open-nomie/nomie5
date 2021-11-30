<script lang="ts">
  import { navigate } from 'svelte-routing'
  import { AppStore } from './../../store/app-store'
  import Divider from './../../components/divider/divider.svelte'
  import { Device } from './../../store/device-store'
  import { UserStore } from './../../store/user-store'
  import NIcon from '@/components/icon/icon.svelte'
  import Button from './../../components/button/button.svelte'
  import { TrackerStore } from './../../store/tracker-store'
  import { LedgerStore } from '../ledger/LedgerStore'
  import { Lang } from './../../store/lang'
  import ListItem from './../../components/list-item/list-item.svelte'
  import List from './../../components/list/list.svelte'
</script>

<List
  className=" mb-3"
  title={Lang.t('settings.join-the-community', 'Join the Community')}
  outside>
  <ListItem detail title="Learn More" href="https://nomie.app?s=dap">
    <span slot="right" class="text-inverse-3">Nomie.app</span>
  </ListItem>
  <ListItem
    title="Become a Patron"
    detail
    href="https://www.patreon.com/nomieapp">
    <span slot="right" class="text-inverse-3">Patreon</span>
  </ListItem>
  <ListItem title="Reddit r/nomie" detail href="https://reddit.com/r/nomie">
    <span slot="right" class="flex text-inverse-3">/r/nomie</span>
  </ListItem>

  <ListItem
    title="Open Source"
    detail
    href="https://github.com/open-nomie/nomie">
    <span slot="right" class="flex text-inverse-3">GitHub</span>
  </ListItem>
</List>

<List className="mb-3" outside title="App">
  <ListItem title={Lang.t('general.tracker-count', 'Tracker Count')}>
    <span slot="right">{TrackerStore.getAsArray().length}</span>
  </ListItem>

  <ListItem title={Lang.t('general.first_log', 'First Log')}>
    <div class="" slot="right">
      {#await LedgerStore.getFirstDate(true)}
        Loading...
      {:then date}
        <div class="text-sm">{date.format('MMM YYYY')}</div>
      {/await}
      <!--  -->
    </div>
  </ListItem>
  <ListItem title={Lang.t('general.launch-count', 'Launch Count')}>
    <div class="flex" slot="right">
      <Button icon size="sm" on:click={UserStore.resetLaunchCount}>
        <NIcon name="delete" className="fill-red" size={18} />
      </Button>
      {$UserStore.launchCount}
    </div>
  </ListItem>
  <ListItem title={Lang.t('general.device', 'Device')}>
    <span slot="right">{$Device.device}</span>
  </ListItem>
  <ListItem title={Lang.t('general.platform', 'Platform')}>
    <span slot="right">{$Device.platform}</span>
  </ListItem>
  <ListItem title={Lang.t('general.pwa', 'PWA')}>
    <span slot="right">{$Device.pwa}</span>
  </ListItem>
  <Divider center />
  <ListItem title="UI Test" to="/test" detail />
</List>

<List title="Version" outside className="mb-3">
  <ListItem
    title="Version {import.meta.env.PACKAGE_VERSION} "
    description="Built APP_BUILD_DATE "
    detail
    on:click={AppStore.reveal}>
    <span slot="right" class="flex text-sm text-primary-500">
      What's New
    </span>
  </ListItem>
  <ListItem
    detail
    title="Onboarded"
    on:click={() => {
      navigate('/setup')
    }}>
    <span slot="right" class="text-sm text-primary-500">
      {Lang.t('settings.redo-setup', 'Redo Setup')}
    </span>
  </ListItem>
</List>
