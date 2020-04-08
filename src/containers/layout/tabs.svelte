<script>
  // Vendors
  import { Link } from "svelte-routing";

  // Components
  import Icon from "../../components/icon/icon.svelte";

  // Plugins
  import Plugins from "../../plugins/plugins";

  import { Lang } from "../../store/lang";
</script>

<style lang="scss">
  @import "../../scss/utils/__utils.scss";
  #app-tabs {
    height: calc(60px + env(safe-area-inset-bottom));
    padding-bottom: calc(env(safe-area-inset-bottom));
    // background-color: var(--tabs-background);
    // backdrop-filter: saturate(180%) blur(20px);
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    z-index: 1200;

    .n-row {
      z-index: 10;
    }
  }

  :global(#app-tabs svg) {
    // fill: #fff;
    // height: 18px;
    // flex-shrink: 0;
    // margin-bottom: 4px;
  }

  :global(#app-tabs a svg) {
    height: 24px !important;
    width: 24px !important;
    margin-bottom: 3px;
  }

  :global(#app-tabs a[aria-current="page"] svg) {
    fill: var(--color-primary-bright) !important;
    transform: scale(1.1);
    transition: all 0.2s ease-in-out;
  }

  :global(#app-tabs a[aria-current="page"] svg .fill) {
    fill: var(--color-primary-bright) !important;
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
      color: var(--color-inverse);
      svg {
        fill: var(--color-primary-bright);
        transform: scale(1.1);
        transition: all 0.2s ease-in-out;
      }
      &:after {
        content: "";
        position: absolute;
        bottom: -6px;
        left: 20%;
        right: 20%;
        height: 2px;
        border-radius: 1px;
        background-color: var(--color-primary-bright);
      }
    }
  }
</style>

<nav id="app-tabs" class="">
  <div class="n-row mw-500px mx-auto">

    <Link to="/history">
      <Icon name="calendar" />
      <!-- <i class="zmdi zmdi-calendar" /> -->
      <label>{Lang.t('tabs.history')}</label>
    </Link>

    <Link to="/">
      <Icon name="tracker" />
      <label>{Lang.t('general.trackers', 'Trackers')}</label>
    </Link>

    <Link to="/people">
      <Icon name="people" />
      <label>{Lang.t('tabs.people')}</label>
    </Link>

    <!-- {#each Plugins.filter(p => p.tab) as plugin}
      <Link to="/plugins/{plugin.id}">
        <i class="zmdi zmdi-{plugin.tab.icon}" />
        <label>{plugin.tab.label}</label>
      </Link>
    {/each} -->

    <Link to="/settings">
      <Icon name="settings" />
      <label>{Lang.t('tabs.settings')}</label>
    </Link>

  </div>
</nav>
