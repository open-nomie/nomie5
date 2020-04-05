<script>
  /**
   * God Speed! We're going to make a chart
   */

  // Svelte
  import { createEventDispatcher, onMount } from "svelte";

  // Utils

  import math from "../../utils/math/math";

  // vendor
  import { scaleLinear } from "d3-scale";

  export let labels = [];
  export let height = 200;
  export let width = 500;
  export let title = "";
  export let color = "#4d84a1";
  export let points;
  export let activeIndex;
  export let xFormat = x => x;
  export let yFormat = y => y;

  const xTicks = labels;
  let yTicks = [0, 5, 10, 20];
  const padding = { top: 30, right: 15, bottom: 25, left: 25 };
  const dispatch = createEventDispatcher();

  let finalPoints = [];
  let lastPoints = null;

  $: if (points && JSON.stringify(points) !== JSON.stringify(lastPoints)) {
    lastPoints = JSON.stringify(points);

    console.log("Bar Chart Points Changed", points);

    if (points.length) {
      let values = points.map(point => point.y);

      let sum = math.sum(values);
      let max = math.max(values);

      if (sum) {
        yTicks = [0, math.round(max * 0.5), max];
      }
      finalPoints = math.percentile(values).map((value, index) => {
        let p = { ...points[index] };
        p.y = value;
        return p;
      });
    }
  }

  $: xScale = scaleLinear()
    .domain([0, xTicks.length])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleLinear()
    .domain([0, Math.max.apply(null, yTicks)])
    .range([height - padding.bottom, padding.top]);

  $: innerWidth = width - (padding.left + padding.right);
  $: barWidth = innerWidth / xTicks.length;

  const methods = {
    onTap(event, data) {
      dispatch("tap", data);
    },
    formatMobile(tick, index) {
      if (index % 2) {
        return "";
      } else {
        return tick.substr(0, 2);
      }
    },
    toTrustedValue(value, base) {
      return isNaN(value) ? base : value;
    }
  };

  onMount(() => {
    console.log("Bar Chart Mounted Labels", points.map(p => p.x));
    console.log("Bar Chart Mounted values", points.map(p => p.y));
  });
</script>

<style lang="scss">
  h2 {
    text-align: center;
  }

  .n-chart {
    width: 100%;
    max-width: 500px;
    position: relative;
    margin: 0 auto;
  }

  svg {
    position: relative;
    width: 100%;
  }

  .tick {
    font-size: 0.625em;
  }

  .tick line {
    stroke: var(--color-solid-2);
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #ccc;
    text-anchor: start;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }

  .x-axis .tick text {
    text-anchor: middle;
  }
  .title {
    position: absolute;
    top: 0px;
    left: 0px;
    font-size: 0.67rem;
    color: var(--color-inverse);
  }
  .active-item {
    position: absolute;
    top: -4px;
    right: -4px;
    // background-color: var(--color-solid);
    color: var(--color-inverse);
    // border-radius: 4px;
    // box-shadow: var(--box-shadow-tight);
    z-index: 120;
    padding: 4px 10px;
    font-size: 0.67rem;
    display: flex;
    opacity: 0.6;
    .value {
      color: #fff;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 10px;
      padding: 0 6px;
    }
    label {
      margin: 0;
      margin-right: 6px;
    }
  }

  .bars rect {
    stroke: none;
    opacity: 0.65;
    transition: all 0.2s, width 0;
    &.active {
      stroke: rgba(0, 0, 0, 0.2);
      stroke-width: 4px;
      opacity: 1;
    }
  }
</style>

{#if points}
  <div class="n-chart" bind:clientWidth={width} bind:clientHeight={height}>
    {#if title}
      <div class="title">{title}</div>
    {/if}
    <svg height={`${height}px`}>
      <!-- y axis -->
      <g class="axis y-axis" transform="translate(0,{padding.top})">
        {#each yTicks as tick}
          <g
            class="tick tick-{tick}"
            transform="translate(0, {yScale(tick) - padding.bottom})">
            <line x2="100%" />
            <text y="-4">{yFormat(tick)} {tick === 20 ? '' : ''}</text>
          </g>
        {/each}
      </g>

      <!-- x axis -->
      <g class="axis x-axis">
        {#each points as point, i}
          <g class="tick" transform="translate({xScale(i)},{height})">
            <text x={barWidth / 2} y="-4">{xFormat(point.x)}</text>
          </g>
        {/each}
      </g>

      <g class="bars">
        {#each points as point, i}
          <rect
            on:click={event => {
              methods.onTap(event, {
                index: i,
                point: points[i],
                label: labels[i]
              });
            }}
            rx="4"
            class="bar {activeIndex === i + 1 ? 'active' : ''}"
            ry="4"
            style="fill: {color}"
            x={xScale(i) + 2}
            y={methods.toTrustedValue(yScale(point.y), 0)}
            width={barWidth - 4}
            height={methods.toTrustedValue(height - padding.bottom - yScale(point.y), 0)} />
        {/each}
      </g>
    </svg>
    {#if activeIndex && points[activeIndex - 1]}
      <div class="active-item">
        <label>
          {points[activeIndex - 1].date.format(points.length == 12 ? 'MMM YYYY' : 'ddd MMM Do')}
        </label>
        <div class="value" style="background-color:{color}">
          {yFormat(points[activeIndex - 1].y)}
        </div>
      </div>
    {/if}
  </div>
{/if}
