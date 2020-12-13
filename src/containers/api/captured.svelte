<script lang="ts">
  import dayjs from "dayjs";
  import { createEventDispatcher, onMount } from "svelte";
  import Button from "../../components/button/button.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import ListItemLog from "../../components/list-item-log/list-item-log.svelte";
  import { NomieAPI } from "../../store/napi";
  import ListItem from "../../components/list-item/list-item.svelte";
  import Toolbar from "../../components/toolbar/toolbar.svelte";
  import NomieCaptureCli from "../../modules/nomie-api-cli/nomie-api-cli";
  import NLog from "../../modules/nomie-log/nomie-log";

  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";
  import tick from "../../utils/tick/tick";
  import Empty from "../empty/empty.svelte";

  const dispatch = createEventDispatcher();

  let NAPI = new NomieCaptureCli({ domain: "nomieapi.com" });

  export let logs: Array<any> = [];

  let saved: Array<NLog> = [];
  let discarded: Array<any> = [];
  let capturingId: any;

  function toLog(apiLog): NLog {
    let log: NLog = new NLog(apiLog);
    log.end = dayjs(apiLog.date).valueOf();
    return log;
  }
  onMount(() => {});

  async function discardLog(apiLog: any) {
    const confirmed = await Interact.confirm(
      Lang.t("nomie-api.discard-log", "Discard this Log?"),
      Lang.t("general.cannot-be-undone", "This cannot be undone")
    );
    if (confirmed) {
      discarded.push(apiLog.id);
      discarded = discarded;

      if (discarded.length == logs.length) {
        await emptySlots();
      }
    }
  }

  async function confirmEmptySlots() {
    const confirmed = await Interact.confirm(
      `Delete remaining notes?`,
      Lang.t("general.cannot-be-undone")
    );
    if (confirmed) {
      await emptySlots();
    }
  }

  async function emptySlots() {
    await NAPI.clear();
    dispatch("empty", null);
  }

  async function importLogs() {
    try {
      let filteredLogs = logs.filter((l) => {
        return discarded.indexOf(l.id) == -1;
      });

      // Converting APIv1 Log to Nomie
      const response = await NomieAPI.import(filteredLogs);
      if (response.success.length !== filteredLogs.length) {
        Interact.alert(
          `Only ${response.success.length} of ${filteredLogs.length} imported, not clearing logs.`,
          `Visit settings / nomie api / captured to manually clear the logs`
        );
      } else {
        await emptySlots();
      }
    } catch (e) {
      Interact.error(e.message);
    }
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

{#if !logs.length || discarded.length == logs.length}
  <div class="h-full">
    <Empty
      title={Lang.t('nomie-api.no-recent-logs-capture', 'No API Notes Captured')}
      emoji="🧐" />
  </div>
{:else}
  <div class="mb-4">
    {#each logs as apiLog, index}
      {#if discarded.indexOf(apiLog.id) === -1}
        <ListItemLog
          log={toLog(apiLog)}
          moreOveride
          on:more={() => {
            apiLogOptions(apiLog);
          }} />
      {/if}
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
          ({Math.abs(logs.length - discarded.length)})
        </span>
      </Button>
    </Toolbar>
  </div>
{/if}

<!-- {#if logs.length > state.hidden.length}
  
{/if} -->
