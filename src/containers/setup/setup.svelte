<script>
  /**
   * TODO: Make this design not suck! It's very boring.
   */
  import { onMount } from "svelte";

  // modules
  import Storage from "../../modules/storage/storage";
  import Tracker from "../../modules/tracker/tracker";

  // components
  import TrackerButton from "../../containers/board/tracker-button.svelte";
  import NText from "../../components/text/text.svelte";
  import Logo from "../../components/logo/logo.svelte";

  import dayjs from "dayjs";

  // Local components

  // Stores
  import { UserStore } from "../../store/user";
  import { Lang } from "../../store/lang";

  // TODO: UserSession shouldn't be in here - login should be fired by Storage.
  const UserSession = new blockstack.UserSession();

  let isMobile =
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1;

  const state = {
    ready: false,
    showMore: false,
    activeSlide: 0,
    showNext: true,
    transitioning: false,
    isTiny: false,
    redirecting: false,
    timeFormat: "is12",
    theme: UserStore.getTheme()
  };

  let testValue = 0;
  function testTrackerTap() {
    testValue++;
  }

  const methods = {
    blockstackLogin() {
      state.redirecting = true;
      UserSession.redirectToSignIn();
    },

    next() {
      if (state.activeSlide == 4 && $UserStore.storageType) {
        if ($UserStore.storageType == "local") {
          window.location.href = "/";
        } else {
          methods.blockstackLogin();
        }
      } else {
        state.activeSlide = state.activeSlide + 1;
      }
    },
    back() {
      state.activeSlide = state.activeSlide - 1;
    }
  };
  onMount(() => {
    setTimeout(() => {
      if (window.document.body.offsetHeight < 640) {
        state.isTiny = true;
      }
    }, 12);
  });
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  .page-setup.page {
    --local-background: var(--color-bg);

    background-color: var(--local-background);
    min-height: calc(100vh);
    max-height: calc(100vh);
    color: var(--color-inverse);
    justify-content: center;
    display: flex;
    flex-direction: column;
    justify-content: stretch;

    .logo {
      margin-bottom: 10px;
    }
    .center-grow {
      flex-grow: 1;
      flex-shrink: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      a {
        color: var(--color-inverse);
        border-bottom: dotted 1px #ccc;
      }
    }

    .slide {
      z-index: 10;
      flex-grow: 1;
      flex-shrink: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: all 0.3s ease-in-out;
      background-color: var(--local-background);

      &.active {
      }

      &.hidden {
        transition: all 0.3s ease-in-out;
        pointer-events: none;
        opacity: 0;
        height: 0px;
        max-height: 0;
        overflow: hidden;
        transform: translateY(-100px);
      }

      &.is-tiny {
        .phone-frame {
          max-width: 146px !important;
          width: 146px !important;
        }
        .bottom {
          max-height: 271px;
        }
        h1 {
          line-height: 116%;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          z-index: 30;
        }
        p {
          font-size: 0.8rem;
          line-height: 116%;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
      }

      .phone-frame {
        border-radius: 20px;
        border: solid 10px #000;
        border-bottom: solid 25px #000;
        box-shadow: inset 10px 10px 10px black, var(--box-shadow-float);
        position: relative;

        @include media-breakpoint-up(md) {
          width: 220px;
          max-width: 220px;
          .filler {
            max-height: 20px;
          }
        }
        @include media-breakpoint-down(sm) {
          max-width: 180px;
          flex-grow: 0;
          flex-shrink: 0;
        }

        @include media-breakpoint-down(xs) {
          max-width: 120px;
          flex-grow: 0;
          flex-shrink: 0;
        }

        z-index: 10;
        position: relative;
        background-color: var(--color-primary);
        .gif,
        .image {
          background-color: black;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
        }
        &:after {
          content: "";
          position: absolute;
          height: 10px;
          bottom: -30px;
          left: -10px;
          right: -10px;
          border-radius: 20px;
          background-color: rgba(0, 0, 0, 0.1);
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
      }

      .btn-content {
        color: var(--color-inverse);
        box-shadow: var(--box-shadow-float);
        background-color: var(--color-solid);
        border: none;
        &.active {
          background-color: var(--color-primary-bright);
          color: #fff;
        }
      }

      .top {
        flex-direction: column;
        padding: 20px 35px 0;
        padding-top: env(safe-area-inset-top) !important;
        flex-grow: 0;
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
        height: calc(100vh - 50px);
        // background-color: var(--color-primary);
        h1 {
          text-align: center;
          padding-top: env(safe-area-inset-top);
        }
        p {
          font-size: 0.8rem;
          line-height: 1rem;
          opacity: 0.7;
          text-align: center;
        }
      }
      @include media-breakpoint-up(md) {
        .mobile-message {
          display: none;
        }
      }
      .bottom {
        z-index: 0;
        flex-grow: 0;
        flex-shrink: 0;
        height: calc(50vh - 20px);
        // background-color: var(--color-solid);

        flex-direction: column;
        padding: 0 16px;

        h1 {
          font-size: 1.5rem;
          font-weight: bolder;
          text-align: center;
          @include media-breakpoint-down(xs) {
            font-size: 1.2rem;
          }
        }
        p {
          font-size: 0.8rem;
          line-height: 120%;
          text-align: center;
          color: var(--color-inverse-3);
          @include media-breakpoint-down(xs) {
            font-size: 0.7rem;
          }
          a {
            color: var(--color-primary);
          }
        }
      }
    }
  }
  .footer-buttons {
    position: fixed;
    z-index: 2000;
    bottom: 0;
    min-height: 50px;
    left: 0;
    right: 0;
    background-color: var(--local-background);
    padding: 10px 20px;
    @include media-breakpoint-up(md) {
      padding: 20px 30px;
    }
    .btn {
      color: var(--color-primary-bright);
      &:hover {
        color: var(--color-primary);
      }
      @include media-breakpoint-up(md) {
        font-size: 1.2rem;
      }
    }
  }
  .logo-holder {
    position: absolute;
    padding-top: env(safe-area-inset-top);
    top: 16px;
    left: 16px;
    right: 16px;
    z-index: 20;
    display: flex;
    justify-content: center;
  }
</style>

<main class="page page-setup">
  <div class="logo-holder">
    <Logo size={16} color="#CCC" />
  </div>
  <section
    class="slide slide-1 slide-welcome {state.activeSlide === 0 ? 'active' : 'hidden'}
    {state.isTiny ? 'is-tiny' : 'is-normal'}
    {state.transitioning ? 'move' : ''}">
    <div class="top center-grow">
      <TrackerButton
        on:click={testTrackerTap}
        tracker={{ label: 'Tap Me!', emoji: '😊' }}
        value={testValue} />
      <h1 style="max-width:400px; mt-3">
        Track your mood & habits with the tap of a button.
      </h1>
      <p>
        <strong>100% private</strong>
        &
        <a href="https://github.com/open-nomie/nomie">open source.</a>

      </p>
    </div>
  </section>

  <section
    class="slide slide-2 slide-welcome {state.activeSlide === 1 ? 'active' : 'hidden'}
    {state.isTiny ? 'is-tiny' : 'is-normal'}
    {state.transitioning ? 'move' : ''}">
    <div class="top center-grow">
      <div class="bottom-pop phone-frame mt-2">
        <img
          class="image"
          alt="Nomie stats view"
          src="/images/onboard/nomie4.2.3.stats.png" />
      </div>
      <h1 style="max-width:400px;" class="mt-3">Charts, Streaks, Maps</h1>
      <p>Your life visualized</p>
    </div>

  </section>

  <section
    class="slide slide-3 slide-welcome {state.activeSlide === 2 ? 'active' : 'hidden'}
    {state.isTiny ? 'is-tiny' : 'is-normal'}
    {state.transitioning ? 'move' : ''}">
    <div class="top center-grow pt-3">

      <h1 class="mt-4">{Lang.t('setup.choose-theme', `Choose your Theme`)}</h1>
      <button
        class="btn-block my-3 btn btn-content {state.theme == 'light' ? 'active' : ''}"
        on:click={() => {
          UserStore.setTheme('light');
          state.theme = 'light';
        }}>
        <div class="text-lg">Light</div>
      </button>
      <button
        class="btn-block my-3 btn btn-content {state.theme == 'dark' ? 'active' : ''}"
        on:click={() => {
          UserStore.setTheme('dark');
          state.theme = 'dark';
        }}>
        <div class="text-lg">Dark</div>
      </button>
      <button
        class="btn-block my-3 btn btn-content {state.theme == 'auto' ? 'active' : ''}"
        on:click={() => {
          UserStore.setTheme('auto');
          state.theme = 'auto';
        }}>
        <div class="text-lg">Automatic</div>
      </button>
    </div>

  </section>

  <section
    class="slide slide-3 slide-welcome {state.activeSlide === 3 ? 'active' : 'hidden'}
    {state.isTiny ? 'is-tiny' : 'is-normal'}
    {state.transitioning ? 'move' : ''}">
    <div class="top center-grow pt-3">

      <h1 class="mt-4">
        {Lang.t('setup.choose-time-format', `Choose Time Format`)}
      </h1>
      <button
        class="btn-block my-3 btn btn-content {$UserStore.meta.is24Hour ? 'active' : ''}"
        on:click={() => {
          $UserStore.meta.is24Hour = true;
          UserStore.saveMeta();
        }}>
        <div class="text-lg">{dayjs().format('HH:mm')}</div>
      </button>
      <button
        class="btn-block my-3 btn btn-content {!$UserStore.meta.is24Hour ? 'active' : ''}"
        on:click={() => {
          $UserStore.meta.is24Hour = false;
          UserStore.saveMeta();
        }}>
        <div class="text-lg">{dayjs().format('h:mm a')}</div>
      </button>
    </div>

  </section>

  <section
    class="slide slide-4 slide-welcome {state.activeSlide === 4 ? 'active' : 'hidden'}
    {state.transitioning ? 'move' : ''}">
    <div class="top center-grow">

      <h1 class="mt-4">
        {Lang.t('setup.pick-data-storage', `Choose your data's location...`)}
      </h1>
      <button
        class=" btn btn-content {$UserStore.storageType == 'local' ? 'active' : ''}"
        on:click={() => {
          UserStore.setStorage('local');
        }}>
        <div class="text-md font-weight-bold">On this Device Only</div>
        <div class="text-sm" className="">
          Stored unencrypted ONLY on this device.
        </div>
      </button>
      <button
        class="btn btn-content {$UserStore.storageType == 'blockstack' ? 'active' : ''}"
        on:click={() => {
          UserStore.setStorage('blockstack');
        }}>
        <div class="text-md font-weight-bold">Encrypted in the Cloud</div>
        <div class="text-sm">
          Multiple device support with end-to-end encryption
          <strong>by Blockstack.</strong>
        </div>
      </button>
      <p class="text-faded-3">
        You can always change this later.
        <a href="https://blockstack.com" target="_blank">
          Learn more about Blockstack
        </a>
      </p>
    </div>

  </section>

</main>

<div class="footer-buttons n-row">
  {#if state.activeSlide > 0}
    <button class="btn btn-clear " on:click={methods.back}>BACK</button>
  {/if}
  <div class="filler" />
  {#if (state.activeSlide == 4 && $UserStore.storageType) || state.activeSlide != 4}
    {#if !state.redirecting}
      <button class="btn btn-clear " on:click={methods.next}>
        <strong>NEXT</strong>
      </button>
    {:else}
      <button class="btn btn-clear disabled" disabled="true">
        <strong>Redirecting...</strong>
      </button>
    {/if}
  {/if}
</div>
