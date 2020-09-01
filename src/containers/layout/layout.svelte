<script lang="ts">
  import AppTabs from "../../containers/layout/tabs.svelte";
  import { onMount } from "svelte";

  export let style: string = "";
  export let className: string = "";
  export let pageTitle = undefined;
  export let showTabs: boolean = true;
  export let headerClassNames = "";

  declare var window: any;
  let scrollArea: HTMLElement;
  let scrolling: Boolean = false;
  let scrolled: Boolean = false;

  function generateContent() {
    return new Array(300).fill("hello").join(" ");
  }

  // Controll Scrolling
  let scollingTimeout;
  let startTimeout;
  function _onScroll(evt: any) {
    clearTimeout(startTimeout);
    clearTimeout(scollingTimeout);
    if (!scrolling) {
      scrolling = true;
      scrolled = true;
    }
    scollingTimeout = setTimeout(() => {
      if (evt.target.scrollTop > 50) {
        scrolled = true;
      } else {
        scrolled = false;
      }
      scrolling = false;
    }, 200);
  }

  $: hasHeader = (arguments[1].$$slots || {}).hasOwnProperty("header");
  $: hasFooter = (arguments[1].$$slots || {}).hasOwnProperty("footer");
  $: hasContent = (arguments[1].$$slots || {}).hasOwnProperty("content");
  $: hasBottom = (arguments[1].$$slots || {}).hasOwnProperty("bottom");

  onMount(() => {});
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
    <header class="layout-header {headerClassNames} {scrolled ? 'scrolled' : ''} {scrolling ? 'scrolling' : ''}">
      <slot name="header" />
    </header>
  {/if}
  <main id="nomie-main" bind:this={scrollArea} class="layout-main" on:scroll={_onScroll}>
    {#if hasContent}
      <slot name="content" />
    {:else}
      <slot />
    {/if}
  </main>
  {#if hasBottom}
    <main id="nomie-main-bottom">
      <slot name="bottom" />
    </main>
  {/if}
  {#if hasFooter}
    <footer class="layout-footer">
      <slot name="footer" />
    </footer>
  {/if}
  {#if showTabs}
    <AppTabs />
  {/if}
</div>
