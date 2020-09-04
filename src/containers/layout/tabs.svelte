<script>
  // Vendors
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";

  // Components
  import Icon from "../../components/icon/icon.svelte";

  import { Lang } from "../../store/lang";
  import { TrackerStore } from "../../store/tracker-store";
  import { FeatureStore } from "../../store/feature-store";
  import NPaths from "../../paths";
  import { UserStore } from "../../store/user-store";
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
    .notification {
      position: absolute;
      top: 0;
      right: calc(50% - 15px);
      width: 6px;
      height: 6px;
      background-color: var(--color-red);
      border-radius: 3px;
    }
  }

  :global(#app-tabs a svg) {
    height: 24px !important;
    width: 24px !important;
    margin-bottom: 3px;
  }

  :global(#app-tabs a[aria-current="page"] svg) {
    stroke: var(--color-primary-bright) !important;
    transform: scale(1.1);
    transition: all 0.2s ease-in-out;
  }

  :global(#app-tabs a[aria-current="page"] svg .fill) {
    stroke: var(--color-primary-bright) !important;
  }

  :global(#app-tabs a) {
    color: var(--color-inverse-2);
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    padding: 4px 10px 0;
    font-size: 0.7rem;
    text-decoration: none;
    // opacity: 0.6;
    transition: all 0.2s ease-in-out;
    min-width: 30px;
    width: 100%;
    i {
      font-size: 1.2rem;
      transition: all 0.2s ease-in-out;
    }
    label {
      margin-bottom: 0;
    }

    // When Active
    &[aria-current="page"] {
      color: var(--color-primary-bright);
      svg {
        transform: scale(1.1);
        transition: all 0.2s ease-in-out;
      }
      transform: scale(1.1);
      &:after {
        content: "";
      }
    }
  }
</style>

{#if state.mounted}
  <nav id="app-tabs" class={hideLabels ? 'compact' : ''}>
    <div class="n-row mw-500px mx-auto">

      <Link to={NPaths.routes.history()}>
        <Icon name="calendar" />
        {#if !hideLabels}
          <label>{Lang.t('tabs.history')}</label>
        {/if}
      </Link>

      {#if $FeatureStore.dashboard}
        <Link to={NPaths.routes.dashboard()}>
          <Icon name="report" />
          {#if !hideLabels}
            <label>{Lang.t('tabs.dashboard', 'Dash')}</label>
          {/if}
        </Link>
      {/if}

      <Link to="/">
        {#if $TrackerStore.timers.length}
          <div class="notification" />
        {/if}
        <Icon name="tracker" />
        {#if !hideLabels}
          <label>{Lang.t('general.trackers', 'Track')}</label>
        {/if}
      </Link>

      {#if $FeatureStore.people}
        <Link to={NPaths.routes.people()}>
          <Icon name="user" />
          {#if !hideLabels}
            <label>{Lang.t('tabs.people')}</label>
          {/if}
        </Link>
      {/if}

      <Link to={NPaths.routes.settings()}>
        <Icon name="settings" />
        {#if !hideLabels}
          <label>{Lang.t('tabs.settings')}</label>
        {/if}
      </Link>

    </div>
  </nav>
{/if}
