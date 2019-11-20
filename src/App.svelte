<script>
  // Svelte
  import { Router, Route, navigate } from "svelte-routing";
  import { Link } from "svelte-routing";
  import { onMount } from "svelte";

  // Vendors
  import Spinner from "svelte-spinner";
  import { gestures } from "@composi/gestures";

  // Containers
  import AppTabs from "./containers/layout/tabs.svelte";
  import Interactions from "./containers/interactions/interactions.svelte";
  import LibraryModal from "./containers/library/library.svelte";
  import Modal from "./components/modal/modal.svelte";

  // Utils
  import Logger from "./utils/log/log";

  // Routes
  import TrackRoute from "./routes/track.svelte";
  import HistoryRoute from "./routes/history.svelte";
  import SetupRoute from "./routes/setup.svelte";
  import SettingsRoute from "./routes/settings.svelte";
  import StatsRoute from "./routes/stats.svelte";
  import BoardEditorRoute from "./routes/board-editor.svelte";
  import FAQRoute from "./routes/faq.svelte";
  import PluginsRoute from "./routes/plugins.svelte";
  import NomieAPIRoute from "./routes/nomie-api.svelte";
  import ExportRoute from "./routes/export.svelte";

  // Stores
  import { UserStore } from "./store/user"; //  user auth and state
  import { Interact } from "./store/interact"; //  global alerts, popmenus, confirms, etc
  import { BoardStore } from "./store/boards"; // board state  and methods
  import { TrackerStore } from "./store/trackers"; // tracker state and methods
  import { CommanderStore } from "./store/commander"; // commander - /?note=hi&lat=35&lng=-81.32
  import { NomieAPI } from "./store/napi";
  // import { TrackerLibrary } from './store/tracker-library';

  import config from "../config/global";

  // Set a better console
  const console = new Logger("App.svelte");
  gestures();

  /**
   * New Day?
   *
   * This checks to see if the day has changed since it was last launched.
   * If so, lets give the user the option to reload the app..
   */
  let confirming = false;
  const today = new Date().toDateString();
  const dayCheck = setInterval(() => {
    // Fire off a notice if it's not today anymore - and we haven't
    // already fired off the confirm prompt // stops the double firing.
    if (today !== new Date().toDateString() && !confirming) {
      if (confirm("It's a new day! Nomie needs a refresh, do that now?")) {
        setTimeout(() => {
          window.location.reload();
        }, 200);
      }
    }
  }, 1000 * 60 * 30);
  //
  /**
   * Check for App Updates
   * Will hit the version.json and compare it to the known
   * version
   *
   * TODO: this is not working - why?
   **/

  const appVersion = "APP_VERSION";
  const checkForUpdates = () => {
    fetch("./version.json")
      .then(res => {
        return res.json();
      })
      .then(payload => {
        if (payload.version != appVersion) {
          // stop localhost from getting hit.
          if (appVersion !== `APP${"_"}VERSION`) {
            let conf = confirm("A new update has been released. Update?");
            if (conf === true) {
              window.location.href = window.location.href;
            }
          }
        }
      });
  };

  // Not sure if theese are needed
  export let name = "nomie";
  export let url = "";

  $: if (window && $TrackerStore) {
    window.$TrackerStore = $TrackerStore;
  }

  const methods = {
    routerChange(event) {},
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
      //checkForUpdates();
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
  document.addEventListener(
    visibilityChange,
    () => {
      methods.setDocParams({ hidden });
    },
    false
  );

  /**
   *
   * WINDOW LISTENERS
   * GLoBaL StUFFs!
   *
   */

  window.addEventListener("load", () => {
    let onNetworkChange = event => {
      if (navigator.onLine) {
        document.body.classList.remove("offline");
      } else {
        document.body.classList.add("offline");
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
    // Run any commands if needed
    setTimeout(() => {
      // If there are any URL caommands, it will run here.
      CommanderStore.run();
      // If they have the API - it will load here
      NomieAPI.load();
    }, 500);
  });

  onMount(() => {
    setTimeout(() => {}, 1000);
  });
</script>

{#if $UserStore.signedIn === true}
  <Router {url} on:change={methods.routerChange} bind:this={router}>
    <Route path="/history" component={HistoryRoute} />
    <Route path="/history/:date" component={HistoryRoute} />
    <Route path="/" component={TrackRoute} />
    <Route path="/settings" component={SettingsRoute} />
    <Route path="/board/:id" component={BoardEditorRoute} />
    <Route path="/faq" component={FAQRoute} />
    <!-- Plugin Coming Soon -->
    <Route path="/plugins" component={PluginsRoute} />
    <Route path="/plugins/settings/:pluginId" component={PluginsRoute} />
    <Route path="/plugins/:pluginId" component={PluginsRoute} />
    <Route path="/api" component={NomieAPIRoute} />
    <Route path="/settings/export/:type" component={ExportRoute} />
    <Route path="/settings/export" component={ExportRoute} />
  </Router>
{:else if $UserStore.signedIn == undefined}
  <div class="empty-notice" style="height:100vh">
    <Spinner size="60" speed="750" color="#319ed7" thickness="10" gap="40" />
  </div>
{:else if $UserStore.signedIn === false}
  <SetupRoute />
{/if}

<!-- Global Modals, alerts, menus, etc-->
{#if $Interact.stats.activeTag}
  <StatsRoute id={$Interact.stats.activeTag} />
{/if}
<LibraryModal />
<Interactions />
