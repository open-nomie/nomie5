<script>
  import { Link } from "svelte-routing";
  import Icon from "../../components/icon.svelte";
</script>

<style lang="scss">
  @import "../../scss/utils/__utils.scss";
  #app-tabs {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background-color: var(--color-tabs);
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    z-index: 200;

    // Tab Links

    // Tab Icons
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
    min-width: 30%;
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
    <Link to="/history">
      <Icon name="calendar" />
      <label>History</label>
    </Link>
    <Link to="/">
      <Icon name="grid" />
      <label>Track</label>
    </Link>
    <Link to="/settings">
      <Icon name="menu" />
      <label>Settings</label>
    </Link>
  </div>
</nav>
