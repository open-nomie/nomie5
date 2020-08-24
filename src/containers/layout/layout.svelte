<script lang="ts">
  import AppTabs from "../../containers/layout/tabs.svelte";

  export let style = "";
  export let className = "";
  export let pageTitle = undefined;
  export let showTabs = true;
  export let headerClassNames = "";

  declare var window: any;

  function generateContent() {
    return new Array(300).fill("hello").join(" ");
  }

  // Controll Scrolling
  let scollingTimeout;
  function scrolling(evt: any) {
    window.clearTimeout(scollingTimeout);
    document.body.classList.add("scrolling");
    if (evt.target.scrollTop > 50) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
    window.scrolling = true;
    scollingTimeout = setTimeout(() => {
      document.body.classList.remove("scrolling");
      window.scrolling = false;
    }, 100);
  }

  $: hasHeader = (arguments[1].$$slots || {}).hasOwnProperty("header");
  $: hasFooter = (arguments[1].$$slots || {}).hasOwnProperty("footer");
  $: hasContent = (arguments[1].$$slots || {}).hasOwnProperty("content");
</script>

<svelte:head>
  <title>{pageTitle ? `${pageTitle} - N5` : `Nomie v5`}</title>
</svelte:head>

<div
  class="n-layout {className}
  {hasFooter ? 'has-footer' : ''}
  {hasHeader ? 'has-header' : ''}
  {showTabs ? 'has-tabs' : 'no-tabs'}"
  {style}>
  {#if hasHeader}
    <header class="layout-header {headerClassNames}">
      <slot name="header" />
    </header>
    <div class="layout-header-fade" />
  {/if}
  <main id="nomie-main" class="layout-main" on:scroll={scrolling}>
    {#if hasContent}
      <slot name="content" />
    {:else}
      <slot />
    {/if}
  </main>
  {#if hasFooter}
    <footer class="layout-footer">
      <slot name="footer" />
    </footer>
  {/if}
  {#if showTabs}
    <AppTabs />
  {/if}
</div>
