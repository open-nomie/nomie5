<script lang="ts">
	
  import dayjs from "dayjs";
  import { createEventDispatcher, onMount } from "svelte";
  import Button from "../../components/button/button.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import ListItemLog from "../../components/list-item-log/list-item-log.svelte";
  import { NapiLog, NomieAPI } from "../../store/napi";
  
  import Toolbar from "../../components/toolbar/toolbar.svelte";
  import NomieCaptureCli from "../../modules/nomie-api-cli/nomie-api-cli";
  import NLog from "../../modules/nomie-log/nomie-log";

  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";
  
  import Empty from "../empty/empty.svelte";


  const dispatch = createEventDispatcher();

  let NAPI = new NomieCaptureCli({ domain: "nomieapi.com" });

  // Pull from the NomieAPI Store
  let logs: Array<NapiLog> = [];
  $: logs = $NomieAPI.items;


  /**
   * Tell Napi to Discard this Log
   * @param apiLog
   */
  async function discardLog(apiLog: NapiLog) {
    const confirmed = await Interact.confirm(
      Lang.t("nomie-api.discard-log", "Discard this Log?"),
      Lang.t("nomie-api.will-not-be-imported", "This will not be imported")
    );
    if (confirmed) {
      NomieAPI.discard(apiLog);
    }
  }

  async function confirmEmptySlots() {
    const confirmed = await Interact.confirm(
      `Delete remaining notes?`,
      Lang.t("general.cannot-be-undone")
    );
    if (confirmed) {
      await NAPI.clear();
      dispatch("empty", null);
    }
  }

  async function importLogs() {
    await NomieAPI.autoImport();
  }

  async function apiLogOptions(apiLog: any) {
    Interact.popmenu({
      title: `API Note Options`,
      buttons: [
        {
          title: "Discard",
          icon: "delete",
          click() {
            discardLog(apiLog);
          },
        },
      ],
    });
  }
</script>

{#if !logs.length}
  <div class="h-full">
    <Empty
      title={Lang.t('nomie-api.no-recent-logs-capture', 'No API Notes Captured')}
      emoji="🧐" />
  </div>
{:else}
  <div class="mb-4">
    {#each logs as apiLog, index (index)}
      <ListItemLog
      log={NomieAPI.toLog(apiLog)}
      moreOveride
      on:more={() => {
        apiLogOptions(apiLog);
      }} />
    {/each}
  </div>
  <div class="sticky bottom-0">
    <Toolbar className="py-3 mx-auto bg-bg" style="max-width:500px;">
      <Button
        type="clear"
        color="danger"
        block
        className="mr-1 my-0"
        on:click={confirmEmptySlots}>
        <Icon name="delete" className="fill-red mr-2" />
        {Lang.t('general.empty', 'Empty')}
      </Button>
      <Button color="primary" block on:click={importLogs}>
        {Lang.t('nomie-api.import', 'Import')}
        <span class="ml-2 opacity-5">
          ({$NomieAPI.items.length})
        </span>
      </Button>
    </Toolbar>
  </div>
{/if}

