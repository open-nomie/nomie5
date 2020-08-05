<script type="ts">
  import { Interact } from "./../../store/interact.js";
  import { createEventDispatcher, onMount } from "svelte";
  import Chart from "chart.js";
  import nid from "../../modules/nid/nid";
  const dispatch = createEventDispatcher();
  import math from "../../utils/math/math";
  import { UserStore } from "../../store/user-store";
  import NIcon from "../icon/icon.svelte";
  import tick from "../../utils/tick/tick";
  import Button from "../button/button.svelte";

  export let labels = [];
  export let height = 200;

  export let title = "";
  export let color = "#4d84a1";
  export let points;
  // export let activeIndex;
  export let xFormat = (x) => x;
  export let yFormat = (y) => y;
  export let hideYTicks = false;
  export let type = "bar";

  const chartId = `chart-${nid()}`;

  // console.log("chart", points);

  let showChart = false;
  let _canvas;
  let theChart;
  let lastPoints = [];

  export let selected = undefined;

  $: if (points && theChart && points.map((p) => p.y).join() !== lastPoints) {
    lastPoints = points.map((p) => p.y).join();
    loadData();
  }

  interface IPieData {
    label: string;
    value: number;
    color: string;
  }

  function loadData() {
    const lineStyle = {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      borderColor: color,
    };
    const barStyle = {
      backgroundColor: color,
    };

    theChart.data.labels = labels || points.map((row) => row.x);
    theChart.data.datasets = [
      {
        ...(type == "line" ? lineStyle : barStyle),
        data: points.map((row) => row.y),
        maxBarThickness: 34,
        minBarLength: 2,
      },
    ];
    theChart.update();
  }

  async function initChart() {
    console.log("📊📊📊 initilizaing Chart");
    // showChart = false;
    // // await tick(200);
    // showChart = true;
    var ctx = document.getElementById(chartId);

    const chartConfig = {
      type,
      options: {
        animation: {
          duration: 0, // general animation time
        },

        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return yFormat ? yFormat(tooltipItem.value) : tooltipItem.value;
            },
          },
        },

        defaultColor: color,
        responsive: true,
        defaultFontSize: 10,
        legend: {
          display: false,
        },
        maintainAspectRatio: false,
        title: {
          display: title,
          text: title,
        },
        scales: {
          yAxes: [
            {
              ticks: {
                maxTicksLimit: 6,
                callback(value, index, values) {
                  if (yFormat) {
                    return yFormat(value);
                  } else {
                    return value;
                  }
                },
                fontSize: 9,
                beginAtZero: true,
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                callback(value, index, values) {
                  if (xFormat) {
                    return xFormat(value);
                  } else {
                    return value;
                  }
                },
                display: hideYTicks !== true,
                fontSize: 9,
              },
            },
          ],
        },
      },
    };

    theChart = new Chart(ctx, chartConfig);
    _canvas.addEventListener("click", (evt) => {
      let passed = theChart.getElementsAtEvent(evt);
      if (passed.length) {
        selected = points[passed[0]._index];
      }
      // dispatch("tap", selected);
    });

    console.log("The Chart", theChart);
  }

  onMount(() => {
    initChart();
    if (points) {
      showChart = true;
    }
  });
</script>

<style>
  .wrapper {
    position: relative;
  }
  .wrapper .selected {
    position: absolute;
    right: 16px;
  }
</style>

<!-- {#if title}
  <div
    class="title clickable truncate"
    style="z-index:120; "
    on:click={() => {
      dispatch('titleClick', title);
    }}>
    {title}
    <NIcon name="chevronRight" size="14" />
  </div>
{/if} -->
<div class="wrapper">
  {#if selected && selected.unit == 'day'}
    <div class="selected">
      <Button
        size="xs"
        color="light"
        on:click={() => {
          dispatch('more', selected);
        }}>
        {selected.x}
        <NIcon name="more" size="14" />
      </Button>

    </div>
  {/if}
  <canvas id={chartId} bind:this={_canvas} width="100%" {height} />
</div>
