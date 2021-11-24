<script>
  import { Router, Route } from 'svelte-routing'
  import FileBrowser from './file-browser.svelte'
  import DynamicPage from '../DynamicPage.svelte'
</script>

<Router>
  <Route path="/">
    <DynamicPage route="track" />
  </Route>
  <Route path="/api">
    <DynamicPage route="nomie-api" />
  </Route>
  <Route path="/test">
    <DynamicPage route="tests/tests" />
  </Route>
  <Route path="/lang">
    <DynamicPage route="tests/language" />
  </Route>
  <Route path="/board/:id">
    <DynamicPage route="board-editor" />
  </Route>
  <Route path="/dashboard">
    <DynamicPage route="dashboard" />
  </Route>
  <Route path="/faq">
    <DynamicPage route="faq" />
  </Route>
  <Route path="/history">
    <DynamicPage route="history" />
  </Route>
  <Route path="/history/:date">
    <DynamicPage route="history" />
  </Route>
  <Route path="/people">
    <DynamicPage route="people" />
  </Route>
  <Route path="/settings">
    <DynamicPage route="settings" />
  </Route>
  <Route path="/settings/export">
    <DynamicPage route="export" />
  </Route>
  <Route path="/settings/export/:type">
    <DynamicPage route="export" />
  </Route>
  <Route path="/settings/import/csv">
    <DynamicPage route="csv-import" />
  </Route>
  <Route path="/files/*path" let:params>
    <FileBrowser path={params.path} />
  </Route>
  <Route path="/setup">
    <DynamicPage route="setup" />
  </Route>
</Router>
