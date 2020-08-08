<script lang="ts">
  // vendors
  // import EmojiSearch from "emoji-search";
  // import md5 from "md5";

  import { createEventDispatcher } from "svelte";

  // Modules
  // import NomieLog from "../../modules/nomie-log/nomie-log";
  // import Tracker from "../../modules/tracker/tracker";
  // import Location from "../../modules/locate/Location";
  // import Importer from "../../modules/import/import";
  import ImportLoader from "../../modules/import/import-loader";

  // Utils
  // import PromiseStep from "../../utils/promise-step/promise-step";
  import math from "../../utils/math/math";

  // components
  import NModal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  // import NIcon from "../../components/icon/icon.svelte";
  // import NSpinner from "../../components/spinner/spinner.svelte";

  // Stores
  import { Interact } from "../../store/interact";
  import { LedgerStore } from "../../store/ledger";
  // import { TrackerStore } from "../../store/tracker-store";
  // import { BoardStore } from "../../store/boards";
  // import { PeopleStore } from "../../store/people-store";
  // import { Locations } from "../../store/locations";
  import { Lang } from "../../store/lang";
  import Button from "../../components/button/button.svelte";
  // import { DashboardStore } from "../../store/dashboard-store";
  // import { ContextStore } from "../../store/context-store";
  import TagBadge from "../../components/tag-badge/tag-badge.svelte";
  import ImporterItem from "./importer-item.svelte";

  let fileInput; // holder of dom element self
  let fileData = null; // holder of file content
  let version = undefined; // version we're dealing with

  let importingAll = false;

  // Status of imports
  let importing = {
    boards: { running: false, done: false },
    locations: { running: false, done: false },
    logs: { running: false, done: false, progress: 0 },
    trackers: { running: false, done: false },
    people: { running: false, done: false },
    dashboards: { running: false, done: false },
    context: { running: false, done: false },
    all: { running: false, done: false },
  };

  const dispatch = createEventDispatcher();
  const importLoader = new ImportLoader();

  const methods = {
    // Initialze once we have data.
    init() {
      if (fileData.hasOwnProperty("nomie")) {
        // const importer = new Importer(fileData);
        try {
          importLoader.openPayload(fileData);
          version = importLoader.importer.version;
        } catch (e) {
          console.error(e.message);
          Interact.alert("Error", e.message);
        }
      }
    },
    async finish() {
      // Get a new latest book
      await LedgerStore.getFirstDate(true);
      document.location.href = "/";
    },
    // On Import File
    // Process the file - see if we can do anything with it.
    onImportFile(event) {
      // set reader and file
      let reader = new FileReader();
      let file = event.target.files[0];
      // file on loaded
      reader.onload = (theFile: any) => {
        try {
          fileData = JSON.parse(theFile.target.result);
          methods.init();
        } catch (e) {
          console.error(e);
          Interact.alert("Error", e.message);
        }
      };
      // Read the file
      reader.readAsText(file);
    },

    // Confirm Import Trackers

    async run(type: string, func: Function, prompt: boolean = false) {
      importing[type].running = true;
      try {
        let proceed = true;
        if (prompt) {
          proceed = await Interact.confirm(`Import ${type}?`, "This action cannot be undone");
          if (proceed !== true) {
            importing[type].running = false;
            importing[type].done = false;
          }
        }
        if (proceed) {
          await func();
          importing[type].running = false;
          importing[type].done = true;
        }
      } catch (e) {
        console.error(type, e.message);
        Interact.alert("Error", e.message);
        importing[type].running = false;
        importing[type].done = false;
      }
    },
    async importTrackers(confirmation: boolean = false) {
      return await methods.run(
        "trackers",
        async () => {
          return await importLoader.importTrackers();
        },
        confirmation
      );
    },
    // Confirm Import Trackers
    async importDashboards(confirmation: boolean = false) {
      return await methods.run(
        "dashboards",
        async () => {
          return await importLoader.importDashboards();
        },
        confirmation
      );
    },

    async importPeople(confirmation: boolean = false) {
      return await methods.run(
        "people",
        async () => {
          return await importLoader.importPeople();
        },
        confirmation
      );
    },

    // Confirm Import Boards
    async importBoards(confirmation: boolean = false) {
      return await methods.run(
        "boards",
        async () => {
          return await importLoader.importBoards();
        },
        confirmation
      );
    },

    // Confirm Import logs
    async importLogs(confirmation: boolean = false) {
      return await methods.run(
        "logs",
        async () => {
          return await importLoader.importLogs((progress) => {
            importing.logs.progress = progress;
          });
        },
        confirmation
      );
    },

    async importContext(confirmation: boolean = false) {
      return await methods.run(
        "context",
        async () => {
          return await importLoader.importContext();
        },
        confirmation
      );
    },

    async importLocations(confirmation: boolean = false) {
      return await methods.run(
        "locations",
        async () => {
          return await importLoader.importLocations();
        },
        confirmation
      );
    },
    // Confirm Import All
    async importAll() {
      let confirmed = await Interact.confirm("Confirm", "Are you sure? Importing cannot be undone.");
      if (confirmed === true) {
        importingAll = true;
        importing.all.running = true;
        let statusMonitor = [];
        try {
          // Let the importer Importer all
          await importLoader.importAll((status) => {
            // While importing each item (other than logs)
            if (status.importing) {
              importing[status.importing] = importing[status.importing] || {};
              importing[status.importing].running = true;
              statusMonitor.push(status.importing);
              // Make sure other things are not in the running state.
              Object.keys(importing).forEach((item) => {
                if (status.importing !== item) {
                  importing[item].running = false;
                  if (statusMonitor.indexOf(item) > -1) {
                    importing[item].done = true;
                  }
                }
              });
            } else {
              // We're importing Logs
              if (status.progress) {
                importing.logs.progress = status.progress;
              }
            }
          });
          Object.keys(importing).forEach((item) => {
            importing[item].done = true;
          });
          importing.all.running = false;
          importing.all.done = true;
          importingAll = false;
          Interact.toast("Import Finishing...");
          await LedgerStore.getFirstDate(true);
          window.location.href = "/";
        } catch (e) {
          console.error(e.message);
          Interact.alert("Error", e.message);
        }

        return true;
      }
    },

    // Get Percentage between two numbers
  };
</script>

<!-- Modal will be hidden in settings TODO: make this not hacky -->
<NModal
  title="Import Backups"
  fullscreen={true}
  on:close={() => {
    dispatch('dismiss');
  }}
  allowClose={true}
  show={true}>
  {#if !fileData}
    <div class="empty-notice" style="opacity:1; max-height:80%">
      <div class="text-center d-flex flex-column justify-content-center">
        <p class="text-sm text-faded-3 mb-4">
          Import backups (not CSVs)
          <br />
          from Nomie 1, 2, 3, 4 and 5!
        </p>
        <Button
          block
          color="primary"
          shape="round"
          on:click={() => {
            fileInput.click();
          }}>
          Select Nomie Backup...
        </Button>
        <input class="d-none" type="file" bind:this={fileInput} on:change={methods.onImportFile} />
      </div>
    </div>
  {/if}
  <div class="n-list">
    {#if fileData && !version}
      <NItem
        title="Unknown/Invalid File"
        on:click={() => {
          fileData = null;
        }} />
    {:else if fileData}
      <NItem className="item-divider compact bg-faded" />
      <NItem title="From Nomie {fileData.nomie.number}">
        <button slot="right" class="btn btn-clear text-danger" on:click={() => (fileData = null)}>{Lang.t('general.cancel')}</button>
      </NItem>
      <NItem className="item-divider compact bg-faded" />

      <!-- Importable Items -->
      {#if Object.keys(importLoader.normalized.trackers).length > 0}
        <ImporterItem
          emoji="🤪"
          title="Trackers"
          count={Object.keys(importLoader.normalized.trackers).length}
          bind:status={importing.trackers}
          on:import={() => {
            methods.importTrackers(true);
          }} />
      {/if}

      <!-- Locations -->
      {#if (importLoader.normalized.locations || []).length > 0}
        <ImporterItem
          emoji="🗺"
          title="Locations"
          count={(importLoader.normalized.locations || []).length}
          bind:status={importing.locations}
          on:import={() => {
            methods.importLocations(true);
          }} />
      {/if}

      <!-- Board -->
      {#if (importLoader.normalized.boards || []).length > 0}
        <ImporterItem
          emoji="🗂"
          title="Boards"
          count={(importLoader.normalized.boards || []).length}
          bind:status={importing.boards}
          on:import={() => {
            methods.importBoards(true);
          }} />
      {/if}

      <!-- People -->
      {#if (Object.keys(importLoader.normalized.people) || []).length > 0}
        <ImporterItem
          emoji="👩🏽‍💼"
          title="People"
          count={(Object.keys(importLoader.normalized.people) || []).length}
          bind:status={importing.people}
          on:import={() => {
            methods.importPeople(true);
          }} />
      {/if}

      <!-- People -->
      {#if (importLoader.normalized.context || []).length > 0}
        <ImporterItem
          emoji="💭"
          title="Context"
          count={(importLoader.normalized.context || []).length}
          bind:status={importing.context}
          on:import={() => {
            methods.importContext(true);
          }} />
      {/if}

      <!-- Dashboards -->
      {#if (importLoader.normalized.dashboards || []).length > 0}
        <ImporterItem
          emoji="📊"
          title="Dashboards"
          count={(importLoader.normalized.dashboards || []).length}
          bind:status={importing.dashboards}
          on:import={() => {
            methods.importDashboards(true);
          }} />
      {/if}

      <!-- logs -->
      {#if (importLoader.normalized.logs || []).length > 0}
        <ImporterItem
          key="logs"
          emoji="⏰"
          title="Logs"
          count={(importLoader.normalized.logs || []).length}
          bind:status={importing.logs}
          on:import={() => {
            console.log('Import Logs?!');
            methods.importLogs(true);
          }}>
          {#if importing.logs.running}
            <div class="progress" style="min-width:200px;">
              <div
                class="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                aria-valuenow={importing.logs.progress}
                aria-valuemin="0"
                aria-valuemax="100"
                style="width: {importing.logs.progress}%" />
            </div>
          {/if}
        </ImporterItem>
      {/if}
    {/if}
  </div>

  <!-- Footer -->
  <div slot="footer" class="flex-grow">
    {#if importingAll === true}
      <button class="btn btn-primary btn-block flex-grow btn-lg" disabled>Importing...</button>
    {:else if version && !importing.all.running && !importing.all.done}
      <button class="btn btn-primary btn-block btn-lg btn-block" on:click={methods.importAll}>Import All</button>
    {:else if importing.all.done}
      <button class="btn btn-primary btn-block btn-lg" on:click={methods.finish}>Finsished</button>
    {/if}
  </div>

</NModal>
