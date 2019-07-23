# TODO

Generated Tue Jul 23 2019 7:45 pm

- **src/store/user.js**
   - TODO: Add 10 minute interval to check for day change - if change, fire a new user.ready
- **src/store/ledger.js**
   - TODO: this doesn't seem to be trigger a change in History.svetle
   - TODO: Make this use listBooks() array to only look for books that exist
- **src/store/boards.js**
   - TODO: tried to make this a spread - but I keep breaking it.
- **src/scss/main.scss**
   - TODO: Look at making prefers-color-scheme work properly - when enabled, only buttons change
- **src/routes/stats.svelte**
   - TODO: Needs to be refactored and cleaned up
- **src/routes/settings.svelte**
   - TODO: figure out how to handle a cancel in the interact prompt
- **src/routes/history.svelte**
   - TODO: This is really sloppy - clean it up.
- **src/routes/board-editor.svelte**
   - TODO: Make sorting work
- **src/modules/stats/stats.js**
   - TODO: Implement IgnoreZeros
- **src/containers/tracker/input/keypad.svelte**
   - and one for the pin-lock container - TODO: merge these some day
- **src/containers/importer/importer.svelte**
   - Modal will be hidden in settings TODO: make this not hacky -->
- **src/containers/board/board.svelte**
   - TODO: fix user store to be a correct store
   - TODO: Look at why this is needed... slop!
   - TODO: Finish this starter pack add trackers, make them installable. -->
- **src/components/capture-log.svelte**
   - TODO: Mobile is getting GMT Time, desktop is not
   - await LedgerStore.saveLog($ActiveLogStore);  TODO: Make ledger task instead