<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";
  import { onMount } from "svelte";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  import Exporter from "../modules/export/export-helper";
  import CSV from "../modules/export/csv";
  // Components
  import NText from "../components/text/text.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NBackButton from "../components/back-button/back-button.svelte";
  import NIcon from "../components/icon/icon.svelte";
  // containers
  import NLayout from "../containers/layout/layout.svelte";
  // config
  import { TrackerStore } from "../store/tracker-store";
  import { Interact } from "../store/interact";
  import { Lang } from "../store/lang";
  import dayjs from "dayjs";
  import Csvr from "../containers/csvr/csvr.svelte";

  // Setup the Exporter
  // const Export = new Exporter();

  // Default to Backup - passed in by :type in route
  export let type = "backup";

  // Set state
  let state = {
    trackers: TrackerStore.getAsArray(), // assume all
    start: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    end: dayjs().format("YYYY-MM-DD"),
  };

  // Prepare Dynamic values
  let startDate, endDate;

  // If start Changes, make sure end date is the same year
  // Searching only works year by year.
  $: if (state.start && dayjs(state.start, "YYYY-MM-DD") !== startDate) {
    startDate = dayjs(state.start, "YYYY-MM-DD");
  }

  $: if (state.end && dayjs(state.end, "YYYY-MM-DD") !== endDate) {
    endDate = dayjs(state.end, "YYYY-MM-DD");
  }

  const methods = {
    exportCSV() {
      let csv = new CSV();
      let start = startDate.toDate();
      let end = endDate.toDate();
      let trackers = state.trackers;

      csv.generate({
        trackers,
        start,
        end,
      });
    },
    selectTrackers() {
      Interact.selectTrackers().then((trackers) => {
        state.trackers = trackers;
      });
    },
    export() {
      Exporter();
    },
  };

  onMount(() => {});
</script>

<NLayout pageTitle="Export your Data" className="Export">
  <div class="n-toolbar-grid container" slot="header">
    <div class="left">
      <NBackButton />
    </div>
    <div class="title main">Export</div>
    <div class="right" />
  </div>
  <div class="btn-group w-100" slot="sub-header">
    <button
      class="btn btn-sm {type == 'backup' ? 'active' : ''}"
      on:click={() => {
        type = 'backup';
      }}>
      Backup
    </button>
    <button
      class="btn btn-sm {type == 'csv' ? 'active' : ''}"
      on:click={() => {
        type = 'csv';
      }}>
      CSV
    </button>
  </div>

  {#if type == 'csv'}
    <div class="container csv">

      <Csvr />

      <NItem className="mx-2 bg-transparent">
        <p class="text-sm">
          {Lang.t('export.csv-description', 'Export individual tracker data to CSV. Only one year at a time is supported.')}
        </p>
      </NItem>

      <div class="n-list solo">
        <NItem title="Trackers" on:click={methods.selectTrackers}>
          <div slot="right">
            {#if state.trackers.length == Object.keys($TrackerStore.trackers).length}
              <div class="text-primary">{Lang.t('general.all-trackers', 'All Trackers')}</div>
            {:else}
              {#each state.trackers as tracker}{tracker.emoji}{/each}
            {/if}
          </div>
        </NItem>
        <NItem title={Lang.t('general.start', 'Start')}>
          <input type="date" class="form-control" bind:value={state.start} slot="right" />
        </NItem>
        <NItem title={Lang.t('general.end', 'End')}>
          <input type="date" class="form-control" bind:value={state.end} slot="right" />
        </NItem>
      </div>

      <NItem
        title={Lang.t('export.csv-download', 'Download CSV...')}
        className="text-primary-bright clickable solo text-center"
        on:click={methods.exportCSV} />
    </div>
  {:else}
    <div class="container backup">
      <div class="gap" />
      <NItem className="px-3 bg-transparent">
        <p class=" text-sm">
          {Lang.t('export.backup-description', 'Create an importable backup file. This allows you to transfer your data from one device to another using a single JSON file that contains ALL of you Nomie data.')}
        </p>
      </NItem>
      <div class="gap" />
      <NItem
        title={Lang.t('export.backup-download', 'Download Backup')}
        className="text-primary-bright clickable solo text-center"
        on:click={methods.export} />
    </div>
  {/if}

</NLayout>
