<script>
  // vendors
  // import EmojiSearch from "emoji-search";
  import md5 from "md5";
  import Spinner from "svelte-spinner";
  import { createEventDispatcher } from "svelte";

  // Modules
  import NomieLog from "../../modules/nomie-log/nomie-log";
  import Tracker from "../../modules/tracker/tracker";

  // Utils
  import PromiseStep from "../../utils/promise-step/promise-step";
  import math from "../../utils/math/math";

  // components
  import NModal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";

  // Stores
  import { Interact } from "../../store/interact";
  import { LedgerStore } from "../../store/ledger";
  import { TrackerStore } from "../../store/tracker-store";
  import { BoardStore } from "../../store/boards";
  import { PeopleStore } from "../../store/people-store";
  import { Lang } from "../../store/lang";

  let fileInput; // holder of dom element self
  let fileData = null; // holder of file content
  let version = undefined; // version we're dealing with
  let archive = {
    trackers: null,
    records: null,
    boards: null,
    people: null
  };
  // Status of imports
  let importing = {
    boards: { running: false, done: false },
    records: { running: false, done: false, progress: 0 },
    trackers: { running: false, done: false },
    people: { running: false, done: false },
    all: { running: false, done: false }
  };

  const dispatch = createEventDispatcher();

  const methods = {
    // Initialze once we have data.
    init() {
      if (fileData.hasOwnProperty("nomie")) {
        // set version
        version = parseInt(fileData.nomie.number.split(".")[0]);
        // load data
        archive.trackers = methods.getTrackers();
        archive.boards = methods.getBoards();
        archive.records = methods.getRecords();
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
      reader.onload = theFile => {
        try {
          fileData = JSON.parse(theFile.target.result);
          methods.init();
        } catch (e) {
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
        timer: "timer"
      };
      // Set a Trackers Holder
      let trackers = {};
      // Loop over the Trackers - will be an array
      fileData.trackers.forEach(ot => {
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
          math: ot.config.math || "sum"
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
      return TrackerStore.save({ ...archive.trackers, ...existing }).then(
        () => {
          importing.trackers.running = false;
          importing.trackers.done = true;
          return importing.trackers;
        }
      );
    },
    // Confirm Import Trackers
    importTrackers() {
      return new Promise((resolve, reject) => {
        return Interact.confirm(
          "Confirm",
          "Are you sure? Importing Trackers cannot be undone."
        ).then(res => {
          if (res === true) {
            return methods._importTrackers();
          }
        });
      });
    },

    // Import All Things
    async _importAll() {
      importing.all.running = true;
      await methods._importTrackers();
      await methods._importPeople();
      await methods._importBoards();
      await methods._importRecords();
      importing.all.running = false;
      importing.all.done = true;
      Interact.toast("Import Complete. Reloading...");
      await LedgerStore.getFirstDate(true);
      window.location.href = "/";
      return true;
    },
    // Confirm Import All
    async importAll() {
      let confirmed = await Interact.confirm(
        "Confirm",
        "Are you sure? Importing cannot be undone."
      );
      if (confirmed === true) {
        return await methods._importAll();
      }
    },

    async importPeople() {
      let confirmed = await Interact.confirm(
        "Import People?",
        "Importing boards be undone."
      );
      if (confirmed) {
        return await methods._importPeople();
      }
    },

    async _importPeople() {
      let people = await PeopleStore.getPeople();
      await PeopleStore.write({ ...archive.people, ...people });
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
      let res = await Interact.confirm(
        "Confirm",
        "Are you sure? Importing boards be undone."
      );
      if (res === true) {
        return methods._importBoards();
      }
    },

    // Import Records
    _importRecords() {
      importing.records.running = true;
      return LedgerStore.import(archive.records, status => {
        if (status.step) {
          if (status.step < status.total) {
            importing.records.progress = math.round(
              100 - ((status.total - status.step) / status.total) * 100
            );
          } else {
            importing.records.progress = 0;
          }
        }
      }).then(() => {
        importing.records.done = true;
        importing.records.running = false;
        return importing.records;
      });
    },
    // Confirm Import Records
    importRecords() {
      return new Promise((resolve, reject) => {
        return Interact.confirm(
          "Confirm",
          "Are you sure? Importing records cannot be undone."
        ).then(res => {
          if (res === true) {
            return methods._importRecords();
          }
        });
      });
    },

    // Convert things to Tag Friendly String
    lowDashCase(str) {
      return (
        str &&
        str
          .match(
            /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
          )
          .map(x => x.toLowerCase())
          .join("_")
      );
    },

    // Get Percentage between two numbers
    progress(ths, tht) {
      return math.percentage(ths, tht);
    },

    // Get Version 1 Records
    v1Records() {
      return methods.v2Records();
    },

    // Get Version 1 Boards
    v1Boards() {
      let boards = [];

      if ((fileData.meta || []).length) {
        // we have meta data..
        fileData.meta.forEach(metaBlock => {
          if (metaBlock._id === "groups") {
            let oldTrackers = methods.v1OldTrackers();
            let boardsObject = metaBlock.obj;
            boards = Object.keys(boardsObject)
              .map(boardName => {
                return {
                  id: methods.lowDashCase(boardName),
                  label: boardName,
                  trackers: boardsObject[boardName]
                    .filter(parentId => {
                      return oldTrackers.hasOwnProperty(parentId);
                    })
                    .map(parentId => {
                      return oldTrackers[parentId].tag;
                    })
                };
              })
              .filter(board => {
                return board.label.toLowerCase() !== "all";
              });
          }
        });
      }

      return boards;
    },
    // Version Two Boards
    v2Boards() {
      let boards = {};
      fileData.trackers.forEach(tracker => {
        let tag = methods.lowDashCase(tracker.label);
        if (tracker.groups) {
          tracker.groups.forEach(group => {
            if ((group || "").trim().length) {
              boards[group] = boards[group] || [];
              if (boards[group].indexOf(tag) === -1) {
                boards[group].push(tag);
              }
            }
          });
        }
      });
      return Object.keys(boards)
        .filter(groupName => {
          return groupName.toLowerCase() !== "all";
        })
        .map(groupName => {
          return {
            id: methods.lowDashCase(groupName),
            label: groupName,
            trackers: boards[groupName]
          };
        });
    },
    // Version 3 Boards
    v3Boards() {
      return fileData.boards || [];
    },
    // Get Version 1 Old Trackers
    v1OldTrackers() {
      let oldTrackers = {};
      // If Trackers
      if (fileData.trackers.hasOwnProperty("length")) {
        // Loop over trackers
        fileData.trackers.forEach(tracker => {
          // Set a new base tracker with right tag
          let baseTkr = {
            ...{ tag: methods.lowDashCase(tracker.label) },
            ...tracker
          };
          // Add to oldTracker
          oldTrackers[tracker._id] = new Tracker(baseTkr);
        });
      }
      return oldTrackers;
    },
    // Get Version 2 records
    v2Records() {
      // Get current Trackers
      let trackers = methods.v2Trackers();
      // Hold Parent (tracker Id) for each event.
      let oldTrackers = methods.v1OldTrackers();
      // Hold Records
      let records = [];
      // First get the notes
      fileData.notes.forEach(note => {
        let record = new NomieLog({
          _id: md5(Math.random() + new Date().getTime()).substr(0, 10),
          start: note.time,
          end: note.time + 1000,
          lat: (note.geo || []).length == 2 ? note.geo[0] : null,
          lng: (note.geo || []).length == 2 ? note.geo[1] : null,
          location: "",
          note: note.value
        });
        records.push(record);
      });

      // Count for missing parents
      let missingParent = 0;
      // Next get the Tracked Events
      fileData.events.forEach(event => {
        // Get the tracker id (event.parent)
        let eventTrackerId = event.parent;
        // Check if we have a tracker for it.
        if (oldTrackers.hasOwnProperty(event.parent)) {
          let note;
          // Sert tracker to whatever the old parent tag is
          let tracker = trackers[oldTrackers[event.parent].tag]; // this doesn't work like that.
          let tag = tracker.tag;
          // If it's a tick - then no value
          if (tracker.type === "tick") {
            note = `#${tracker.tag}`;
          } else {
            // it's not a tick - so add the value
            note = `#${tracker.tag}(${event.value})`;
          }
          // Create a new Record
          let record = new NomieLog({
            _id: md5(Math.random() + new Date().getTime()).substr(0, 10),
            start: event.time,
            end: event.time + 1000,
            lat: (event.geo || []).length == 2 ? event.geo[0] : null,
            lng: (event.geo || []).length == 2 ? event.geo[1] : null,
            location: "",
            note: note
            // score: score[(event.charge || 0).toString()] || null
          });
          // Push log to records
          records.push(record);
        } else {
          // We have another tracked event for a tracker that doesnt exist
          // we cannot know what it was for... Differnt times back then
          missingParent++;
        }
      });
      return records;
    },

    // Get Version 3 Records
    v3Records() {
      let records = (fileData.events || fileData.records).map(event => {
        return new NomieLog(event);
      });
      return records;
    },

    // Get Trackers for archive
    getTrackers() {
      let trackers = {};
      if (version === 1) {
        trackers = methods.v1Trackers();
      } else if (version === 2) {
        trackers = methods.v2Trackers();
      } else if (version >= 3) {
        trackers = methods.v3Trackers();
      }
      return trackers;
    },

    // Get boards for archive
    getBoards() {
      let boards = [];
      if (version === 1) {
        boards = methods.v1Boards();
      } else if (version === 2) {
        boards = methods.v2Boards();
      } else if (version >= 3) {
        boards = methods.v3Boards();
      }
      return boards;
    },

    // Get Records for archive
    getRecords(options = {}) {
      let records = [];
      if (version === 1) {
        records = methods.v1Records();
      } else if (version === 2) {
        records = methods.v2Records();
      } else if (version >= 3) {
        records = methods.v3Records();
      }
      return records;
    }
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
          from Nomie 1, 2, 3 and 4!
        </p>
        <button
          class="btn btn-block btn-primary"
          on:click={() => {
            fileInput.click();
          }}>
          Select Nomie Backup...
        </button>
        <input
          class="d-none"
          type="file"
          bind:this={fileInput}
          on:change={methods.onImportFile} />
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
        <button
          slot="right"
          class="btn btn-clear text-danger"
          on:click={() => (fileData = null)}>
          {Lang.t('general.cancel')}
        </button>
      </NItem>
      <NItem className="item-divider compact bg-faded" />
      <!-- Importable Items -->
      <NItem title="Trackers">
        <div slot="right">
          {#if importing.trackers.running}
            <Spinner
              size="40"
              speed="750"
              color="#CCC"
              thickness="8"
              gap="40" />
          {:else if importing.trackers.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button
              class="btn text-primary btn-clear"
              on:click={methods.importTrackers}>
              Import Trackers ({Object.keys(archive.trackers).length})
            </button>
          {/if}
        </div>
      </NItem>
      <!-- Board -->
      <NItem title="Boards">
        <div slot="right">
          {#if importing.boards.running}
            <Spinner
              size="40"
              speed="750"
              color="#CCC"
              thickness="8"
              gap="40" />
          {:else if importing.boards.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button
              class="btn text-primary btn-clear"
              on:click={methods.importBoards}>
              Import Boards ({(archive.boards || []).length})
            </button>
          {/if}
        </div>
      </NItem>
      <!-- People -->
      <NItem title="People">
        <div slot="right">
          {#if importing.people.running}
            <Spinner
              size="40"
              speed="750"
              color="#CCC"
              thickness="8"
              gap="40" />
          {:else if importing.people.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button
              class="btn text-primary btn-clear"
              on:click={methods.importPeople}>
              Import People ({(archive.people || []).length})
            </button>
          {/if}
        </div>
      </NItem>
      <!-- Records -->
      <NItem title="Records">
        <div slot="right">
          {#if importing.records.running}
            <div class="progress" style="min-width:200px;">
              <div
                class="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                aria-valuenow={importing.records.progress}
                aria-valuemin="0"
                aria-valuemax="100"
                style="width: {importing.records.progress}%" />
            </div>
          {:else if importing.records.done}
            Imported
            <NIcon name="checkmarkFilled" />
          {:else}
            <button
              class="btn text-primary btn-clear"
              on:click={methods.importRecords}>
              Import Records ({(archive.records || []).length})
            </button>
          {/if}
        </div>
      </NItem>
    {/if}
  </div>

  <!-- Footer -->
  <div slot="footer" class="flex-grow">
    {#if fileData && version && !importing.all.running && !importing.all.done}
      <button
        class="btn btn-primary btn-block btn-lg btn-block"
        on:click={methods.importAll}>
        Import All
      </button>
    {:else if importing.all.running}
      <button class="btn btn-primary btn-block flex-grow btn-lg" disabled>
        Importing...
      </button>
    {:else if importing.all.done}
      <button
        class="btn btn-primary btn-block btn-lg"
        on:click={methods.finish}>
        Finsished
      </button>
    {/if}
  </div>

</NModal>
