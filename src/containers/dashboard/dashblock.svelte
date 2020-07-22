<script>
  import PositivityBar from "./../../components/positivity-bar/positivity-bar.svelte";
  import BarChart from "./../../components/charts/bar-chart.svelte";
  import TrackerSmallBlock from "./../../components/tracker-ball/tracker-small-block.svelte";
  import Text from "./../../components/text/text.svelte";
  import { Block } from "./block";

  export let block;

  $: if (block) {
    console.log("♎️ ♎️♎️♎️♎️  Block Changed", block.stats);
  }

  function formatValue(value) {
    if (block.element.obj.displayValue) {
      return block.element.obj.displayValue(value);
    } else {
      return value;
    }
  }
</script>

<style lang="scss">
  .dashboard-block {
    margin: 4px;
    height: 130px;
    display: inline-flex;
    flex-direction: column;
    background-color: var(--color-solid);
    border-radius: 8px;
    box-shadow: var(--box-shadow-float);
    min-width: calc(50% - 12px);
    max-width: 175px;
    flex-grow: 1;
    .block-header,
    .block-footer {
      padding: 6px 12px;
      flex-grow: 0;
      flex-shrink: 0;
      height: 20px;
    }
    .block-main {
      height: 90px;
    }
  }
  .type-chart {
    min-width: calc(100% - 20px);
    max-width: 320px;
  }
  .value {
    display: flex;
    flex-grow: 1;
    align-items: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    .current {
      font-size: 2rem;
    }
  }
</style>

{#if block && block.stats}
  <div class="dashboard-block type-{block.type}">
    <div class="block-header">
      <TrackerSmallBlock xs novalue element={block.element} />
    </div>
    <div class="block-main">
      {#if block.type == 'chart' && block.stats && block.stats.chart}
        <BarChart
          height={100}
          color={'blue'}
          labels={block.stats.chart.values.map(point => point.x)}
          points={block.stats.chart.values}
          xFormat={(x, index) => {
            return x;
          }}
          yFormat={y => {
            return y;
          }} />
      {:else if block.type == 'value' && block.stats}
        <div class="value">
          <div class="current">
            {block.math == 'mean' ? formatValue(block.stats.avg) : formatValue(block.stats.sum)}
          </div>
        </div>
      {:else if block.type == 'positivity' && block.stats}
        <div class="value">
          <PositivityBar
            positive={20}
            neutral={10}
            negative={30}
            style="width:100%"
            height="50px" />
        </div>
      {:else}{block.type} {Object.keys(block)}{/if}
    </div>
    <div class="block-footer">
      <Text size="xs">{block.getLabel()}</Text>
    </div>
  </div>
{/if}
