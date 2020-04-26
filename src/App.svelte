<script>
  // Svelte
  import { Router, Route, navigate } from "svelte-routing";
  import { onMount } from "svelte";
  import dayjs from "dayjs";

  // Vendors
  import Spinner from "./components/spinner/spinner.svelte";
  import { gestures } from "@composi/gestures";

  // Containers
  import AppTabs from "./containers/layout/tabs.svelte";
  import Interactions from "./containers/interactions/interactions.svelte";
  import LibraryModal from "./containers/library/library.svelte";
  import PersonModal from "./containers/people/person-modal.svelte";
  import Modal from "./components/modal/modal.svelte";
  import StatsModal from "./containers/stats/stats-modal.svelte";
  import StreakModal from "./containers/steak/streak-modal.svelte";

  import SetupRoute from "./routes/setup.svelte";

  // Utils
  import Logger from "./utils/log/log";

  import RouterView from "./routes/routes.svelte";

  // Stores
  import { UserStore } from "./store/user"; //  user auth and state
  import { Interact } from "./store/interact"; //  global alerts, popmenus, confirms, etc
  import { BoardStore } from "./store/boards"; // board state  and methods
  import { TrackerStore } from "./store/tracker-store"; // tracker state and methods
  import { TrackerLibrary } from "./store/tracker-library";
  import { CommanderStore } from "./store/commander"; // commander - /?note=hi&lat=35&lng=-81.32
  import { NomieAPI } from "./store/napi"; // Store for interacting with the Nomie API
  import { PeopleStore } from "./store/people-store"; // Store for holding People
  import { ContextStore } from "./store/context-store"; // Store for holding Post Context (categories)

  import config from "../config/global";

  // Set a better console
  const console = new Logger("App.svelte");
  gestures();

  /**
   * Day / Time Change Monitoring
   * Fire off the MinuteChecker30 every 30 minutes
   * This will check if the day changed
   */
  let todayCheckPeriod = 1000 * 60 * 10;
  let todayCheckFormat = "YYYY-MM-DD";
  let todayKey = dayjs().format(todayCheckFormat);
  let newDay = false; // View reacts to this value

  // Check every X minutes
  const todayCheckInteval = setInterval(() => {
    // Get now key
    let checkKey = dayjs().format(todayCheckFormat);
    // Compare now key to today key
    if (todayKey !== checkKey) {
      // It's new - trigger some reactions
      newDay = true;
      // Show toast notification
      Interact.toast(`It's ${dayjs().format("dddd")}!`);
      // Set today key to check key
      todayKey = checkKey;
      // Wait 500 ms
      setTimeout(() => {
        newDay = false;
      }, 500);
    }
    // Check if the theme has Changed
    methods.setDocParams();
  }, todayCheckPeriod);

  const appVersion = "APP_VERSION";

  // This should be reworked
  $: if (window && $TrackerStore && !window.$TrackerStore) {
    window.$TrackerStore = $TrackerStore;
  }

  // Offline monitor
  let offline = false;

  const methods = {
    hideSplashScreen() {
      document.querySelectorAll(".delete-on-app").forEach(d => {
        d.classList.add("deleted");
        setTimeout(() => {
          d.remove();
        }, 500);
      });
    },
    setDocParams(options) {
      let isDarkMode = window.matchMedia("(prefers-color-scheme: dark)")
        .matches;
      // let isDarkMode = false;
      let theme = localStorage.getItem(config.theme_key) || "auto";
      if (theme === "auto" && isDarkMode) {
        document.body.classList.add("theme-dark");
      } else if (theme === "auto") {
        document.body.classList.add("theme-light");
      } else {
        document.body.classList.add(`theme-${theme}`);
      }
      methods.hideSplashScreen();
    }
  };

  /**
   * App to Forground
   *
   * Document Change State Monitoring
   * In hopes of triggering events when the
   * state of the window changes be it from
   * the browser, or switching apps on a phone
   *
   * it kinda works.
   */
  let hidden, visibilityChange, router;
  if (typeof document.hidden !== "undefined") {
    // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }
  // document.addEventListener(
  //   visibilityChange,
  //   () => {
  //     methods.setDocParams({ hidden });
  //   },
  //   false
  // );

  /**
   *
   * WINDOW LISTENERS
   * GLoBaL StUFFs!
   *
   */

  window.addEventListener("load", () => {
    let onNetworkChange = event => {
      if (navigator.onLine) {
        document.body.classList.remove("is-offline");
        offline = false;
      } else {
        document.body.classList.add("is-offline");
        offline = true;
      }
    };
    window.addEventListener("online", onNetworkChange);
    window.addEventListener("offline", onNetworkChange);
    methods.setDocParams();
  });

  /**
   * Scroll Monitoring
   * adds a window var and class to body that denotes scrolling
   * this will used to stop events from happening on tracker buttons
   * when the user is scrolling
   */
  window.scrolling = false;
  let scollingTimeout;
  window.addEventListener(
    "scroll",
    event => {
      // Clear our timeout throughout the scroll
      window.clearTimeout(scollingTimeout);
      // Set a timeout to run after scrolling ends
      scollingTimeout = setTimeout(function() {
        document.body.classList.remove("scrolling");
      }, 200);
      document.body.classList.add("scrolling");
    },
    false
  );

  /**
   * Lastly...
   *
   * USER SETUP
   * Main Script to initialize the user
   *
   */

  UserStore.initialize();
  let ready = false;

  // Used to make sure that boards and trackers are loaded
  UserStore.onReady(() => {
    // Set the user if they're logged in
    ready = true;
    PeopleStore.init();
    ContextStore.init();
    // Run any commands if needed
    setTimeout(() => {
      // If there are any URL caommands, it will run here.
      CommanderStore.run();
      // If they have the API - it will load here
      NomieAPI.load();
    }, 500);
  });

  // onMount(() => {});
</script>

{#if $UserStore.signedIn === true && !newDay}
  <RouterView />
{:else if $UserStore.signedIn == undefined || newDay}
  <div class="empty-notice" style="height:calc(100vh - 75px)">
    <Spinner />
  </div>
{:else if $UserStore.signedIn === false}
  <SetupRoute />
{/if}

<!-- Global Modals, alerts, menus, etc-->
{#if $Interact.stats.terms.length}
  <StatsModal />
{/if}
{#if $TrackerLibrary.show}
  <LibraryModal />
{/if}
{#if $Interact.people.active}
  <PersonModal />
{/if}
{#if $Interact.blocker.show}
  <div id="ui-blocker" class="full-screen bg-translucent n-panel center-all">
    <Spinner size="16" />
    <span class="text-white ml-2">{$Interact.blocker.message}</span>
  </div>
{/if}
<Interactions />
<StreakModal />
{#if $UserStore.storageType == 'blockstack' && offline}
  <div class="offline-notice">
    No connection to Blockstack. Avoid tracking while offline.
  </div>
{/if}
<div id="photo-holder">
  <img id="photo-holder-image" alt="avatar-holder" />
</div>
