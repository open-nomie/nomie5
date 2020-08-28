<script lang="ts">
  import type { Widget } from "../../../modules/dashboard/widget";
  import dayjs from "dayjs";
  import Text from "../../../components/text/text.svelte";
  export let widget: Widget;
</script>

{#if widget}
  <div class="value last-used">
    <div class="current">
      {#if widget.lastUsed}
        <Text size="md" bold center>{dayjs(widget.lastUsed).fromNow()}</Text>
        <Text size="xs" className="mt-2" faded center>{dayjs(widget.lastUsed).format(`${widget.dateFormat} ${widget.timeFormat} `)}</Text>
      {:else}
        <Text size="md">Unknown</Text>
      {/if}
    </div>
  </div>
{/if}
