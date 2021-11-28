<script lang="ts">
  import Backdrop from '@/components/backdrop/backdrop.svelte'
  import { useRegisterSW } from 'virtual:pwa-register/svelte'

  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(swr: ServiceWorkerRegistration) {
      console.log(`SW registered`, {
        installing: swr.installing,
        active: swr.active,
        scope: swr.scope,
      })
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  })

  function close() {
    offlineReady.set(false)
    needRefresh.set(false)
  }

  $: toast = $needRefresh
</script>

<style>
  .pwa-toast {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 16px;
    @apply p-4;
    border: 1px solid #8885;
    border-radius: 4px;
    z-index: 1;
    text-align: left;
    @apply shadow-xl;
    @apply bg-primary-500;
    @apply text-white;
    @apply rounded-xl;
  }
</style>

<Backdrop visible={toast ? true : false} id="update-avail">
  <div class="pwa-toast" role="alert">
    <div
      class="px-2 pb-2 mb-2 text-lg font-medium leading-snug text-black message">
      {#if $offlineReady}
        <span>App ready to work offline</span>
      {:else if $needRefresh}
        <h1 class="mb-2 text-2xl font-bold text-black">🎉 Update Available</h1>
        <p>Look at that! A new version of Nomie is ready to use.</p>
      {/if}
    </div>

    <div class="flex items-center justify-end space-x-4">
      <button
        class="px-4 py-2 font-bold bg-white shadow-sm rounded-xl text-primary-600"
        on:click={close}>
        Later
      </button>

      {#if $needRefresh}
        <button
          aria-label="Update the App"
          on:click={() => updateServiceWorker(true)}
          class="px-4 py-2 font-bold bg-white shadow-sm rounded-xl text-primary-600">
          Update Now
        </button>
      {/if}

    </div>
  </div>
</Backdrop>
