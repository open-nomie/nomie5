<script>
  export let statsDow = null;
  export let color = null;
  export let height = 95;

  import BarChart from "../charts/bar-chart-2.svelte";

  let points = [];

  $: if (statsDow) {
    points = [
      { y: statsDow.mon.total, x: "M" },
      { y: statsDow.tue.total, x: "T" },
      { y: statsDow.wed.total, x: "W" },
      { y: statsDow.thu.total, x: "T" },
      { y: statsDow.fri.total, x: "F" },
      { y: statsDow.sat.total, x: "S" },
      { y: statsDow.sun.total, x: "S" },
    ];
  }
</script>

{#if statsDow}
  <BarChart {points} {height} hideYTicks={true} type="line" labels={points.map((p) => p.x)} {color} />
{/if}
