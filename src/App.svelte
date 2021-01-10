<script>
  // Svelte
  // import { Router, Route, navigate } from "svelte-routing";
  import { onMount } from "svelte";
  import dayjs from "dayjs";

  // Vendors
  import Spinner from "./components/spinner/spinner.svelte";
  import * as ComposiGestures from "@composi/gestures";

  // Containers
  import Interactions from "./containers/interactions/interactions.svelte";
  import LibraryModal from "./containers/library/library.svelte";
  import PersonModal from "./containers/people/person-modal.svelte";
  // import Modal from "./components/modal/modal.svelte";
  import StatsModal from "./containers/stats/stats-modal.svelte";
  import StreakModal from "./containers/steak/streak-modal.svelte";
  import WhatsNewModal from "./containers/whats-new/whats-new-modal.svelte";
  import OnThisDayModal from "./containers/on-this-day/on-this-day.svelte";

  import SetupRoute from "./routes/setup.svelte";

  // Utils
  import Logger from "./utils/log/log";

  import RouterView from "./routes/routes.svelte";

  // Stores
  import { UserStore } from "./store/user-store"; //  user auth and state
  import { Interact } from "./store/interact"; //  global alerts, popmenus, confirms, etc
  // import { BoardStore } from "./store/boards"; // board state  and methods
  import { Device } from "./store/device-store"; // board state  and methods
  import { TrackerStore } from "./store/tracker-store"; // tracker state and methods
  import { TrackerLibrary } from "./store/tracker-library";
  import { CommanderStore } from "./store/commander"; // commander - /?note=hi&lat=35&lng=-81.32

  import { PeopleStore } from "./store/people-store"; // Store for holding People
  import { ContextStore } from "./store/context-store"; // Store for holding Post Context (categories)
  import { DashboardStore } from "./store/dashboard-store"; // Store for holding Post Context (categories)
  // import { AppStore } from "./store/app-store";
  import { Locations } from "./store/locations";
  import config from "./config/appConfig";
  import { OfflineQueue } from "./store/offline-queue-store";
  import SearchModal from "./containers/search/search.svelte";
  // import Storage from "./containers/storage/storage.svelte";
  // import Storage from "./modules/storage/storage";
  import { LastUsed } from "./store/last-used";
  import { SearchStore } from "./store/search-store";
  import PinLock from "./containers/pin-lock/pin-lock.svelte";
  import tick from "./utils/tick/tick";
  import Confetti from "./components/confetti/confetti.svelte";
  import FocusedEditor from "./components/capture-log/focused.svelte";
  import { LedgerStore } from "./store/ledger";
  import ProgressBar from "./components/progress-bar/progress-bar.svelte";
  import { ApiStore } from "./containers/api/api-store";

  // Set a better console
  const console = new Logger("APP");

  ComposiGestures.default.gestures();

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
      LedgerStore.getToday();
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

  const methods = {
    hideSplashScreen() {
      document.querySelectorAll(".delete-on-app").forEach((d) => {
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
      let theme_accent =
        localStorage.getItem(`${config.theme_key}-accent`) || "default";
      let font_size = localStorage.getItem("font-size") || "md";
      document.body.className = "";
      if (theme === "auto" && isDarkMode) {
        document.body.classList.add("theme-dark");
      } else if (theme === "auto") {
        document.body.classList.add("theme-light");
      } else {
        document.body.classList.add(`theme-${theme}`);
      }
      document.body.classList.add(`font-size-${font_size}`);
      document.body.classList.add(theme_accent);
      tick(100, methods.hideSplashScreen);
    },
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
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  window.addEventListener("load", () => {
    methods.setDocParams();
  });

  let ready = false;

  // Used to make sure that boards and trackers are loaded
  UserStore.onReady(async () => {
    console.log("🌳🌳🌳🌳🌳 Welcome to NOMIE APP_VERSION 🌳🌳🌳🌳🌳");
    // Set the user if they're logged in
    ready = true;
    PeopleStore.init(); // Initialize the People Store
    Locations.init(); // Initialize Location Store
    ContextStore.init(); // check if this is a new version
    DashboardStore.init(); // Initilize Dashboards
    Device.init(); // Initialize Device
    LastUsed.init();
    SearchStore.init();

    // Run any commands if needed
    setTimeout(() => {
      // Pull upp the offline queue

      // If there are any URL caommands, it will run here.
      CommanderStore.run();
      // If they have the API - it will load here
      // NomieAPI.load();
      ApiStore.init();
    }, 500);
  });

  // Initialize Offline Queue regardless if we're offline
  OfflineQueue.init();

  onMount(() => {
    UserStore.initialize();
  });
</script>

{#if !ready && $UserStore.signedIn === false}
  <SetupRoute />
{/if}

<!-- {#if ready} -->
{#if $UserStore.signedIn === true && !newDay}
  <RouterView />
  <WhatsNewModal />
{:else if $UserStore.signedIn == undefined || newDay}
  <div class="empty-notice" style="height:calc(100vh - 75px)">
    <Spinner />
  </div>
{/if}

<!-- Global Modals, alerts, menus, etc-->
{#if ready && $Interact.stats.terms.length}
  <StatsModal />
{/if}
{#if ready && $TrackerLibrary.show}
  <LibraryModal />
{/if}
{#if ready && $Interact.people.active}
  <PersonModal />
{/if}
{#if $Interact.blocker.show}
  <div id="ui-blocker" class="full-screen bg-translucent n-panel center-all">
    <div style="min-width:200px;">
      <div class="my-3 ml-2 text-center text-white">
        {#if !$Interact.blocker.percent}
          <Spinner size="16" />
        {/if}
        {$Interact.blocker.message}
      </div>
      {#if $Interact.blocker.percent}
        <ProgressBar percentage={$Interact.blocker.percent} />
      {/if}
    </div>
  </div>
{/if}
<Interactions />
<StreakModal />
<OnThisDayModal />
<PinLock />
<SearchModal />

{#if $Interact.focusedEditor}
  <FocusedEditor />
{/if}

{#if $Interact.confetti.show}
  <Confetti />
{/if}

{#if $UserStore.storageType == 'blockstack' && $Device.offline}
  <div class="text-center offline-notice">No connection to Blockstack.</div>
{/if}
<div id="photo-holder">
  <img id="photo-holder-image" alt="avatar-holder" />
</div>
<!-- {/if} -->
