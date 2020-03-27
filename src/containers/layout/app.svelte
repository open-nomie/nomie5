<script>
  import { onMount } from "svelte";
  import AppTabs from "../layout/tabs.svelte";
  import tick from "../../utils/tick/tick";
  export let title = "Welcome";
  export let refresh = undefined;
  export let showTabs = true;

  let padBottomDom;
  let padTopDom;
  let contentDom;
  let headerDom;
  let footerDom;

  const padContent = () => {
    padTopDom.style.height = `${headerDom.offsetHeight}px`;
    padBottomDom.style.minHeight = `${footerDom.offsetHeight}px`;
  };

  $: if (title) {
    document.title = `Nomie ${title}`;
  }

  $: if (refresh && padTopDom) {
    padContent();
  }

  onMount(async () => {
    await tick(100);
    padContent();
    await tick(100);
    padContent();
    window.scrollTo(0, 0);
  });
</script>

<style lang="scss">
  .content-slot {
    background-color: var(--color-bg);
    -webkit-overflow-scrolling: touch;
    z-index: 0;
    // color: var(--color-bg);
    flex-grow: 1;
  }

  :global(.header-slot .n-toolbar) {
    z-index: 10;
    position: relative;
  }
  .header-slot {
    padding-top: env(safe-area-inset-top);
    // background-color: var(--color-bg);
    // background: transparent;
    background: transparent;

    flex-grow: 0;
    flex-shrink: 0;
    // box-shadow: var(--box-shadow-float);
    z-index: 1200;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    h1,
    h2,
    h3 {
      font-size: 1rem;
    }
    .header-fade {
      position: absolute;
      pointer-events: none;
      z-index: 0;
      top: 0;
      left: 0;
      right: 0;
      bottom: -30px;
      background: var(--header-fade);
    }
  }

  .footer-slot {
    box-shadow: 0px -6px 15px rgba(0, 0, 0, 0.09);
    z-index: 1200;
    flex-grow: 0;
    flex-shrink: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>

<div class="header-slot" bind:this={headerDom}>
  <div class="header-fade" />
  <slot name="header" />
</div>
<div class="content-slot" bind:this={contentDom}>
  <!-- Dynamically add padding to account for headers and footers -->
  <div bind:this={padTopDom} class="pad-top">&nbsp;</div>
  <!-- Insert Slotted Content -->
  <slot name="content" />
  <!-- Dynamically add padding to account for headers and footers -->
  <div bind:this={padBottomDom} class="pad-bottom">&nbsp;</div>
</div>
<div class="footer-slot" bind:this={footerDom}>
  <slot name="footer" />
  {#if showTabs}
    <AppTabs />
  {/if}
</div>
