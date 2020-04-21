<script>
  import AppTabs from "../../containers/layout/tabs.svelte";

  export let style = "";
  export let className = "";
  export let pageTitle = undefined;
  export let showTabs = true;

  function generateContent() {
    return new Array(300).fill("hello").join(" ");
  }

  $: hasHeader = (arguments[1].$$slots || {}).hasOwnProperty("header");
  $: hasFooter = (arguments[1].$$slots || {}).hasOwnProperty("footer");
  $: hasContent = (arguments[1].$$slots || {}).hasOwnProperty("content");
</script>

<svelte:head>
  <title>{pageTitle ? `${pageTitle} - N5` : `Nomie v5`}</title>
</svelte:head>

<div class="n-layout {className}" {style}>
  {#if hasHeader}
    <header class="layout-header">
      <slot name="header" />
    </header>
    <div class="layout-header-fade" />
  {/if}
  <main class="layout-main">
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
