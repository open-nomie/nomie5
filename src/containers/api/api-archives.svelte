
<script lang="ts">
  import Row from "../../components/row/row.svelte";

	import { NapiLog, NomieAPI } from './../../store/napi';
  import { Lang } from "../../store/lang";

  import Empty from "../empty/empty.svelte";
  import ListItem from '../../components/list-item/list-item.svelte';
  import dayjs from 'dayjs';
  import Button from '../../components/button/button.svelte';

  import Text from '../../components/text/text.svelte';
  import Icon from "../../components/icon/icon.svelte";
import { Interact } from "../../store/interact";
import Divider from "../../components/divider/divider.svelte";

  let archives:Array<NapiLog>
  $: archives = $NomieAPI.inArchive.sort((a,b)=>{ return a.date < b.date ? 1 : -1 });

  function restore(log:NapiLog) {
    log.saved = false;
    log.discarded = false;
    NomieAPI.setStoredLogs(NomieAPI.getStoredLogs().map(_log=>{
      if(_log.id == log.id) {
        return log;
      } else {
        return _log;
      }
    }))
    NomieAPI.getLogsSafe();
  }

  async function removeAll() {
    const confirmed = await Interact.confirm('Remove all api Logs from the archive?', 'The archive exists just in case Nomie failed to import an API call. Most likely, this is safe to do');
    if(confirmed) {
      NomieAPI.setStoredLogs([]);
      NomieAPI.getLogsSafe();
    }
  }

  function remove(log:NapiLog) {
    log.saved = false;
    log.discarded = false;
    NomieAPI.setStoredLogs(NomieAPI.getStoredLogs().filter(_log=>{
      if(_log.id == log.id) {
        return false;
      } else {
        return true;
      }
    }))
    NomieAPI.getLogsSafe();
  }

  function showOptions(log:NapiLog) {
    const buttons = [{
      title: 'Restore',
      icon: "refresh",
      click() {
        restore(log);
      }
    },{
      title: 'Delete',
      icon: 'delete',
      async click() {
        const confirmed = await Interact.confirm('Remove from Archive?');
        if(confirmed) {
          remove(log);
        }
      }
    }]
    Interact.popmenu({ title: 'Log Options', buttons});
  }


</script>


{#if !$NomieAPI.inArchive.length}
  <div class="h-full">
    <Empty
      title={Lang.t('nomie-api.no-recent-logs-capture', 'No API Notes Captured')}
      emoji="🧐" />
  </div>
  {:else}
  <div class="mb-4">
    {#each archives as apiLog}
      <ListItem title={apiLog.note}>
        <Text size="sm" faded>{dayjs(apiLog.date).format('Do DD MMM YYYY H:m')}</Text>
        <div slot="right" class="n-row">
          {#if apiLog.saved}
            <div class="badge badge-green badge-xs">Saved</div>
          {:else if apiLog.discarded}
            <div class="text-white badge bg-red badge-xs">Discarded</div>
          {:else}
            <div class="badge badge-gray badge-xs">Unsaved</div>
          {/if}
          <Button icon className="ml-2" on:click={()=>showOptions(apiLog)}><Icon name="more"></Icon></Button>
        </div>
      </ListItem>
    {/each}
  </div>
  <ListItem title="Clear Archive" on:click={removeAll} className="text-danger mb-4"></ListItem>
{/if}
