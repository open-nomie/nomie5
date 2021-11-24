<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Backdrop from '../backdrop/backdrop.svelte'

  export let className: string = ''
  export let style: string = ''
  export let tappable: boolean = false
  export let visible: boolean = false
  export let position: 'center' | 'bottom' | 'top' = 'center'
  export let id: string

  const dispatch = createEventDispatcher()

  function backgroundTapped() {
    if (tappable) {
      dispatch('close')
    }
  }
</script>

<style global>
  .nui-modal {
    @apply relative;
    @apply w-full;
    @apply max-w-screen-sm;
    @apply z-40;
    @apply flex-grow;
    @apply flex-shrink;
    @apply overflow-hidden;
    @apply bg-gray-50 dark:bg-gray-800;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.21);
    min-width: 300px;
    max-width: 500px;
    width: 97vw;
    height: calc(100vh - 40px);
    max-height: 700px;
  }

  .nui-modal.bottom {
    /* max-height:500px; */
    @apply items-end;
    @apply flex-grow-0;
    @apply flex-shrink-0;
    @apply rounded-b-none;
    @apply h-auto;
    max-height: 98vh;
  }
  /* .nui-modal::before {
    pointer-events: none;
    content: '';
    opacity: 0;
    @apply absolute;
    @apply top-0;
    @apply left-0;
    @apply bottom-0;
    @apply right-0;
    @apply bg-black;
    @apply z-10;
    transition: all 0.2s ease-in-out;
  } */
  .in-background .nui-modal::before {
    @apply rounded-2xl;
    transition: all 0.2s ease-in-out;
    opacity: 0.2;
  }
</style>

<Backdrop {id} bind:visible {tappable} {position} on:tap={backgroundTapped}>
  <div
    class:bottom={position == 'bottom'}
    class="nui-modal {className} md:rounded-2xl md:rounded-b-2xl rounded-2xl
    rounded-b-none"
    {style}>
    <slot />
  </div>
</Backdrop>
