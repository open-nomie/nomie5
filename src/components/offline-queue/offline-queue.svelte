<script lang="ts">
  import { OfflineQueue } from "../../store/offline-queue-store";
  import Text from "../text/text.svelte";
  import Spinner from "../spinner/spinner.svelte";
</script>

{#if $OfflineQueue.logs && $OfflineQueue.logs.length}
  <div class="container-sm">
    <div class="offline-queue pt-2 pb-1 text-center">
      {#if $OfflineQueue.status == 'idle'}
        <Text inline size="sm" faded>{$OfflineQueue.logs.length} logs in the offline queue.</Text>
        <Text inline underline color="primary-bright" className="ml-2" size="sm" on:click={OfflineQueue.sync}>Sync Now</Text>
      {:else}
        <Text size="sm">
          <Spinner size={16} />
          Syncing...
        </Text>
      {/if}
    </div>
  </div>
{/if}
