<script lang="ts">
  import dayjs from "dayjs";
  import Button from "../../components/button/button.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import ListItemLog from "../../components/list-item-log/list-item-log.svelte";

  import ListItem from "../../components/list-item/list-item.svelte";
  import NLog from "../../modules/nomie-log/nomie-log";
  import { Lang } from "../../store/lang";
  import Empty from "../empty/empty.svelte";

  export let logs: Array<NLog> = [];

  const saved: Array<NLog> = [];
  const discarded: Array<any> = [];

  function toLog(apiLog): NLog {
    let log: NLog = new NLog(apiLog);
    log.end = dayjs(apiLog.date).valueOf();
    return log;
  }
</script>

<div class="n-list">
  {#each logs as apiLog, index}
    {#if discarded.indexOf(apiLog._id) === -1}
      <ListItemLog log={toLog(apiLog)} />
      <div class="n-row px-2">

        <!-- <Button
          color="success"
          block
          disabled={state.capturingId === apiLog.id}
          on:click={() => {
            methods.capture(apiLog);
          }}>
          {#if state.capturingId === apiLog.id}
            <Spinner color="#FFF" size={24} />
            {Lang.t('general.saving', 'Saving')}
          {:else}
            <NIcon name="checkmarkOutline" className="fill-white mr-2" />
            {Lang.t('general.accept', 'Accept')}
          {/if}
        </Button> -->
      </div>
    {/if}
    <hr />
  {/each}

</div>
<ListItem className="bg-transparent mb-3">
  <Button type="outlined" color="danger" block className="mr-1 my-0">
    <Icon name="closeOutline" className="fill-white mr-2" />
    {Lang.t('nomie-api.clear-remaining', 'Clear Remaining')}
  </Button>
</ListItem>
<!-- {#if logs.length > state.hidden.length}
  
{/if} -->
{#if !logs.length}
  <Empty title={Lang.t('nomie-api.no-recent-logs-capture', 'No Recent Logs Captured')} emoji="🧐" />
{/if}
