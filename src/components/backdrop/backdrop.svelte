<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade, fly } from 'svelte/transition'

  // import flyin from "../../modules/actions/flyin";

  import { BackdropStore } from './backdrop-store'
  // import { pan } from "svelte-hammer";

  export let visible: boolean = true
  export let stopPropagation: boolean = true
  export let tappable: boolean = true
  export let opacity: number = 0.75
  export let className: string = ''
  export let position: 'center' | 'bottom' | 'top' = 'center'
  export let id: string
  // export let swipeToClose: boolean = false; // TODO: make this work more reliably

  const dispatch = createEventDispatcher()

  let activeId: string
  let childYPos: number
  let indexLevel: number = 0
  let scale: number = 100
  let translateY: number = 0

  $: if (visible && !activeId) {
    activeId = id
    BackdropStore.add(id)
  }

  $: {
    indexLevel = $BackdropStore.findIndex((b) => b == id)
    scale = (98 - (indexLevel + 2)) / 100
    translateY = -20 / scale
  }

  $: if (!visible && activeId) {
    remove()
  }

  function remove() {
    BackdropStore.remove(activeId)
    activeId = undefined
    childYPos = 0
    dispatch('closed')
    // App.allowScroll();
  }

  function emitTap(ev: Event) {
    if (stopPropagation) {
      ev.preventDefault()
      ev.stopPropagation()
    }
    if (tappable) {
      dispatch('tap')
      remove()
    }
  }
</script>

<style global lang="postcss">
  .nui-backdrop {
    @apply fixed;
    @apply top-0;
    @apply left-0;
    @apply right-0;
    @apply bottom-0;
    @apply flex;
    @apply flex-col;
    @apply justify-center;
    @apply bg-gray-900;
    @apply bg-opacity-50;
    @apply flex-shrink-0;
    @apply flex-grow-0;
    @apply backdrop-filter backdrop-saturate-150 backdrop-blur-sm;
    padding-bottom: calc(env(safe-area-inset-bottom));
    z-index: 5000;
  }
  .nui-backdrop.nui-pos-center {
    @apply justify-center;
    @apply items-center;
  }

  .nui-backdrop--children {
    @apply pt-1;
    @apply fixed;
    @apply top-0;
    @apply left-0;
    @apply right-0;
    @apply bottom-0;
    @apply flex;
    @apply flex-col;
    @apply items-center;
    @apply justify-center;
    @apply flex-shrink-0;
    @apply flex-grow-0;
    background-color: transparent;
    z-index: 5001;
    @apply transition-all;
  }
  .nui-backdrop--children.nui-pos-bottom {
    @apply justify-end;
    @apply items-center;
  }
  .nui-backdrop--children.nui-pos-top {
    @apply justify-start;
    @apply items-center;
  }

  .nui-backdrop--children .swipe-bar {
    @apply p-2;
    @apply flex;
    @apply items-center;
    @apply justify-center;
    @apply w-full;
    @apply outline-none;
  }

  .nui-backdrop--children.in-background {
    transform: scale(var(--layer-scale)) translateY(calc(var(--layer-y) * 1px));
    @apply opacity-50;
  }
  .nui-backdrop--children .swipe-bar .swipe-bar--visual {
    background-color: var(--color-solid-100);
    @apply h-2;
    @apply rounded-full;
    @apply w-20;
  }
</style>

{#if activeId}
  <!-- Back Drop -->
  {#if $BackdropStore && $BackdropStore.length && $BackdropStore[$BackdropStore.length - 1] == id}
    <div
      id={`bd-${$BackdropStore.length}`}
      transition:fade={{ duration: 100 }}
      style="--tw-bg-opacity:{opacity}; z-index:5000;"
      class="nui-backdrop open nui-pos-{position}
      {className}"
      on:click|self={emitTap} />
  {/if}
  <!-- Back Drop Children -->
  <div
    id={`child-bd-${indexLevel}`}
    style="z-index:501{indexLevel + 1}; margin-top: {(indexLevel || 1) * 10}px;
    --layer-scale: {scale}; --layer-index: {indexLevel}; --layer-y: {translateY}"
    on:click|self={emitTap}
    class="nui-backdrop--children nui-pos-{position}
    {className}"
    class:in-background={indexLevel < $BackdropStore.length - 1}
    transition:fly|local={{ y: 300, duration: 200 }}>
    <slot />
    <div class="safe-bottom" />
  </div>
{/if}
