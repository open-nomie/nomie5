<script lang="ts">
  import type { Widget } from '../../../modules/dashboard/widget'
  import dayjs from 'dayjs'
  import Text from '../../../components/text/text.svelte'
  export let widget: Widget
</script>

{#if widget}
  <div class="value last-used">
    <div class="current">
      {#if widget.lastUsed}
        <div class="mb-1 text-xl font-bold dark:text-white">
          {dayjs(widget.lastUsed).fromNow()}
        </div>
        <div class="text-xs text-gray-500">
          {dayjs(widget.lastUsed).format(`${widget.dateFormat} ${widget.timeFormat} `)}
        </div>
      {:else}
        <Text size="md">Unknown</Text>
      {/if}
    </div>
  </div>
{/if}
