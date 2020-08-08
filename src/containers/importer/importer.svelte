<script lang="ts">
  // vendors
  // import EmojiSearch from "emoji-search";
  import md5 from "md5";

  import { createEventDispatcher } from "svelte";

  // Modules
  import NomieLog from "../../modules/nomie-log/nomie-log";
  import Tracker from "../../modules/tracker/tracker";
  import Location from "../../modules/locate/Location";
  import Importer from "../../modules/import/import";
  import ImportLoader from "../../modules/import/import-loader";

  // Utils
  // import PromiseStep from "../../utils/promise-step/promise-step";
  import math from "../../utils/math/math";

  // components
  import NModal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NSpinner from "../../components/spinner/spinner.svelte";

  // Stores
  import { Interact } from "../../store/interact";
  import { LedgerStore } from "../../store/ledger";
  import { TrackerStore } from "../../store/tracker-store";
  import { BoardStore } from "../../store/boards";
  import { PeopleStore } from "../../store/people-store";
  import { Locations } from "../../store/locations";
  import { Lang } from "../../store/lang";
  import Button from "../../components/button/button.svelte";
  import { DashboardStore } from "../../store/dashboard-store";
  import { ContextStore } from "../../store/context-store";

  let fileInput; // holder of dom element self
  let fileData = null; // holder of file content
  let version = undefined; // version we're dealing with

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
        "people",
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
        importing.all.running = true;
        try {
          await importLoader.importAll();
          importing.all.running = false;
          importing.all.done = true;
          Interact.toast("Import Complete. Reloading...");
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
    progress(ths, tht) {
      return math.percentage(ths, tht);
    },
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
      <NItem title="🥺 Trackers">
        <div slot="right">
          {#if importing.trackers.running}
            <NSpinner size={24} />
          {:else if importing.trackers.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button class="btn text-primary btn-clear" on:click={methods.importTrackers}>
              Import Trackers ({Object.keys(importLoader.normalized.trackers).length})
            </button>
          {/if}
        </div>
      </NItem>
      <!-- Locations -->
      <NItem title="🗺 Locations">
        <div slot="right">
          {#if importing.locations.running}
            <NSpinner size={24} />
          {:else if importing.locations.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button class="btn text-primary btn-clear" on:click={methods.importLocations}>
              Import Locations ({(importLoader.normalized.locations || []).length})
            </button>
          {/if}
        </div>
      </NItem>
      <!-- Board -->
      <NItem title="🅱️ Boards">
        <div slot="right">
          {#if importing.boards.running}
            <NSpinner size={24} />
          {:else if importing.boards.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button class="btn text-primary btn-clear" on:click={methods.importBoards}>
              Import Boards ({(importLoader.normalized.boards || []).length})
            </button>
          {/if}
        </div>
      </NItem>
      <!-- People -->
      <NItem title="👩🏽‍💼 People">
        <div slot="right">
          {#if importing.people.running}
            <NSpinner size={24} />
          {:else if importing.people.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button class="btn text-primary btn-clear" on:click={methods.importPeople}>
              Import People ({(Object.keys(importLoader.normalized.people) || []).length})
            </button>
          {/if}
        </div>
      </NItem>

      <!-- People -->
      <NItem title="💭 Context">
        <div slot="right">
          {#if importing.context.running}
            <NSpinner size={24} />
          {:else if importing.context.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button class="btn text-primary btn-clear" on:click={methods.importContext}>
              Import Context ({(Object.keys(importLoader.normalized.context) || []).length})
            </button>
          {/if}
        </div>
      </NItem>

      <!-- Dashboards -->
      <NItem title="📊 Dashboards">
        <div slot="right">
          {#if importing.dashboards.running}
            <NSpinner size={24} />
          {:else if importing.dashboards.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button class="btn text-primary btn-clear" on:click={methods.importDashboards}>
              Import Dashboards ({(importLoader.normalized.dashboards || []).length})
            </button>
          {/if}
        </div>
      </NItem>

      <!-- logs -->
      <NItem title="⏰ Logs">
        <div slot="right">
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
          {:else if importing.logs.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button class="btn text-primary btn-clear" on:click={methods.importLogs}>
              Import Logs ({(importLoader.normalized.logs || []).length})
            </button>
          {/if}
        </div>
      </NItem>
    {/if}
  </div>

  <!-- Footer -->
  <div slot="footer" class="flex-grow">
    {#if fileData && version && !importing.all.running && !importing.all.done}
      <button class="btn btn-primary btn-block btn-lg btn-block" on:click={methods.importAll}>Import All</button>
    {:else if importing.all.running}
      <button class="btn btn-primary btn-block flex-grow btn-lg" disabled>Importing...</button>
    {:else if importing.all.done}
      <button class="btn btn-primary btn-block btn-lg" on:click={methods.finish}>Finsished</button>
    {/if}
  </div>

</NModal>
