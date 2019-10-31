<script>
  import { onMount } from "svelte";
  import AppTabs from "../layout/tabs.svelte";
  export let title = "Welcome";

  let bodyPaddingTop = 50;
  let bodyPaddingBottom = 50;
  let contentDom;
  let headerDom;
  let footerDom;

  $: if (title) {
    document.title = `Nomie ${title}`;
  }

  onMount(() => {
    bodyPaddingTop = headerDom.offsetHeight;
    bodyPaddingBottom = footerDom.offsetHeight;
  });
</script>

<style lang="scss">
  .content-slot {
    background-color: var(--color-bg);
    -webkit-overflow-scrolling: touch;
    z-index: 0;
    color: var(--color-bg);
    min-height: 100vh;
  }

  .header-slot {
    padding-top: env(safe-area-inset-top);
    background-color: var(--color-solid);
    flex-grow: 0;
    flex-shrink: 0;
    box-shadow: var(--box-shadow-float);
    z-index: 1200;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
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
  <slot name="header" />
</div>
<div class="content-slot" bind:this={contentDom}>
  <!-- Dynamically add padding to account for headers and footers -->
  <div style="padding-top:{bodyPaddingTop}px" class="pad-top" />
  <!-- Insert Slotted Content -->
  <slot name="content" />
  <!-- Dynamically add padding to account for headers and footers -->
  <div style="padding-bottom:{bodyPaddingBottom}px" class="pad-top" />
</div>
<div class="footer-slot" bind:this={footerDom}>
  <slot name="footer" />
  <AppTabs />
</div>
