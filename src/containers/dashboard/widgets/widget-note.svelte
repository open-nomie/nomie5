<script lang="ts">
  import dayjs from "dayjs";

  import { onMount } from "svelte";
  import Text from "../../../components/text/text.svelte";

  import type { Widget } from "../../../modules/dashboard/widget";
  import type NLog from "../../../modules/nomie-log/nomie-log";
  import { Lang } from "../../../store/lang";
  import { formatValue } from "../dashboard-helpers";

  export let widget: Widget;

  let log: NLog | undefined;
  $: if (widget.logs) {
    log = widget.logs[0];
  }
  onMount(() => {
    console.log("Note Widget");
  });
</script>

<style>
  /* .current {
    font-size: 1.5em;
  } */
  .value {
    max-height: 100px;
    overflow-y: auto;
  }
  :global(.widget-size-sm .widget-note.value .n-text) {
    font-size: 70%;
  }
</style>

{#if log}
  <div class="overflow-y-auto widget-note value">
    <Text size="md" className="px-2">{log.note}</Text>
    <Text size="sm" className="mt-1 px-2" faded>
      {dayjs(log.end).fromNow()}
    </Text>
  </div>
{:else}
  <div class="empty value">
    {Lang.t('general.no-note-found', 'No note found')}
  </div>
{/if}
