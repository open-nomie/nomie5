<script lang="ts">
  import Button from "../../components/button/button.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import ListItem from "../../components/list-item/list-item.svelte";
  import Text from "../../components/text/text.svelte";
  import type { NapiLog } from "./api-cli";
  import { ApiStore } from "./api-store";

  export let log: NapiLog;
  // const dispatch = createEventDispatcher();
</script>

<ListItem>
  <div slot="left">
    <Button icon on:click={() => ApiStore.discard(log)}>
      <Icon name="delete" size="20" />
    </Button>
  </div>
  <Text size="sm" className="mb-1">{log.note}</Text>
  <Text size="xs" faded>
    {new Date(log.date).toLocaleDateString()}
    {new Date(log.date).toLocaleTimeString()}
  </Text>
  <div slot="right">
    <div className="n-col justify-center items-center">
      {#if log.discarded}
        <Button
          size="xs"
          shape="round"
          color="danger"
          on:click={() => ApiStore.restoreLog(log)}>
          Restore
        </Button>
      {:else if log.saved}
        <Button size="xs" shape="round" color="light">Saved</Button>
      {:else if !log.saved}
        <Button
          size="xs"
          shape="round"
          color="primary"
          on:click={() => ApiStore.import([log])}>
          Save
        </Button>
      {/if}
    </div>
  </div>
</ListItem>
