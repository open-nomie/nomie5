<script>
  // svlete
  import { slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  // components
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NText from "../components/text/text.svelte";

  //vendors
  import Spinner from "svelte-spinner";
  const UserSession = new blockstack.UserSession();

  let isMobile =
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1;

  const slide1 = {
    title: `I'm here to help you get to know yourself. 100% private & without judgement.`,
    img: "/images/screens/board.png",
    message: []
  };

  const slide2 = {
    title: `I'm like a private dairy, with hashtag analytics.`,
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
    title: `For the best experience, add me to your Home Screen.`,
    img: "/images/screens/homescreen.png",
    message: [
      "Hit the share icon on your browser, and select 'Add to Homescreen' before you sign in with Blockstack."
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
    slides = [slide1, slide2, slide3, slide4, slide5];
  } else {
    slides = [slide1, slide2, slide3, slide5];
  }

  const data = {
    ready: false,
    showMore: false,
    slides: slides,
    activeSlide: 0
  };

  const methods = {
    blockstackLogin() {
      UserSession.redirectToSignIn();
    },
    toggleMore() {
      data.showMore = !data.showMore;
    },
    next() {
      if (data.activeSlide === data.slides.length - 1) {
        alert("At the end");
      } else {
        data.activeSlide = data.activeSlide + 1;
      }
    },
    back() {
      if (data.activeSlide === 0) {
        alert("At the end");
      } else {
        data.activeSlide = data.activeSlide - 1;
      }
    }
  };

  setTimeout(() => {
    data.ready = true;
  }, 1000);
</script>

<style lang="scss">
  @import "../scss/utils/_utils";
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

      .slide {
        padding: 20px 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
        max-width: 400px;
        height: 100vh;
        max-height: 700px;
        overflow: scroll;

        img {
          max-width: 100%;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0px 10px 15px -8px rgba(0, 0, 0, 0.32);
          flex-shrink: 0;
          flex-grow: 0;
        }

        h1 {
          font-size: 1.6rem;
          margin-top: 40px;
          font-weight: bolder;
        }
        .content {
          padding: 20px 0;
        }
      }
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

  <img src="/images/nomie-white-type.png" class="logo" />

  <!-- preload images -->
  <div class="" style="display:none;">
    {#each data.slides as slide, index}
      {#if slide.img}
        <img src={slide.img} alt={slide.title} />
      {/if}
    {/each}
  </div>

  <div class="slides">
    {#each data.slides as slide, index}
      {#if index == data.activeSlide}
        <div class="slide" transition:slide>
          {#if slide.img}
            <div>
              <img src={slide.img} width="100%" alt={slide.title} />
            </div>
          {/if}
          <h1>{slide.title}</h1>
          <div class="content">
            {#if slide.message.length}
              {#each slide.message as message, mi}
                <p>{message}</p>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    {/each}
  </div>

</div>

<div class="footer-buttons n-row">
  {#if data.activeSlide > 0}
    <button class="btn btn-clear text-white" on:click={methods.back}>
      Back
    </button>
  {/if}
  <div class="filler" />
  {#if data.activeSlide !== data.slides.length - 1}
    <button class="btn btn-white" on:click={methods.next}>Next</button>
  {:else}
    <button class="btn btn-white" on:click={methods.blockstackLogin}>
      Login/Register
    </button>
  {/if}
</div>
