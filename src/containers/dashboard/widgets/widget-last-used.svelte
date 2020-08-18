<script lang="ts">
  import type { Widget } from "../../../modules/dashboard/widget";
  import dayjs from "dayjs";
  export let widget: Widget;
</script>

{#if widget}
  <div class="value last-used">
    <div class="current">
      {#if widget.lastUsed}{dayjs(widget.lastUsed).fromNow()}{:else}Unknown{/if}
    </div>
  </div>
{/if}
