<script lang="ts">
  import Button from "../../components/button/button.svelte";
  import Card from "../../components/card/card.svelte";
  import Divider from "../../components/divider/divider.svelte";
  import Empty from "../empty/empty.svelte";
  import ApiLogItem from "./api-log-item.svelte";

  import { Lang } from "../../store/lang";
  import { ApiStore } from "./api-store";

  import type { NapiLog } from "./api-cli";

  let saved: Array<NapiLog> = []; // Holder of saved
  let discarded: Array<NapiLog> = []; // holder of disacrded
  let notsaved: Array<NapiLog> = []; // hodler of posts from the API itself

  $: {
    saved = $ApiStore.inArchive.filter((l) => l.saved);
    discarded = $ApiStore.inArchive.filter((l) => l.discarded);
    notsaved = $ApiStore.inArchive.filter((l) => !l.saved && !l.discarded);
  }
</script>

<div class="app-contain-md">
  
  {#if notsaved.length > 0}
    <Divider pad hideLine>
      <div class="filler">{Lang.t('general.not-saved', 'Not Saved')}</div>
    </Divider>
    <Card className="pb-2">
      {#each notsaved as log, index (log.id)}
        <ApiLogItem {log} />
        {#if index < notsaved.length - 1}
          <Divider inset />
        {/if}
      {/each}
    </Card>
  {/if}

  {#if discarded.length > 0}
    <Divider pad>
      <div class="filler">{Lang.t('general.discarded', 'Discarded')}</div>
    </Divider>
    <Card>
      {#each discarded as log, index (log.id)}
        <ApiLogItem {log} />
        {#if index < discarded.length - 1}
          <Divider inset />
        {/if}
      {/each}
    </Card>
  {/if}

  {#if saved.length > 0}
    <Divider pad>
      <div class="filler">{Lang.t('general.saved', 'Saved')}</div>
    </Divider>
    <Card>
      {#each saved as log, index (log.id)}
        <ApiLogItem {log} />
        {#if index < saved.length - 1}
          <Divider inset />
        {/if}
      {/each}
    </Card>
  {/if}

  {#if saved.length + discarded.length > 0}
    <div class="p-2">
      <Button
        color="light"
        on:click={ApiStore.clearArchives}
        confirm={true}
        shape="rounded"
        block>
        Clear Archives
      </Button>
    </div>
  {:else}
    <Empty
      emoji="🤙"
      title="Empty Archive"
      description="This is ok, the archive is used as a backup for your API
      logs. So if a log isn't properly saved, you can get to it here." />
  {/if}
</div>
