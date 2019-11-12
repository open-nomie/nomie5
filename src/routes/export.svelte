<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";
  import { onMount } from "svelte";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  import Exporter from "../modules/export/export";
  import CSV from "../modules/export/csv";
  // Components
  import NText from "../components/text/text.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  // containers
  import NPage from "../containers/layout/page.svelte";
  // config
  import { TrackerStore } from "../store/trackers";
  import { Interact } from "../store/interact";
  import { Lang } from "../store/lang";
  import dayjs from "dayjs";

  // Setup the Exporter
  const Export = new Exporter();

  // Default to Backup - passed in by :type in route
  export let type = "backup";

  // Set state
  let state = {
    trackers: TrackerStore.getAsArray(), // assume all
    start: dayjs()
      .subtract(1, "month")
      .format("YYYY-MM-DD"),
    end: dayjs().format("YYYY-MM-DD")
  };

  // Prepare Dynamic values
  let startDate, endDate;

  // If start Changes, make sure end date is the same year
  // Searching only works year by year.
  $: if (state.start) {
    startDate = dayjs(state.start, "YYYY-MM-DD");
    endDate = dayjs(state.end, "YYYY-MM-DD");
    if (startDate.format("YYYY") != endDate.format("YYYY")) {
      state.end = endDate.year(startDate.format("YYYY")).format("YYYY-MM-DD");
    }
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
        end
      });
    },
    selectTrackers() {
      Interact.selectTrackers().then(trackers => {
        state.trackers = trackers;
      });
    },
    export() {
      Interact.confirm(
        Lang.t("general.continue-question"),
        Lang.t("settings.export-confirm")
      ).then(res => {
        if (res === true) {
          Export.onChange(change => {
            Interact.toast(`Export: ${change}`, true);
          });
          Export.start().then(() => {
            Interact.toast(Lang.t("settings.export-complete"));
          });
        }
      });
    }
  };

  onMount(() => {});
</script>

<NPage className="Export" title="Export" withBack={true}>

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
      <div class="gap" />
      <NItem>
        <p class="text-sm">{Lang.t('export.csv.description')}</p>
      </NItem>
      <div class="gap" />
      <NItem title="Trackers" on:click={methods.selectTrackers}>
        <div slot="right">
          {#if state.trackers.length == Object.keys($TrackerStore).length}
            <div class="text-primary">All Trackers</div>
          {:else}
            {#each state.trackers as tracker}{tracker.emoji}{/each}
          {/if}
        </div>
      </NItem>
      <NItem title={Lang.t('general.start')}>
        <input
          type="date"
          class="form-control"
          bind:value={state.start}
          slot="right" />
      </NItem>
      <NItem title={Lang.t('general.end')}>
        <input
          type="date"
          class="form-control"
          bind:value={state.end}
          slot="right" />
      </NItem>
      <div class="gap" />
      <NItem
        title={Lang.t('export.csv.download')}
        className="text-primary clickable"
        on:click={methods.exportCSV} />
    </div>
  {:else}
    <div class="container backup">
      <div class="gap" />
      <NItem>
        <p class=" text-sm">{Lang.t('export.backup.description')}</p>
      </NItem>
      <div class="gap" />
      <NItem
        title={Lang.t('export.backup.download')}
        className="text-primary clickable"
        on:click={methods.export} />
    </div>
  {/if}

</NPage>
