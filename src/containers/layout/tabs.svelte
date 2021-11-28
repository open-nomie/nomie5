<script>
  import Dot from './../../components/dot/dot.svelte'
  import IonIcon from './../../components/icon/ion-icon.svelte'
  import Container from './../../components/container/container.svelte'
  import AppsOutline from 'ionicons/dist/svg/apps-outline.svg?component'
  import AppsSolid from 'ionicons/dist/svg/apps.svg?component'
  import PeopleOutline from 'ionicons/dist/svg/people-outline.svg?component'
  import PeopleSolid from 'ionicons/dist/svg/people.svg?component'
  import EaselOutline from 'ionicons/dist/svg/easel-outline.svg?component'
  import EaselSolid from 'ionicons/dist/svg/easel.svg?component'
  import CalendarOutline from 'ionicons/dist/svg/calendar-outline.svg?component'
  import CalendarSolid from 'ionicons/dist/svg/calendar.svg?component'
  import SettingsOutline from 'ionicons/dist/svg/settings-outline.svg?component'
  import SettingsSolid from 'ionicons/dist/svg/settings.svg?component'
  // Vendors
  import { onMount } from 'svelte'
  import { Link } from 'svelte-routing'

  // Components
  import Icon from '../../components/icon/icon.svelte'
  import AppTab from '../../components/app-tab/app-tab.svelte'

  import { Lang } from '../../store/lang'
  import { TrackerStore } from '../../store/tracker-store'
  import { FeatureStore } from '../../store/feature-store'
  import NPaths from '../../paths'
  import { UserStore } from '../../store/user-store'
  import { ApiStore } from '../api/api-store'

  const state = {
    mounted: false,
  }

  $: hideLabels = $UserStore.meta.hideLabels

  onMount(() => {
    state.mounted = true
  })
</script>

<style global lang="postcss">
  #app-tabs {
    @apply bg-white dark:bg-black;
    --tab-height: 65px;
    height: calc(var(--tab-height) + env(safe-area-inset-bottom));
    padding-bottom: calc(env(safe-area-inset-bottom));
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    @apply z-50;
    @apply pt-1;
    flex-shrink: 0;
  }

  .tab-wrap a .active {
    @apply hidden;
  }
  .tab-wrap a[aria-current='page'] .active {
    @apply inline-flex;
  }
  .tab-wrap a[aria-current='page'] .inactive {
    display: none !important;
  }
  #app-tabs.compact {
    --tab-height: 55px;
    height: calc(var(--tab-height) + env(safe-area-inset-bottom));
  }
  #app-tabs.compact .n-row {
    max-height: var(--tab-height);
    min-height: var(--tab-height);
    height: var(--tab-height);
  }
  #app-tabs .n-row {
    z-index: 10;
    max-height: var(--tab-height);
    min-height: var(--tab-height);
    height: var(--tab-height);
    flex-shrink: 0;
  }
  #app-tabs .notification {
    position: absolute;
    top: 8px;
    right: calc(50% - 15px);
    width: 6px;
    height: 6px;
    background-color: var(--color-red);
    border-radius: 3px;
  }
</style>

{#if state.mounted}
  <nav id="app-tabs" class={`${hideLabels ? 'compact' : ''}  glass`}>
    <Container>
      <div class="flex items-center w-full justify-items-stretch">
        <AppTab
          link={NPaths.routes.history()}
          icon="calendar"
          label={Lang.t('tabs.history', 'History')}>
          <IonIcon className="inactive" icon={CalendarOutline} />
          <IonIcon className="active" icon={CalendarSolid} />
        </AppTab>

        {#if $FeatureStore.dashboard}
          <AppTab
            link={NPaths.routes.dashboard()}
            icon="report"
            label={Lang.t('tabs.dashboard', 'Dash')}>
            <IonIcon className="inactive" icon={EaselOutline} />
            <IonIcon className="active" icon={EaselSolid} />
          </AppTab>
        {/if}
        <AppTab
          link="/"
          icon="grid"
          notify={$TrackerStore.timers.length ? true : false}
          label={Lang.t('tabs.track', 'Track')}>
          <IonIcon className="inactive" icon={AppsOutline} />
          <IonIcon className="active" icon={AppsSolid} />
          {#if $TrackerStore.timers.length}
            <Dot size={8} className="absolute top-1 bg-red-500 -mr-8" />
          {/if}
        </AppTab>
        {#if $FeatureStore.people}
          <AppTab
            link={NPaths.routes.people()}
            icon="user"
            label={Lang.t('tabs.people', 'People')}>
            <IonIcon className="inactive" icon={PeopleOutline} />
            <IonIcon className="active" icon={PeopleSolid} />
          </AppTab>
        {/if}
        <AppTab
          link={NPaths.routes.settings()}
          notify={$ApiStore.items.length ? true : false}
          icon="settings"
          label={Lang.t('tabs.settings', 'Settings')}>
          <IonIcon className="inactive" icon={SettingsOutline} />
          <IonIcon className="active" icon={SettingsSolid} />
          <Dot size={8} className="absolute top-1 bg-red-500 -mr-8" />
        </AppTab>

      </div>
    </Container>
  </nav>
{/if}
