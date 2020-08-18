<script lang="ts">
  import BarChart from "../../../components/charts/bar-chart-2.svelte";
  import { getWidgetColor } from "../dashboard-helpers";
  import type { Widget } from "../../../modules/dashboard/widget";
  export let widget: Widget;
</script>

<style>
  .chart-value {
    height: 100%;
    flex-grow: 1;
    flex-shrink: 0;
    display: flex;
    width: 100%;
    display: column;
    justify-content: stretch;
  }
</style>

{#if widget}
  <div class="chart-value">
    <BarChart
      height={100}
      type={widget.type == 'linechart' ? 'line' : 'bar'}
      color={getWidgetColor(widget)}
      labels={widget.stats.chart.values.map((point) => point.x)}
      points={widget.stats.chart.values}
      xFormat={(x, index) => {
        return x;
      }}
      yFormat={(y) => {
        return y;
      }} />
  </div>
{/if}
