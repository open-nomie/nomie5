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

  let archive: any = {
    trackers: {},
    logs: [],
    boards: [],
    people: {},
    locations: [],
    dashboards: [],
    context: [],
  };
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

  const methods = {
    // Initialze once we have data.
    init() {
      if (fileData.hasOwnProperty("nomie")) {
        const importer = new Importer(fileData);
        console.log({ importer });

        if (!importer.normalized) {
          Interact.error("Unable to process this backup.");
        } else {
          // set version
          version = importer.version;
          // // load data
          archive.trackers = importer.normalized.trackers;
          archive.people = importer.normalized.people;
          archive.boards = importer.normalized.boards;
          archive.logs = importer.normalized.logs;
          archive.locations = importer.normalized.locations;
          archive.dashboards = importer.normalized.dashboards;
          archive.context = importer.normalized.context;

          console.log({ archive });
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

    /**
     *
     * TRACKERS
     * Methods for interacting with variout trackers
     *
     */

    // Get Version 1 Trackers
    v1Trackers() {
      return methods.v2Trackers();
    },
    // Get Version 2 Trackers
    v2Trackers() {
      // Types Map
      let types = {
        tick: "tick",
        numeric: "value",
        range: "range",
        timer: "timer",
      };
      // Set a Trackers Holder
      let trackers = {};
      // Loop over the Trackers - will be an array
      fileData.trackers.forEach((ot) => {
        ot.config = ot.config || {};
        // Search for an emoti by name
        // let emojis = EmojiSearch(ot.label.toLowerCase());
        // Set new tracker object
        let tracker = {
          tag: methods.lowDashCase(ot.label),
          label: ot.label,
          color: ot.color,
          emoji: null,
          min: ot.config.min || "",
          max: ot.config.max || "",
          uom: ot.config.uom || "num",
          type: types[ot.config.type || "tick"] || "tick",
          math: ot.config.math || "sum",
          //   score: score[(ot.charge || 0).toString()] || null
        };
        // Assign tracker to trackers object
        trackers[tracker.tag] = tracker;
      });

      return trackers;
    },
    v3Trackers() {
      let trackers = fileData.trackers;

      return trackers;
    },
    // Do the Actual Importing
    _importTrackers() {
      importing.trackers.running = true;
      // Get existing trackers
      let existing = TrackerStore.data();
      // Tracker Store Save - merge old and new
      return TrackerStore.save({ ...archive.trackers, ...existing }).then(() => {
        importing.trackers.running = false;
        importing.trackers.done = true;
        return importing.trackers;
      });
    },
    // Confirm Import Trackers
    importTrackers() {
      return new Promise((resolve, reject) => {
        return Interact.confirm("Confirm", "Are you sure? Importing Trackers cannot be undone.").then((res) => {
          if (res === true) {
            return methods._importTrackers();
          }
        });
      });
    },

    // Do the Actual Importing
    async _importDashboards() {
      importing.dashboards.running = true;
      // Get existing trackers
      let existing = await DashboardStore.get();
      // Tracker Store Save - merge old and new
      DashboardStore.update((state) => {
        archive.dashboards = (archive.dashboards || []).filter((dashboard) => {
          return (existing || []).map((d) => d.id).indexOf(dashboard.id) == -1;
        });
        state.dashboards = [...archive.dashboards, ...existing];
        return state;
      });
      await DashboardStore.save();
      importing.dashboards.running = false;
      importing.dashboards.done = true;
      return importing.dashboards;
    },
    // Confirm Import Trackers
    async importDashboards() {
      let confirmed = await Interact.confirm("Confirm", "Are you sure? Importing Dashboards cannot be undone.");
      if (confirmed === true) {
        return methods._importDashboards();
      }
    },

    async importContext() {
      importing.context.running = true;
      let contexts = await ContextStore.get();
      contexts = contexts || [];
      try {
        (archive.context || []).forEach((context) => {
          if (contexts.indexOf(context) == -1) {
            contexts.push(context);
          }
        });
        await ContextStore.write(contexts);
      } catch (e) {
        Interact.alert("Error", e.message);
      }
      importing.context.running = false;
      importing.context.done = true;
      return importing.context;
    },

    async importLocations() {
      importing.locations.running = true;
      let currentLocations = Locations.getAll() || [];
      try {
        (archive.locations || []).forEach((loc) => {
          if (!currentLocations.find((l) => l.id == loc.id)) {
            currentLocations.push(loc);
          }
        });
        await Locations.write(currentLocations);
      } catch (e) {
        console.error(e);
      }
      importing.locations.running = false;
      importing.locations.done = true;
      return importing.locations;
    },

    // Import All Things
    async _importAll() {
      importing.all.running = true;
      await methods._importTrackers();
      await methods.importLocations();
      await methods._importPeople();
      await methods._importBoards();
      await methods._importLogs();
      await methods._importDashboards();
      await methods.importContext();
      importing.all.running = false;
      importing.all.done = true;
      Interact.toast("Import Complete. Reloading...");
      // Get and store first book - fresh
      await LedgerStore.getFirstDate(true);
      // Redirect to home
      window.location.href = "/";
      return true;
    },
    // Confirm Import All
    async importAll() {
      let confirmed = await Interact.confirm("Confirm", "Are you sure? Importing cannot be undone.");
      if (confirmed === true) {
        return await methods._importAll();
      }
    },

    async importPeople() {
      let confirmed = await Interact.confirm("Import People?", "Importing boards be undone.");
      if (confirmed) {
        return await methods._importPeople();
      }
    },

    async _importPeople() {
      let people = await PeopleStore.getPeople();
      people = people || {};
      await PeopleStore.write({
        ...(archive || { people: {} }).people,
        ...people,
      });
      importing.people.running = false;
      importing.people.done = true;
      return importing.people;
    },

    // Import Boards
    async _importBoards() {
      importing.boards.running = true;
      let existingBoards = BoardStore.data().boards || [];
      let save = await BoardStore.save([...archive.boards, ...existingBoards]);
      importing.boards.running = false;
      importing.boards.done = true;
      return importing.boards;
    },
    // Confirm Import Boards
    async importBoards() {
      let res = await Interact.confirm("Confirm", "Are you sure? Importing boards be undone.");
      if (res === true) {
        return methods._importBoards();
      }
    },

    // Import logs
    _importLogs() {
      importing.logs.running = true;
      return LedgerStore.import(archive.logs, (status) => {
        if (status.step) {
          if (status.step < status.total) {
            importing.logs.progress = math.round(100 - ((status.total - status.step) / status.total) * 100);
          } else {
            importing.logs.progress = 0;
          }
        }
      }).then(() => {
        importing.logs.done = true;
        importing.logs.running = false;
        return importing.logs;
      });
    },
    // Confirm Import logs
    importLogs() {
      return new Promise((resolve, reject) => {
        return Interact.confirm("Confirm", "Are you sure? Importing logs cannot be undone.").then((res) => {
          if (res === true) {
            return methods._importLogs();
          }
        });
      });
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
              Import Trackers ({Object.keys(archive.trackers).length})
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
              Import Locations ({(archive.locations || []).length})
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
              Import Boards ({(archive.boards || []).length})
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
              Import People ({(Object.keys(archive.people) || []).length})
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
              Import Context ({(Object.keys(archive.context) || []).length})
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
              Import Dashboards ({(archive.dashboards || []).length})
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
            <button class="btn text-primary btn-clear" on:click={methods.importLogs}>Import Logs ({(archive.logs || []).length})</button>
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
