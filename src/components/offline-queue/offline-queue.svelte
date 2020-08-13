<script lang="ts">
  import { OfflineQueue } from "../../store/offline-queue-store";
  import Text from "../text/text.svelte";
  import Spinner from "../spinner/spinner.svelte";
  import { Device } from "../../store/device-store";

  declare var window: any;
</script>

{#if $OfflineQueue.logs && $OfflineQueue.logs.length}
  <div class="container-sm">
    <div class="offline-queue pt-2 pb-1 text-center">
      {#if $OfflineQueue.status !== 'syncing'}
        <Text inline size="sm" faded>
          {$OfflineQueue.logs.length} {$OfflineQueue.logs.length > 1 ? 'logs' : 'log'} in the offline queue.
        </Text>
        {#if !$Device.offline}
          <Text inline underline color="primary-bright" className="ml-2" size="sm" on:click={OfflineQueue.sync}>Sync Now</Text>
        {:else}
          <Text inline className="ml-2" size="sm">Offline</Text>
        {/if}
      {:else}
        <Text size="sm">
          <Spinner size={16} />
          Syncing...
        </Text>
      {/if}
    </div>
  </div>
{/if}
