<script lang="ts">
  import AppTabs from '../../domains/layout/tabs.svelte'
  import { onMount } from 'svelte'
  import './layout.css'

  export let style: string = ''
  export let className: string = ''
  export let pageTitle = undefined
  export let showTabs: boolean = true
  export let headerClassNames = ''

  let scrollArea: HTMLElement
  let scrolling: boolean = false
  let scrolled: boolean = false

  function generateContent() {
    return new Array(300).fill('hello').join(' ')
  }

  // Controll Scrolling
  let scollingTimeout
  let startTimeout
  function _onScroll(evt: any) {
    clearTimeout(startTimeout)
    clearTimeout(scollingTimeout)
    if (!scrolling) {
      scrolling = true
      scrolled = true
    }
    scollingTimeout = setTimeout(() => {
      if (evt.target.scrollTop > 50) {
        scrolled = true
      } else {
        scrolled = false
      }
      scrolling = false
    }, 200)
  }

  $: hasHeader = (arguments[1].$$slots || {}).hasOwnProperty('header')
  $: hasFooter = (arguments[1].$$slots || {}).hasOwnProperty('footer')
  $: hasContent = (arguments[1].$$slots || {}).hasOwnProperty('content')
  $: hasBottom = (arguments[1].$$slots || {}).hasOwnProperty('bottom')

  onMount(() => {})
</script>

<svelte:head>
  <title>{pageTitle ? `${pageTitle} - v${import.meta.env.PACKAGE_VERSION}` : `Nomie v${import.meta.env.PACKAGE_VERSION}`}</title>
</svelte:head>

<div
  class="n-layout z-50 {className ? className : 'bg-gray-100 dark:bg-gray-800'}
  {hasFooter ? 'has-footer' : ''}
  {hasHeader ? 'has-header' : ''}
  {showTabs ? 'has-tabs' : 'no-tabs'}"
  {style}>
  {#if hasHeader}
    <header class="z-50 sticky top-0 glass {headerClassNames}">
      <slot name="header" />
    </header>
  {/if}
  <main
    id="nomie-main"
    bind:this={scrollArea}
    class="layout-main"
    on:scroll={_onScroll}>
    {#if hasContent}
      <slot name="content" />
    {:else}
      <slot />
    {/if}
  </main>
  {#if hasBottom}
    <main id="nomie-main-bottom" class="glass">
      <slot name="bottom" />
    </main>
  {/if}
  
  <footer class="sticky bottom-0 z-50 border-t layout-footer glass dark:border-gray-400 dark:border-opacity-20" style="box-shadow:-10px 0px 10px rgba(0,0,0,0.2)">
    <slot name="footer" />
      {#if showTabs}
        <AppTabs />
      {/if}
  </footer>


</div>
