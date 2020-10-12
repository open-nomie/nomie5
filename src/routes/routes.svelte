<script>
  import { Router, Route } from "svelte-routing";
  import BoardEditorRoute from "./board-editor.svelte";
  import CsvImport from "./csv-import.svelte";
  import Dashboard from "./dashboard.svelte";
  import ExportRoute from "./export.svelte";
  import FAQRoute from "./faq.svelte";
  import FileBrowser from "./file-browser.svelte";
  import HistoryRoute from "./history.svelte";
  import NomieAPIRoute from "./nomie-api.svelte";
  import PeopleRoute from "./people.svelte";
  import SettingsRoute from "./settings.svelte";
  import Setup from "./setup.svelte";
  import TrackRoute from "./track.svelte";
  import TestRoute from "./tests/tests.svelte";
  import LangRoute from "./tests/language.svelte";
</script>

<Router>
  <Route path="/" component={TrackRoute} />
  <Route path="/api" component={NomieAPIRoute} />
  <Route path="/test" component={TestRoute} />
  <Route path="/lang" component={LangRoute} />
  <Route path="/board/:id" component={BoardEditorRoute} />
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/faq" component={FAQRoute} />
  <Route path="/history" component={HistoryRoute} />
  <Route path="/history/:date" component={HistoryRoute} />
  <Route path="/people" component={PeopleRoute} />
  <Route path="/settings" component={SettingsRoute} />
  <Route path="/settings/export" component={ExportRoute} />
  <Route path="/settings/export/:type" component={ExportRoute} />
  <Route path="/settings/import/csv" component={CsvImport} />
  <Route path="/files/*path" let:params>
    <FileBrowser path={params.path} />
  </Route>
  <Route path="/setup" component={Setup} />
</Router>
