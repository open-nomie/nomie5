<script>
  /**
   * God Speed! We're going to make a chart
   */

  // Svelte
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();
  // Utils

  import math from "../../utils/math/math";

  // vendor
  import { scaleLinear } from "d3-scale";
  import { UserStore } from "../../store/user";

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

  let finalPoints = [];
  let lastPoints = null;

  $: hourFormat = $UserStore.meta.is24Hour ? "ddd HH" : "ddd ha";

  $: if (points && JSON.stringify(points) !== JSON.stringify(lastPoints)) {
    lastPoints = JSON.stringify(points);

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

  let lastActiveIndex;

  $: if (activeIndex != lastActiveIndex) {
    lastActiveIndex = activeIndex;
  }

  function showValue(value, index) {
    return true;
  }

  function showLabel(label, index) {
    if (labels.length > 12 && labels.length < 24) {
      return index % 2;
    } else if (labels.length >= 24) {
      return index % 4 != 0 ? false : true;
    } else {
      return true;
    }
  }

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

  onMount(() => {});
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
    top: -2px;
    right: 0px;
    text-align: center;
    left: 0px;
    font-size: 0.67rem;
    color: var(--color-inverse-2);
    opacity: 0.5;
  }
  .active-item {
    position: absolute;
    top: 2px;
    right: 0px;
    // background-color: var(--color-solid);
    color: var(--color-inverse);
    // border-radius: 4px;
    // box-shadow: var(--box-shadow-tight);
    z-index: 120;
    padding: 4px 10px;
    font-size: 0.67rem;
    display: flex;

    .value {
      color: #fff;
      text-shadow: 0px 2px 3px rgba(0, 0, 0, 0.4);
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
  <div
    class="n-chart"
    bind:clientWidth={width}
    bind:clientHeight={height}
    on:swiperight={() => {
      dispatch('swipeRight');
    }}
    on:swipeleft={() => {
      dispatch('swipeLeft');
    }}>
    {#if title}
      <div
        class="title clickable"
        style="z-index:120;"
        on:click={() => {
          dispatch('titleClick', title);
        }}>
        {title}
      </div>
    {/if}
    <svg height={`${height}px`}>
      <!-- y axis -->
      <g class="axis y-axis" transform="translate(0,{padding.top})">
        {#each yTicks as tick, index}
          {#if showValue(tick, index)}
            <g
              class="tick tick-{tick}"
              transform="translate(0, {yScale(tick) - padding.bottom})">
              <line x2="100%" />
              <text y="-4">{yFormat(tick)} {tick === 20 ? '' : ''}</text>
            </g>
          {/if}
        {/each}
      </g>

      <!-- x axis -->
      <g class="axis x-axis">
        {#each points as point, i}
          {#if showLabel(points, i)}
            <g class="tick" transform="translate({xScale(i)},{height})">
              <text x={barWidth / 2} y="-4">{xFormat(point.x)}</text>
            </g>
          {/if}
        {/each}
      </g>

      <g class="bars">
        {#each points as point, i}
          <rect
            on:click={event => {
              console.log('Event Click', event, i, point);
              methods.onTap(event, { index: i, point: point });
            }}
            rx="4"
            class="bar {activeIndex === i ? 'active' : ''}"
            ry="4"
            style="fill: {color}"
            x={xScale(i) + 2}
            y={methods.toTrustedValue(yScale(point.y), 0)}
            width={barWidth - 4}
            height={methods.toTrustedValue(height - padding.bottom - yScale(point.y), 0)} />
        {/each}
      </g>
    </svg>
    {#if activeIndex !== undefined && points[activeIndex] !== undefined}
      <div class="active-item">
        <label>
          {#if points[activeIndex].unit == 'hour'}
            {points[activeIndex].date.format(hourFormat)}
          {:else if points[activeIndex].unit == 'day'}
            {points[activeIndex].date.format('ddd MMM Do')}
          {:else if points[activeIndex].unit == 'month'}
            {points[activeIndex].date.format('MMM YYYY')}
          {/if}
        </label>
        <div class="value" style="background-color:{color}">
          {yFormat(points[activeIndex].y)}
        </div>
      </div>
    {/if}
  </div>
{/if}
