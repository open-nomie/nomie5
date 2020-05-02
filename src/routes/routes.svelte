<script>
  import { Router, Route, navigate } from "svelte-routing";

  import TrackRoute from "./track.svelte";
  import HistoryRoute from "./history.svelte";

  import SettingsRoute from "./settings.svelte";
  import BoardEditorRoute from "./board-editor.svelte";
  import FAQRoute from "./faq.svelte";
  // import PluginsRoute from "./plugins.svelte";
  import NomieAPIRoute from "./nomie-api.svelte";
  import ExportRoute from "./export.svelte";
  import PeopleRoute from "./people.svelte";
  import TrackerDesigner from "./tracker-designer.svelte";
  import FileBrowser from "./file-browser.svelte";
  import Shop from "./shop.svelte";
</script>

<Router>
  <Route path="/history" component={HistoryRoute} />
  <Route path="/history/:date" component={HistoryRoute} />
  <Route path="/" component={TrackRoute} />
  <Route path="/people" component={PeopleRoute} />
  <Route path="/settings" component={SettingsRoute} />
  <Route path="/board/:id" component={BoardEditorRoute} />
  <Route path="/faq" component={FAQRoute} />
  <Route path="/api" component={NomieAPIRoute} />
  <Route path="/settings/export/:type" component={ExportRoute} />
  <Route path="/settings/export" component={ExportRoute} />
  <Route path="/tracker/design" component={TrackerDesigner} />
  <Route path="/files/*path" let:params>
    <FileBrowser path={params.path} />
  </Route>
  <Route path="/shop" component={Shop} />
</Router>
