<script type="ts">
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();

  import Chart from "chart.js";

  import NIcon from "../icon/icon.svelte";
  import Button from "../button/button.svelte";

  import math from "../../utils/math/math";
  import tick from "../../utils/tick/tick";

  import nid from "../../modules/nid/nid";

  import { UserStore } from "../../store/user-store";
  import { Interact } from "../../store/interact";

  export let labels = [];
  export let height = 200;

  export let title = "";
  export let color = "#4d84a1";
  export let points;
  export let activeIndex = undefined;
  export let xFormat = (x) => x;
  export let yFormat = (y) => y;
  export let hideYTicks: boolean = false;
  export let hideXTicks: boolean = false;
  export let type: string = "bar";
  export let beginAtZero: boolean = true;

  // Generate a random ID for this Component
  const chartId = `chart-${nid()}`;

  let showChart = false;
  let _canvas;
  let theChart;
  let lastPoints = [];

  export let selected = undefined;

  $: if (points && theChart && points.map((p) => p.y).join() !== lastPoints) {
    lastPoints = points.map((p) => p.y).join();
    loadData();
  }

  function loadData() {
    const lineStyle = {
      backgroundColor: "transparent",
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
                beginAtZero: beginAtZero,
                display: hideYTicks == false,
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
                display: hideXTicks == false,
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
      dispatch("tap", selected);
    });
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
    width: 100%;
  }
  .wrapper .selected {
    position: absolute;
    right: 16px;
  }
</style>

<div class="wrapper">
  {#if selected && selected.unit == 'day'}
    <div class="selected">
      <Button
        size="xs"
        color="light"
        on:click={() => {
          Interact.onThisDay(selected.date.toDate());
        }}>
        {selected.x}
        <NIcon name="chevronRight" size="14" />
      </Button>

    </div>
  {/if}
  <canvas id={chartId} bind:this={_canvas} width="100%" {height} />
</div>
