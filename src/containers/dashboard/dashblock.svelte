<script lang="ts">
  import PositivityBar from "./../../components/positivity-bar/positivity-bar.svelte";
  import BarChart from "./../../components/charts/bar-chart.svelte";
  import TrackerSmallBlock from "./../../components/tracker-ball/tracker-small-block.svelte";
  import Text from "./../../components/text/text.svelte";
  import { Block } from "../../modules/dashboard/block";
  import { createEventDispatcher } from "svelte";
  import Pie from "../../components/chart/pie.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import Button from "../../components/button/button.svelte";

  const dispatch = createEventDispatcher();

  export let block: Block;

  function formatValue(value): string {
    if (block.element.obj.displayValue) {
      return block.element.obj.displayValue(value);
    } else {
      return value;
    }
  }
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  .dashboard-block {
    margin: 4px;
    display: inline-flex;
    flex-direction: column;
    background-color: var(--color-solid);
    border-radius: 8px;
    box-shadow: var(--box-shadow-float);
    min-width: calc(50% - 12px);
    max-width: 175px;

    @include media-breakpoint-up(md) {
      max-width: 130px;
      min-width: 130px;
    }

    flex-grow: 1;
    .block-header,
    .block-footer {
      padding: 6px 8px;
      flex-grow: 0;
      flex-shrink: 0;
      min-height: 32px;
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
    <div class="block-header n-row">
      <TrackerSmallBlock xs novalue element={block.element} />

      <Button
        size="xs"
        color="clear"
        className="p-0"
        on:click={() => {
          dispatch('click');
        }}>
        <Icon name="settings" size="16" />
      </Button>
    </div>
    <div class="block-main">
      {#if block.type == 'chart' && block.stats && block.stats.chart}
        <BarChart
          height={100}
          color={'blue'}
          labels={block.stats.chart.values.map((point) => point.x)}
          points={block.stats.chart.values}
          xFormat={(x, index) => {
            return x;
          }}
          yFormat={(y) => {
            return y;
          }} />
      {:else if block.type == 'value' && block.stats}
        <div class="value">
          <div class="current">{block.math == 'mean' ? formatValue(block.stats.avg) : formatValue(block.stats.sum)}</div>
        </div>
      {:else if block.type == 'positivity' && block.stats}
        <div class="value">
          <Pie
            data={[{ label: 'Positive', value: block.positivity.positive, color: '#38a83f' }, { label: 'Neutral', value: block.positivity.neutral, color: '#319ed7' }, { label: 'Negative', value: block.positivity.negative, color: '#e94151' }]} />
          <!-- <PositivityBar
            positive={block.positivity.positive}
            neutral={block.positivity.neutral}
            negative={block.positivity.negative}
            style="width:100%"
            height="50px" /> -->
        </div>
      {:else}{block.type} {Object.keys(block)}{/if}
    </div>
    <div class="block-footer">
      <Text size="xs">{block.getLabel()}</Text>
    </div>
  </div>
{/if}
