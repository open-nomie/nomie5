<script lang="ts">
import Avatar from '../../components/avatar/avatar.svelte';
import Button from '../../components/button/button.svelte';
import Card from '../../components/card/card.svelte';
import Spinner from '../../components/spinner/spinner.svelte';
import Text from '../../components/text/text.svelte';

import { ApiStore } from './api-store';

</script>

<style global>
  .api-register--card {
    display:flex;
    flex-direction:column;
    justify-content: center;
    align-items:center;
    padding:24px;
  }
</style>

<div class="api-register-bound">
  <Card
    className="p-6 mx-auto api-register--card">
    <Avatar size={80} emoji="🚀" className="mt-3" />
    <Text center bold size="xl" className="my-4 max-w-sm leading-4">
      No API Key Setup
    </Text>
    {#if !$ApiStore.generating}
      <Text size="sm" center faded className="mb-4 max-w-sm mx-auto">
       Get an API Key and use services like IFTTT or Zapier to
        push data to Nomie.
      </Text>
      <div class="flex items-center">
        <Button type="clear" on:click={ApiStore.restoreKeys}>Restore</Button>
        <Button type="clear" color="primary" on:click={ApiStore.register}>
          Get New Key
        </Button>
      </div>
    {:else}
      <Text size="lg" className="mb-10 flex items-center">
        <Spinner />
        <span class="ml-2 text-sm">Generating...</span>
      </Text>
    {/if}
  </Card>
</div>