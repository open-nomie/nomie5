<script>
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

  //vendors
  import Spinner from "svelte-spinner";
  const UserSession = new blockstack.UserSession();

  let isMobile =
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1;

  const slide1 = {
    title: `Get to know yourself`,
    message: [
      "Hi, I'm Nomie! I was created to help you track, monitor and understand your mood + everything else that affects it."
    ],
    img: "/images/screens/board.png"
  };

  const slide2 = {
    title: `I'm like a private diary, with hashtag analytics.`,
    img: "/images/screens/capture.png",
    message: [
      `Record and analyize your thoughts by typing or tapping your own custom trackers.`
    ]
  };

  const slide3 = {
    title: `Stats by year, month, day, streaks, locations, and more...`,
    img: "/images/screens/stats.png",
    message: []
  };

  const slide4 = {
    title: `Yo! Add me to your Home Screen!`,
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
      Storage.setType("blockstack");
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

    .logo {
      max-width: 120px;
    }

    .slides {
      position: relative;
      padding-bottom: 60px;
    }

    .logo {
      width: 60px;
      position: fixed;
      opacity: 0.5;
      top: 26px;
      left: calc(50% - 30px);
    }
  }
  .footer-buttons {
    position: fixed;
    z-index: 2000;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--color-primary);
    padding: 20px;
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

  <img src="/images/nomie-white-type.png" alt="Nomie Logo" class="logo" />

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
      <Slide title="Where would you like to store your data?">
        <button
          class="btn btn-content {$UserStore.storageType == 'blockstack' ? 'active' : ''}"
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
          class="btn btn-content {$UserStore.storageType == 'local' ? 'active' : ''}"
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
    <button class="btn btn-white" on:click={methods.next}>Next</button>
  {:else}
    <!-- <button class="btn btn-white" on:click={methods.blockstackLogin}>
      Login/Register
    </button> -->
  {/if}
</div>
