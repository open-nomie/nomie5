<script lang="ts">
import Avatar from '../../components/avatar/avatar.svelte';
import Button from '../../components/button/button.svelte';

import Card from '../../components/card/card.svelte';
import Icon from '../../components/icon/icon.svelte';
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
      Let's get you a Nomie API key!
    </Text>
    {#if !$ApiStore.generating}
      <Text size="sm" faded className="mb-4 max-w-sm mx-auto">
        Once you have an API key, you can use services like IFTTT or Zapier to
        save Nomie Data Notes into this device.
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