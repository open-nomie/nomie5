<script>
  import { onMount } from 'svelte'

  // modules

  // components

  import NStepper from '../../components/stepper/stepper.svelte'

  import Logo from '../../components/logo/logo.svelte'

  // Slides
  import WelcomeSlide from './slide-welcome.svelte'
  import PWASlide from './slide-pwa-install.svelte'
  import ThemeSlide from './slide-theme.svelte'
  import TimeFormatSlide from './slide-time-format.svelte'
  import FirstDayOfWeekSlide from './slide-first-day-of-week.svelte'
  import LocationSlide from './slide-location.svelte'
  import StorageSlide from './slide-storage.svelte'

  import NLayout from '../layout/layout.svelte'

  // Local components

  // Stores
  import { UserStore } from '../../store/user-store'
  import { Device } from '../../store/device-store'
  import { Interact } from '../../store/interact'
  import Button from '../../components/button/button.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'


  const state = {
    ready: false,
    showMore: false,
    activeSlide: 0,
    showNext: true,
    transitioning: false,
    isTiny: false,
    redirecting: false,
    timeFormat: 'is12',
    theme: UserStore.getTheme(),
  }

  let slides = [WelcomeSlide]
  if (Device.iOS() && !$Device.pwa) {
    slides.push(PWASlide)
  }
  slides.push(ThemeSlide)
  slides.push(TimeFormatSlide)
  slides.push(FirstDayOfWeekSlide)
  slides.push(LocationSlide)
  slides.push(StorageSlide)

  const methods = {
    // blockstackLogin() {
    //   state.redirecting = true;
    //   UserSession.redirectToSignIn();
    // },

    async next() {
      if (slides[state.activeSlide] == StorageSlide && $UserStore.storageType) {
        if ($UserStore.storageType == 'local') {
          window.location.href = '/'
        } else {
          // methods.blockstackLogin()
        }
      } else if (slides[state.activeSlide] == PWASlide) {
        // If nexting on the PWA Slide throw a message
        let confirmed = await Interact.confirm(
          'Are you sure?',
          'Nomie is best installed as an iOS Web App, not ran in Safari. Apple can erase data older than 7 days.',
        )
        if (confirmed) {
          state.activeSlide = state.activeSlide + 1
        }
      } else {
        if (state.activeSlide < slides.length) {
          state.activeSlide = state.activeSlide + 1
        }
      }
    },
    back() {
      state.activeSlide = state.activeSlide - 1
    },
  }
  onMount(() => {
    setTimeout(() => {
      if (window.document.body.offsetHeight < 640) {
        state.isTiny = true
      }
    }, 12)
  })
</script>

<NLayout
  pageTitle="Nomie"
  className="bg-gray-200 dark:bg-gray-900"
  showTabs={false}>
  <div slot="header">
    <ToolbarGrid>
      <div slot="main">
        <Logo size={16} color="#CCC" />
      </div>
    </ToolbarGrid>
  </div>

  <main
    slot="content"
    class="flex items-center justify-center h-full setup-main">
    <svelte:component this={slides[state.activeSlide]} />
  </main>
  <div slot="footer">
    <ToolbarGrid className="px-4 py-3">
      <div slot="left">
        {#if state.activeSlide > 0}
          <Button
            color="clear"
            className="text-primary-600 px-2"
            on:click={methods.back}>
            Back
          </Button>
        {/if}
      </div>
      <NStepper
        steps={slides.length}
        stepClass="primary-bright"
        current={state.activeSlide} />

      <div slot="right">
        {#if (slides[state.activeSlide] == StorageSlide && $UserStore.storageType) || slides[state.activeSlide] != StorageSlide}
          {#if !state.redirecting}
            <Button
              color="clear"
              className="text-primary-600 px-2"
              on:click={methods.next}>
              {#if state.activeSlide == 0}I&nbsp;agree{:else}Next{/if}
            </Button>
          {:else}
            <button class="btn btn-clear disabled right" disabled={true}>
              <strong>Redirecting...</strong>
            </button>
          {/if}
        {/if}
      </div>
    </ToolbarGrid>

  </div>
</NLayout>
