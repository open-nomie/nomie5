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
    isTiny: false
  };

  const methods = {
    blockstackLogin() {
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
      if (window.document.body.offsetHeight < 720) {
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

    .logo {
      margin-bottom: 10px;
    }
    .center-grow {
      flex-grow: 1;
      flex-shrink: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .slide {
      flex-grow: 1;
      flex-shrink: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: all 0.3s ease-in-out;
      overflow-y: scroll;
      &.active {
      }

      &.hidden {
        transition: all 0.3s ease-in-out;
        pointer-events: none;
        opacity: 0;
        height: 0px;
        max-height: 0;
        overflow: hidden;
        transform: translateY(200px);
      }

      &.is-tiny {
        background-color: green !important;
        .phone-frame {
          max-width: 120px !important;
          width: 120px !important;
          margin-bottom: -10px !important;
        }
        .top {
          max-height: 240px;
        }
      }

      .phone-frame {
        border-radius: 20px;
        border: solid 10px #000;
        border-bottom: solid 25px #000;
        box-shadow: inset 10px 10px 10px black, var(--box-shadow-float);
        position: relative;

        @include media-breakpoint-up(lg) {
          width: 300px;
          max-width: 300px;
          margin-bottom: -200px;
        }
        @include media-breakpoint-down(md) {
          max-width: 200px;
        }

        z-index: 10;
        position: relative;
        margin-bottom: -70px;
        background-color: black;
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

      .top {
        height: 50%;
        flex-direction: column;
        padding: 20px 35px 0;
        max-height: 430px;
        justify-content: flex-end;
        background-color: var(--color-primary);
        h1 {
          text-align: center;
        }
        p {
          font-size: 0.8rem;
          line-height: 1rem;
          opacity: 0.7;
          text-align: center;
        }
      }

      .bottom {
        z-index: 0;
        max-height: 50%;
        min-height: 50%;
        height: 50%;
        background-color: var(--color-solid);
        color: var(--color-inverse);
        flex-direction: column;
        padding: 0 35px;
        overflow-y: scroll;
        h1 {
          font-size: 1.5rem;
          font-weight: bolder;
          text-align: center;
        }
        p {
          text-align: center;
          color: var(--color-inverse-2);
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
    .btn {
      color: var(--color-primary);
      &:hover {
        color: var(--color-primary);
      }
    }
  }
</style>

<main class="page page-setup">

  <section
    class="slide slide-1 slide-welcome {data.activeSlide === 0 ? 'active' : 'hidden'}
    {data.isTiny ? 'is-tiny' : 'is-normal'}
    {data.transitioning ? 'move' : ''}">
    <div class="top center-grow">
      <div class="filler" />
      <Logo
        size={data.isTiny ? 12 : 24}
        color="#FFFFFF"
        className="mb-2 mp-2 flex-shrink-off fade-right" />
      <div class="filler" />
      <div class="bottom-pop phone-frame mt-2 fade-left">
        <img
          class="image gif"
          src="https://shareking.s3.amazonaws.com/nomie-4.2-homescreen.gif"
          defer />
      </div>
    </div>
    <div class="bottom center-grow">
      <h1>Track your mood & anything else, privately.</h1>
      <p>
        Add to homescreen for the best experience. Nomie is opensource
        <a
          href="https://nomie.app"
          target="_blank"
          aria-label="Learn more about Nomie">
          more...
        </a>
        .
      </p>
    </div>
  </section>

  <section
    class="slide slide-1 slide-welcome {data.activeSlide === 1 ? 'active' : 'hidden'}
    {data.isTiny ? 'is-tiny' : 'is-normal'}
    {data.transitioning ? 'move' : ''}">
    <div class="top center-grow">
      <div class="filler" />
      <Logo
        size={data.isTiny ? 12 : 24}
        color="#FFFFFF"
        className="mb-2 mp-2 flex-shrink-off fade-right" />
      <div class="filler" />
      <div class="bottom-pop phone-frame mt-2">
        <img
          class="image"
          aria-label="Nomie stats view"
          src="/images/onboard/nomie4.2.3.stats.png" />
      </div>
    </div>
    <div class="bottom center-grow">
      <h1>Monitor your progress.</h1>
      <p>
        Streaks, charts, maps, view it all. Tip: Jump into stats by
        long-pressing a tracker button.
      </p>
    </div>
  </section>

  <section
    class="slide slide-1 slide-welcome {data.activeSlide === 2 ? 'active' : 'hidden'}
    {data.isTiny ? 'is-tiny' : 'is-normal'}
    {data.transitioning ? 'move' : ''}">
    <div class="top center-grow">
      <div class="filler" />
      <Logo
        size={data.isTiny ? 12 : 24}
        color="#FFFFFF"
        className="mb-2 mp-2 flex-shrink-off fade-right" />
      <div class="filler" />
      <div class="bottom-pop phone-frame mt-2">
        <img
          class="image"
          aria-label="Nomie History view"
          src="/images/onboard/nomie-history.png" />
      </div>
    </div>
    <div class="bottom center-grow">
      <h1>Go back in time!</h1>
      <p>
        See when
        <strong>& where</strong>
        you did anything. Also, write daily notes to help remember what life was
        like.
      </p>
    </div>
  </section>

  <section
    class="slide slide-1 slide-welcome {data.activeSlide === 3 ? 'active' : 'hidden'}
    {data.transitioning ? 'move' : ''}">
    <div
      class="top center-grow"
      style={data.isTiny ? 'max-height:200px' : 'max-height:40%'}>
      <div class="filler" />
      {#if !data.isTiny}
        <Logo
          size={data.isTiny ? 12 : 24}
          color="#FFFFFF"
          className="mb-3 mp-2 flex-shrink-off fade-right" />
        <div class="filler" />
      {/if}

      <h1>Data Storage</h1>
      <p class="text-sm">Select where you'd like to store your data.</p>
      <div class="filler" />
    </div>
    <div class="bottom center-grow" style="max-height:50%">
      <button
        class="mt-5 btn btn-content {$UserStore.storageType == 'blockstack' ? 'active' : ''}"
        on:click={() => {
          UserStore.setStorage('blockstack');
        }}>
        <NText size="lg" className="">Encrypted in the Cloud</NText>
        <NText size="sm" className="">
          Access your data on multiple devices using end-to-end encryption.
          <strong>Powered by Blockstack.</strong>
        </NText>
      </button>
      <button
        class="my-3 btn btn-content {$UserStore.storageType == 'local' ? 'active' : ''}"
        on:click={() => {
          UserStore.setStorage('local');
        }}>
        <NText size="lg" className="">This Device Only</NText>
        <NText size="sm" className="">
          All data is stored unencrypted, but ONLY on your device.
        </NText>
      </button>
      <div class="text-center text-sm text-faded-2">
        You can always switch storage types later.
      </div>
      <div class="filler" />
    </div>
  </section>

</main>

<div class="footer-buttons n-row">
  {#if data.activeSlide > 0}
    <button class="btn btn-clear font-weight-bold" on:click={methods.back}>
      BACK
    </button>
  {/if}
  <div class="filler" />
  {#if (data.activeSlide == 3 && $UserStore.storageType) || data.activeSlide != 3}
    <button class="btn btn-white font-weight-bold" on:click={methods.next}>
      NEXT
    </button>
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
