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

  // Stores
  import { UserStore } from "./store/user"; //  user auth and state
  import { Interact } from "./store/interact"; //  global alerts, popmenus, confirms, etc
  import { BoardStore } from "./store/boards"; // board state  and methods
  import { TrackerStore } from "./store/trackers"; // tracker state and methods
  import { CommanderStore } from "./store/commander"; // commander - /?note=hi&lat=35&lng=-81.32
  import { NomieAPI } from "./store/napi";

  import config from "../config/global";

  // Set a better console
  const console = new Logger("App.svelte");
  gestures();

  // Day Check - every 30 minutes
  // Lets see if the day changed since last it was opened.
  const today = new Date().toDateString();
  const dayCheck = setInterval(() => {
    if (today !== new Date().toDateString()) {
      if (confirm("A new day has begun, you should refresh Nomie.")) {
        window.location.reload();
      }
    }
  }, 1000 * 60 * 30);

  // Not sure if theese are needed
  export let url = "";
  export let name = "nomie";

  // App Local State
  let data = {
    hasAccount: false,
    promptContent: null
  };

  const setDocumentParams = options => {
    let isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // let isDarkMode = false;
    let manualDarkMode = JSON.parse(
      localStorage.getItem(config.dark_mode_key) || "false"
    );
    if (isDarkMode || manualDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  // Setup isScrolling variable
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

  var hidden, visibilityChange;
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
      setDocumentParams({ hidden });
    },
    false
  );

  //Setup an an offline notice
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
    setDocumentParams();
  });

  // Initalize the User Store
  UserStore.initialize();
  let ready = false;

  // Used to make sure that boards and trackers are loaded
  UserStore.onReady(() => {
    // Set the user if they're logged in
    ready = true;
    // Run any commands if needed
    setTimeout(() => {
      CommanderStore.run();
      NomieAPI.load();
    }, 500);
  });
</script>

{#if $UserStore.signedIn === true}
  <Router {url}>
    <AppTabs />
    <div class="main-content">
      <Route path="/history" component={HistoryRoute} />
      <Route path="/history/:date" component={HistoryRoute} />
      <Route path="/" component={TrackRoute} />
      <Route path="/settings" component={SettingsRoute} />
      <Route path="/stats/:id" component={StatsRoute} />
      <Route path="/board/:id" component={BoardEditorRoute} />
      <Route path="/faq" component={FAQRoute} />
      <!-- Plugin Coming Soon -->
      <Route path="/plugins" component={PluginsRoute} />
      <Route path="/plugins/settings/:pluginId" component={PluginsRoute} />
      <Route path="/plugins/:pluginId" component={PluginsRoute} />
      <Route path="/api" component={NomieAPIRoute} />
    </div>
  </Router>
{:else if $UserStore.signedIn == undefined}
  <div class="empty-notice">
    <Spinner size="50" speed="750" color="#666" thickness="2" gap="40" />
  </div>
{:else if $UserStore.signedIn === false}
  <SetupRoute />
{/if}

<!-- Global Modals, alerts, menus, etc-->
<Interactions />
