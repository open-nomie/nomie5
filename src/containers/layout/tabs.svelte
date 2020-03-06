<script>
  // Vendors
  import { Link } from "svelte-routing";

  // Components
  import Icon from "../../components/icon.svelte";

  // Plugins
  import Plugins from "../../plugins/plugins";

  import { Lang } from "../../store/lang";
</script>

<style lang="scss">
  @import "../../scss/utils/__utils.scss";
  #app-tabs {
    height: calc(50px + env(safe-area-inset-bottom));
    padding-bottom: calc(env(safe-area-inset-bottom));
    background-color: var(--tabs-background);
    // backdrop-filter: saturate(180%) blur(20px);
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    z-index: 1200;
  }

  :global(#app-tabs svg) {
    fill: #fff;
    height: 18px;
    flex-shrink: 0;
    margin-bottom: 4px;
  }

  :global(#app-tabs a) {
    color: #fff;
    display: inline-flex;
    flex-direction: column;
    align-items: center;

    padding: 4px 10px 0;
    font-size: 0.7rem;
    text-decoration: none;
    opacity: 0.6;
    transition: all 0.2s ease-in-out;
    min-width: 30px;
    width: 100%;
    i {
      font-size: 1.2rem;
    }
    label {
      margin-bottom: 0;
    }

    // When Active
    &[aria-current] {
      opacity: 1;
    }
  }
</style>

<nav id="app-tabs" class="">
  <div class="n-row mw-500px mx-auto">

    <Link to="/">
      <i class="zmdi zmdi-grid" />
      <label>{Lang.t('tabs.track')}</label>
    </Link>

    <Link to="/history">
      <i class="zmdi zmdi-calendar" />
      <label>{Lang.t('tabs.history')}</label>
    </Link>

    {#each Plugins.filter(p => p.tab) as plugin}
      <Link to="/plugins/{plugin.id}">
        <i class="zmdi zmdi-{plugin.tab.icon}" />
        <label>{plugin.tab.label}</label>
      </Link>
    {/each}

    <Link to="/settings">
      <i class="zmdi zmdi-menu" />
      <label>{Lang.t('tabs.settings')}</label>
    </Link>

  </div>
</nav>
