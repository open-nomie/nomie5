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

  const data = {
    ready: false,
    showMore: false,
    activeSlide: 0,
    showNext: true,
    transitioning: false,
    isTiny: false,
    redirecting: false,
    timeFormat: "is12"
  };

  const methods = {
    blockstackLogin() {
      data.redirecting = true;
      UserSession.redirectToSignIn();
    },

    next() {
      if (data.activeSlide == 3 && $UserStore.storageType) {
        if ($UserStore.storageType == "local") {
          window.location.href = "/";
        } else {
          methods.blockstackLogin();
        }
      } else {
        data.activeSlide = data.activeSlide + 1;
      }
    },
    back() {
      data.activeSlide = data.activeSlide - 1;
    }
  };
  onMount(() => {
    setTimeout(() => {
      if (window.document.body.offsetHeight < 640) {
        data.isTiny = true;
      }
    }, 12);
  });
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  .page-setup.page {
    background-color: var(--color-solid);
    min-height: calc(100vh);
    max-height: calc(100vh);
    color: #fff;
    justify-content: center;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    &:before {
      // content: "";
      // z-index: 0;
      // position: absolute;
      // top: 0;
      // height: 50vh;
      // left: 0;
      // right: 0;
      // background-color: var(--color-primary);
    }
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
        color: #fff;
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
      background-color: rgb(15, 15, 15);

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
        color: #fff;
        border: solid 1px rgba(255, 255, 255, 0.5);
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
    background-color: var(--color-solid);
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
    <Logo size={16} color="#FFFFFF" />
  </div>
  <section
    class="slide slide-1 slide-welcome {data.activeSlide === 0 ? 'active' : 'hidden'}
    {data.isTiny ? 'is-tiny' : 'is-normal'}
    {data.transitioning ? 'move' : ''}">
    <div class="top center-grow">
      <h1 style="max-width:400px;">
        Track & monitor your life, with the tap of a button.
      </h1>
      <p>
        <strong>
          The
          <a
            href="https://nomie.app"
            target="_blank"
            aria-label="Learn more about Nomie">
            100% private life tracker
          </a>
          that's
          <a href="https://github.com/open-nomie/nomie">Open Source too!</a>
        </strong>
      </p>
    </div>
  </section>

  <section
    class="slide slide-2 slide-welcome {data.activeSlide === 1 ? 'active' : 'hidden'}
    {data.isTiny ? 'is-tiny' : 'is-normal'}
    {data.transitioning ? 'move' : ''}">
    <div class="top center-grow">
      <div class="bottom-pop phone-frame mt-2">
        <img
          class="image"
          alt="Nomie stats view"
          src="/images/onboard/nomie4.2.3.stats.png" />
      </div>
      <h1 style="max-width:400px;" class="mt-3">Charts, streaks & maps.</h1>
      <p>See the patterns that make you, you.</p>
    </div>

  </section>

  <section
    class="slide slide-3 slide-welcome {data.activeSlide === 2 ? 'active' : 'hidden'}
    {data.isTiny ? 'is-tiny' : 'is-normal'}
    {data.transitioning ? 'move' : ''}">
    <div class="top center-grow pt-3">

      <h1 class="mt-4">
        {Lang.t('setup.choose-time-format', `Choose your time format...`)}
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
    class="slide slide-4 slide-welcome {data.activeSlide === 3 ? 'active' : 'hidden'}
    {data.transitioning ? 'move' : ''}">
    <div class="top center-grow">

      <h1 class="mt-4">
        {Lang.t('setup.pick-data-storage', `Choose your data's location...`)}
      </h1>
      <p class="text-faded-3">
        You can always change this later.
        <a href="https://blockstack.com" class="text-white" target="_blank">
          Learn more about Blockstack
        </a>
      </p>
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

    </div>

  </section>

</main>

<div class="footer-buttons n-row">
  {#if data.activeSlide > 0}
    <button class="btn btn-clear " on:click={methods.back}>BACK</button>
  {/if}
  <div class="filler" />
  {#if (data.activeSlide == 3 && $UserStore.storageType) || data.activeSlide != 3}
    {#if !data.redirecting}
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
<!-- 
<button
  class="my-3 mt-4 btn btn-content {$UserStore.storageType == 'blockstack' ? 'active' : ''}"
  on:click={() => {
    UserStore.setStorage('blockstack');
  }}>
  <NText size="lg" className="text-white">Encrypted in the Cloud</NText>
  <NText size="sm" className="text-white">
    Access your data on multiple devices using end-to-end encryption.
    <strong>Powered by Blockstack.</strong>
  </NText>
</button>
<button
  class="my-3 btn btn-content {$UserStore.storageType == 'local' ? 'active' : ''}"
  on:click={() => {
    UserStore.setStorage('local');
  }}>
  <NText size="lg" className="text-white">This Device Only</NText>
  <NText size="sm" className="text-white">
    All data is stored unencrypted, but ONLY on your device.
  </NText>
</button> -->
