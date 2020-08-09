<script>
  export let statsDow = null;
  export let color = null;
  export let height = 100;

  import BarChart from "../charts/bar-chart-2.svelte";

  let points = [];

  $: if (statsDow) {
    points = [
      { y: statsDow.mon.count, x: "M" },
      { y: statsDow.tue.count, x: "T" },
      { y: statsDow.wed.count, x: "W" },
      { y: statsDow.thu.count, x: "T" },
      { y: statsDow.fri.count, x: "F" },
      { y: statsDow.sat.count, x: "S" },
      { y: statsDow.sun.count, x: "S" },
    ];
  }
</script>

{#if statsDow}
  <BarChart {points} {height} hideYTicks={true} type="line" labels={points.map((p) => p.x)} {color} />
{/if}
