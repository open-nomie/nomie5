<script>
  // Svelte
  import { Router, Route, navigate } from "svelte-routing";
  import { Link } from "svelte-routing";
  import { onMount } from "svelte";

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

  // Stores
  import { UserStore } from "./store/user"; //  user auth and state
  import { Interact } from "./store/interact"; //  global alerts, popmenus, confirms, etc
  import { BoardStore } from "./store/boards"; // board state  and methods
  import { TrackerStore } from "./store/trackers"; // tracker state and methods
  import { CommanderStore } from "./store/commander"; // commander - /?note=hi&lat=35&lng=-81.32

  // Set a better console
  const console = new Logger("App.svelte");

  // Not sure if theese are needed
  export let url = "";
  export let name = "nomie";

  // App Local State
  let data = {
    hasAccount: false,
    promptContent: null
  };

  // Determine the user is null at first
  let user = null;

  // Setup isScrolling variable
  window.scrolling = false;
  let scollingTimeout;
  window.addEventListener(
    "scroll",
    function(event) {
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

  // Initalize the User Store
  UserStore.initialize();

  // Used to make sure that boards and trackers are loaded
  UserStore.onReady(() => {
    // Set the user if they're logged in
    user = $UserStore;
    // Run any commands if needed
    setTimeout(() => {
      CommanderStore.run();
    }, 500);
  });
</script>

{#if user}
  <Router {url}>
    <AppTabs />
    <div class="main-content">
      <Route path="/history" component={HistoryRoute} />
      <Route path="/history/:date" component={HistoryRoute} />
      <Route path="/" component={TrackRoute} />
      <Route path="/settings" component={SettingsRoute} />
      <Route path="/stats/:id" component={StatsRoute} />
      <Route path="/board/:id" component={BoardEditorRoute} />
    </div>
  </Router>
{:else}
  <SetupRoute />
{/if}

<!-- Global Modals, alerts, menus, etc-->
<Interactions />
