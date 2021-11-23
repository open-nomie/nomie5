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

<style lang="postcss" global>
  .content-slot {
	 background-color: var(--color-bg);
	 -webkit-overflow-scrolling: touch;
	 z-index: 0;
	 flex-grow: 1;
}
 .header-slot .n-toolbar {
	 z-index: 10;
	 position: relative;
}
 .header-slot .n-toolbar-grid {
	 z-index: 10;
	 position: relative;
	 min-height: 50px;
}
 .header-slot .btn {
	 font-weight: bold;
	 font-size: 0.9em;
}
 .header-slot {
	 padding-top: env(safe-area-inset-top);
	 background: transparent;
	 flex-grow: 0;
	 flex-shrink: 0;
	 z-index: 1200;
	 position: fixed;
	 top: 0;
	 left: 0;
	 right: 0;
}
 .header-slot h1, .header-slot h2, .header-slot h3 {
	 font-size: 1em;
}
 .header-slot .header-fade {
	 position: absolute;
	 pointer-events: none;
	 z-index: 0;
	 top: 0;
	 left: 0;
	 right: 0;
	 bottom: -30px;
	 background: var(--header-fade);
}
 .footer-fade {
	 position: absolute;
	 pointer-events: none;
	 z-index: 0;
	 bottom: 0;
	 left: 0;
	 right: 0;
	 top: 0px;
}
 .footer-slot {
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
  {#if showTabs}
    <div class="header-fade" />
  {/if}
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
    <div class="footer-fade" />
    <AppTabs />
  {/if}
</div>
