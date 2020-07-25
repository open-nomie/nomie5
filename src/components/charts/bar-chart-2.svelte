<script type="ts">
  import { Interact } from "./../../store/interact.js";
  import { createEventDispatcher, onMount } from "svelte";
  import Chart from "chart.js";
  import nid from "../../modules/nid/nid";
  const dispatch = createEventDispatcher();
  import math from "../../utils/math/math";
  import { UserStore } from "../../store/user";
  import NIcon from "../icon/icon.svelte";

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

  interface IPieData {
    label: string;
    value: number;
    color: string;
  }

  function initChart() {
    var ctx = document.getElementById(chartId);

    const lineStyle = {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      borderColor: color,
    };
    const barStyle = {
      backgroundColor: color,
    };

    const chartConfig = {
      type,
      data: {
        labels: labels || points.map((row) => row.x),
        datasets: [
          {
            ...(type == "line" ? lineStyle : barStyle),
            data: points.map((row) => row.y),
          },
        ],
      },
      options: {
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
                callback(value, index, values) {
                  if (yFormat) {
                    return yFormat(value);
                  } else {
                    return value;
                  }
                },
                fontSize: 9,
              },
            },
          ],
          xAxes: [
            {
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

    let myChart = new Chart(ctx, chartConfig);
  }
  onMount(initChart);
</script>

<style>

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
<canvas id={chartId} width="100%" {height} />
