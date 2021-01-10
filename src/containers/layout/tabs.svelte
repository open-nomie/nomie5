<script>
  // Vendors
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";

  // Components
  import Icon from "../../components/icon/icon.svelte";
  import AppTab from "../../components/app-tab/app-tab.svelte";

  import { Lang } from "../../store/lang";
  import { TrackerStore } from "../../store/tracker-store";
  import { FeatureStore } from "../../store/feature-store";
  import NPaths from "../../paths";
  import { UserStore } from "../../store/user-store";
import { ApiStore } from "../api/api-store";
// import { NomieAPI } from "../../store/napi";
  
  const state = {
    mounted: false,
  };

  $: hideLabels = $UserStore.meta.hideLabels;

  onMount(() => {
    state.mounted = true;
  });
</script>

<style lang="scss">
  @import "../../scss/utils/__utils.scss";

  #app-tabs {
    --tab-height: 65px;

    height: calc(#{var(--tab-height)} + env(safe-area-inset-bottom));
    padding-bottom: calc(env(safe-area-inset-bottom));
    background-color: var(--footer-background);
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    z-index: 1200;
    flex-shrink: 0;
    // padding-top: 10px;

    &.compact {
      --tab-height: 55px;
      height: calc(#{var(--tab-height)} + env(safe-area-inset-bottom));
      .n-row {
        max-height: var(--tab-height);
        min-height: var(--tab-height);
        height: var(--tab-height);
      }
    }

    .n-row {
      z-index: 10;
      max-height: var(--tab-height);
      min-height: var(--tab-height);
      height: var(--tab-height);
      flex-shrink: 0;
    }
  }
  :global(#app-tabs .notification) {
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
  <nav id="app-tabs" class={hideLabels ? 'compact' : ''}>
    <div class="mx-auto n-row mw-500px">

      <AppTab link={NPaths.routes.history()} icon="calendar" label={Lang.t('tabs.history', 'History')} />
      {#if $FeatureStore.dashboard}
        <AppTab link={NPaths.routes.dashboard()} icon="report" label={Lang.t('tabs.dashboard', 'Dash')} />
      {/if}
      <AppTab link="/" icon="grid"  notify={$TrackerStore.timers.length ? true : false} label={Lang.t('tabs.track', 'Track')}>
      </AppTab>
      {#if $FeatureStore.people}
        <AppTab link={NPaths.routes.people()} icon="user" label={Lang.t('tabs.people', 'People')} />
      {/if}
      <AppTab link={NPaths.routes.settings()} notify={$ApiStore.items.length ? true : false} icon="settings" label={Lang.t('tabs.settings', 'Settings')} />

    </div>
  </nav>
{/if}
