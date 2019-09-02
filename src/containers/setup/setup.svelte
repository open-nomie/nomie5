<script>
  /**
   * TODO: Make this design not suck! It's very boring.
   */

  // svlete
  import { slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { navigate } from "svelte-routing";

  // modules
  import Storage from "../../modules/storage/storage";

  // components
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NText from "../../components/text/text.svelte";

  // Local components
  import Slide from "./slide.svelte";

  // Stores
  import { UserStore } from "../../store/user";

  // TODO: UserSession shouldn't be in here - login should be fired by Storage.
  const UserSession = new blockstack.UserSession();

  let isMobile =
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1;

  const slide1 = {
    title: `Get to Know Yourself`,
    message: [
      "Track your mood (and literally anything else) with the tap of a button. Analyzing your life, doesn't get easier."
    ],
    img: "/images/screens/board.png"
  };

  const slide2 = {
    title: `A private data journal that will never judge`,
    img: "/images/screens/capture.png",
    message: [
      `Record your thoughts by typing a note and/or track data by tapping your own custom tracker buttons.`
    ]
  };

  const slide3 = {
    title: `Visualize your Life`,
    img: "/images/screens/stats.png",
    message: ["See when and where you did anything by day, month and year."]
  };

  const slide4 = {
    title: `Add to Home Screen`,
    img: "/images/screens/homescreen.png",
    message: [
      "If you're serious about tracking, make me easily accessible by hitting the share icon on your browser, then select 'Add to Homescreen'"
    ]
  };

  const slide5 = {
    title: `Data Encrypted with Blockstack`,
    img: "/images/screens/blockstack.png",
    message: [
      `Nomie uses Blockstack to authenticate and store encrypted user data.`,
      `With a Blockstack profile, you will be able to control where your data is stored, and know everything is being encrypted with your own private keys`,
      `What's this mean? No one but you can see your data.`
    ]
  };

  let slides = [];
  if (isMobile) {
    slides = [slide1, slide2, slide3, slide4]; //slide5
  } else {
    slides = [slide1, slide2, slide3]; //slide5
  }

  const data = {
    ready: false,
    showMore: false,
    slides: slides,
    activeSlide: 0,
    showStorageSelection: false,
    showNext: true
  };

  const methods = {
    blockstackLogin() {
      UserSession.redirectToSignIn();
    },
    toggleMore() {
      data.showMore = !data.showMore;
    },
    next() {
      data.activeSlide = data.activeSlide + 1;
      if (data.activeSlide === 5 && $UserStore.storageType === "local") {
        window.location.href = "/";
      } else if (
        data.activeSlide === 5 &&
        $UserStore.storageType === "blockstack"
      ) {
        methods.blockstackLogin();
      }
    },
    back() {
      data.activeSlide = data.activeSlide - 1;
    }
  };

  setTimeout(() => {
    data.ready = true;
    if (!Storage._storageType()) {
      // Default to blockstack Storage
      // Storage.setType("local");
    }
  }, 1000);
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  :global(.page-setup.page) {
    background-color: var(--color-primary);
    min-height: calc(100vh);
    color: #fff;
    justify-content: center;

    .slides {
      position: relative;

      border-top: solid 1px rgba(0, 0, 0, 0.1);
    }
    .logo {
      margin-bottom: 10px;
    }
  }
  .footer-buttons {
    position: fixed;
    z-index: 2000;
    bottom: 0;

    left: 0;
    right: 0;
    background-color: var(--color-primary);
    padding: 10px 20px;
    padding-bottom: env(safe-area-inset-bottom);
    box-shadow: 0px -20px 30px -15px rgba(0, 0, 0, 0.32);
    .btn {
      color: #fff;
      &:hover {
        color: #fff;
      }
    }
  }
</style>

<!-- <NToolbar>
  <NText size="sm" bold>Nomie</NText>
</NToolbar> -->

<div
  class="page page-setup p-2 d-flex flex-column h-100 justify-content-center
  align-items-center">

  <div class="p-2">
    <img
      src="/images/nomie-white-type.png"
      alt="Nomie Logo"
      width="68"
      class="logo" />
  </div>

  <!-- preload images -->
  <div class="" style="display:none;">
    {#each data.slides as slide, index}
      {#if slide.img}
        <img src={slide.img} alt={slide.title} />
      {/if}
    {/each}
  </div>

  <div class="slides">
    {#if data.activeSlide === 0}
      <Slide img={slide1.img} title={slide1.title} message={slide1.message} />
    {:else if data.activeSlide === 1}
      <Slide img={slide2.img} title={slide2.title} message={slide2.message} />
    {:else if data.activeSlide === 2}
      <Slide img={slide3.img} title={slide3.title} message={slide3.message} />
    {:else if data.activeSlide === 3}
      <Slide img={slide4.img} title={slide4.title} message={slide4.message} />
    {:else if data.activeSlide === 4}
      <Slide title="Where would you like your data stored?">

        <button
          class="my-3 mt-4 btn btn-content {$UserStore.storageType == 'blockstack' ? 'active' : ''}"
          on:click={() => {
            UserStore.setStorage('blockstack');
          }}>
          <NText size="lg">Encrypted in the Cloud</NText>
          <NText size="sm">
            Access your data on multiple devices using end-to-end encryption.
            <strong>Powered by Blockstack.</strong>
          </NText>
        </button>
        <button
          class="my-3 btn btn-content {$UserStore.storageType == 'local' ? 'active' : ''}"
          on:click={() => {
            UserStore.setStorage('local');
          }}>
          <NText size="lg">This Device Only</NText>
          <NText size="sm">
            All data is stored unencrypted, but ONLY on your device.
          </NText>
        </button>
      </Slide>
    {/if}
  </div>

</div>

<div class="footer-buttons n-row">
  {#if data.activeSlide > 0}
    <button class="btn btn-clear text-white" on:click={methods.back}>
      Back
    </button>
  {/if}
  <div class="filler" />
  {#if data.showNext}
    {#if (data.activeSlide == 4 && $UserStore.storageType) || data.activeSlide != 4}
      <button class="btn btn-white" on:click={methods.next}>Next</button>
    {/if}
  {:else}
    <!-- <button class="btn btn-white" on:click={methods.blockstackLogin}>
      Login/Register
    </button> -->
  {/if}
</div>
