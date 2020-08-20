<script lang="ts">
  import type { Widget } from "../../../modules/dashboard/widget";
  import { formatValue } from "../dashboard-helpers";

  export let widget: Widget;
</script>

<style>
  .current {
    font-size: 1.5rem;
  }
</style>

<div class="value {widget.includeAvg ? 'value-sm' : ''}">
  <div class="current">{widget.math == 'mean' ? formatValue(widget.stats.avg, widget) : formatValue(widget.stats.sum, widget)}</div>
  {#if widget.includeAvg}
    <div class="avg">avg {formatValue(widget.stats.avg, widget)}</div>
  {/if}
</div>
