<script>
  import AppTabs from "../layout/tabs.svelte";
</script>

<style lang="scss">
  .header-content {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;

    .header-slot {
      padding-top: env(safe-area-inset-top);
      flex-grow: 0;
      flex-shrink: 0;
      box-shadow: var(--box-shadow-float);
      z-index: 1;
    }
    .content-slot {
      flex-grow: 1;
      flex-shrink: 1;
      overflow-y: scroll;
      -webkit-overflow-scrolling: touch;
      max-height: calc(100% + 100px);
      height: 100%;
    }
    .footer-slot {
      box-shadow: 0px -6px 15px rgba(0, 0, 0, 0.09);
      z-index: 1;
      flex-grow: 0;
      flex-shrink: 0;
    }
  }
</style>

<div class="header-content">
  <div class="header-slot">
    <slot name="header" />
  </div>
  <div class="content-slot">
    <slot name="content" />
  </div>
  <div class="footer-slot">
    <slot name="footer" />
    <AppTabs />
  </div>

</div>
