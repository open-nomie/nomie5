<script lang="ts">
  import Card from "../../components/card/card.svelte";
  import Divider from "../../components/divider/divider.svelte";
  import { Lang } from "../../store/lang";
  import Empty from "../empty/empty.svelte";
  import ApiLogItem from "./api-log-item.svelte";
  import { ApiStore } from "./api-store";
</script>

<div class="app-contain-md">
  {#if $ApiStore.inAPI.length === 0}
    <Empty
      title={Lang.t('api.no-new-entries', 'No new API entries')}
      description={Lang.t('api.usage-description', 'Use services like IFTTT and Zapier to post Nomie data notes directly to this device.')}
      emoji="📭" />
  {/if}

  {#if $ApiStore.inAPI.length}
    <Divider pad>{Lang.t('api.unsaved-api-logs', 'Unsaved Api Logs')}</Divider>
    <Card className="pb-2">
      {#each $ApiStore.inAPI as log (log.id)}
        <ApiLogItem {log} />
        <Divider inset />
      {/each}
    </Card>
  {/if}
</div>
