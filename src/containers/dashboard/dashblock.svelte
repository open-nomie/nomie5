<script lang="ts">
  import PositivityBar from "./../../components/positivity-bar/positivity-bar.svelte";
  import BarChart from "./../../components/charts/bar-chart-2.svelte";
  import TrackerSmallBlock from "./../../components/tracker-ball/tracker-small-block.svelte";
  import Text from "./../../components/text/text.svelte";
  import { Block } from "../../modules/dashboard/block";
  import { createEventDispatcher } from "svelte";
  import Pie from "../../components/charts/pie.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import Button from "../../components/button/button.svelte";
  import { strToColor } from "../../components/dymoji/dymoji";
  import { LastUsed } from "../../store/last-used";
  import dayjs from "dayjs";
  import { element } from "svelte/internal";
  import nid from "../../modules/nid/nid";
  import Calendar from "../../components/calendar/calendar.svelte";
  import { Interact } from "../../store/interact";
  import DashblockWhatTime from "./dashblock-what-time.svelte";

  const dispatch = createEventDispatcher();
  const id = nid();
  export let block: Block;

  function formatValue(value): string {
    if (block.element.obj && block.element.obj.displayValue) {
      return block.element.obj.displayValue(value);
    } else {
      return value;
    }
  }

  function getBlockColor(block: Block) {
    if (block.element && block.element.obj && block.element.obj.color) {
      return block.element.obj.color;
    } else {
      return strToColor(block.element.id);
    }
  }

  function getClass(block: Block): string {
    let classes = [`type-${block.type}`];
    let value;
    if (block.stats) {
      if (block.type == "last-used") {
        value = block.stats.daysPast;
      } else {
        value = block.math !== "sum" ? block.stats.avg : block.stats.sum;
      }
    }
    value = value || 0;

    if (block.compareValue) {
      if (value > block.compareValue) {
        classes.push(`over block-${block.compareOverColor}`);
      } else if (value < block.compareValue) {
        classes.push(`over block-${block.compareUnderColor}`);
      }
    }
    return classes.join(" ");
  }
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";

  .dashboard-text {
    padding: 8px 16px;
    min-width: 100%;
    flex-grow: 1;
    width: 100%;
    font-size: 0.9rem;
    color: var(--color-inverse-2);
  }

  :global(.dashboard-block.over .block-footer .n-text, .dashboard-block.under .block-footer .n-text) {
    color: #fff !important;
  }
  :global(.dashboard-block.block-red .block-footer) {
    background-color: var(--color-red);
  }
  :global(.dashboard-block.block-blue .block-footer) {
    background-color: var(--color-blue);
  }
  :global(.dashboard-block.block-green .block-footer) {
    background-color: var(--color-green);
  }
  :global(.dashboard-block.block-orange .block-footer) {
    background-color: var(--color-orange);
  }
  .dashboard-block {
    margin: 8px;
    display: inline-flex;
    flex-direction: column;
    background-color: var(--color-solid);
    border-radius: 16px;
    box-shadow: var(--box-shadow-float);
    overflow: hidden;

    min-width: 148px;
    @include media-breakpoint-down(xs) {
      min-width: calc(50% - 16px);
    }
    width: calc(50% - 16px);
    max-width: calc(50% - 16px);

    @include media-breakpoint-up(md) {
      width: calc(25% - 16px);
      max-width: calc(50% - 16px);
    }

    flex-shrink: 1;
    flex-grow: 1;
    .block-header,
    .block-footer {
      padding: 6px 8px;
      flex-grow: 0;
      flex-shrink: 0;
      min-height: 32px;
    }
    .block-footer {
      margin-top: 8px;
    }

    .block-main {
      height: 90px;
    }
  }
  .type-barchart,
  .type-linechart {
    min-width: calc(100% - 16px) !important;
    max-width: calc(100% - 16px);
    @include media-breakpoint-up(md) {
      min-width: calc(50% - 16px) !important;
    }
  }
  .value {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--color-inverse);
    height: 100%;
    padding: 2px 8px;
    .current {
      font-size: 2rem;
      line-height: 100%;
      text-align: center;
    }
    &.value-sm {
      .current {
        font-size: 1.4rem;
      }
      .avg {
        opacity: 0.6;
      }
    }
    &.last-used {
      .current {
        font-size: 1.5rem;
      }
    }
  }
</style>

{#if block && block.type !== 'text'}
  <div class="dashboard-block {getClass(block)}" {id}>
    <div class="block-header n-row">
      <TrackerSmallBlock
        xs
        truncate
        novalue
        element={block.element}
        on:click={() => {
          Interact.openStats(block.element.toSearchTerm());
        }} />
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
      {#if ['barchart', 'linechart'].indexOf(block.type) > -1 && block.stats && block.stats.chart}
        <BarChart
          height={100}
          type={block.type == 'linechart' ? 'line' : 'bar'}
          color={getBlockColor(block)}
          labels={block.stats.chart.values.map((point) => point.x)}
          points={block.stats.chart.values}
          xFormat={(x, index) => {
            return x;
          }}
          yFormat={(y) => {
            return y;
          }} />
      {:else if block.type == 'value' && block.stats}
        <div class="value {block.includeAvg ? 'value-sm' : ''}">
          <div class="current">{block.math == 'mean' ? formatValue(block.stats.avg) : formatValue(block.stats.sum)}</div>
          {#if block.includeAvg}
            <div class="avg">avg {formatValue(block.stats.avg)}</div>
          {/if}
        </div>
      {:else if block.type == 'what-time'}
        <DashblockWhatTime {block} />
      {:else if block.type == 'last-used'}
        <div class="value last-used">
          <div class="current">
            {#if block.lastUsed}{dayjs(block.lastUsed).fromNow()}{:else}Unknown{/if}
          </div>
        </div>
      {:else if block.type == 'positivity' && block.stats}
        <div class="value">
          <Pie
            data={[{ label: 'Positive', value: block.positivity.positive, color: '#38a83f' }, { label: 'Neutral', value: block.positivity.neutral, color: '#319ed7' }, { label: 'Negative', value: block.positivity.negative, color: '#e94151' }]} />
        </div>
      {:else}
        <div class="value">Unknown {block.type}</div>
      {/if}
    </div>
    <div class="block-footer n-row">
      {#if block.timeRange}
        <Text size="xs" className="text-center flex-grow text-uppercase font-weight-bold">{block.getLabel()}</Text>
      {/if}
    </div>
  </div>
{:else}
  <div
    {id}
    class="dashboard-text type-text text-center"
    on:click={() => {
      dispatch('click');
    }}>
    {block.description}
  </div>
{/if}
