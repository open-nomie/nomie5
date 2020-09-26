<script>
  import BarChart from "../charts/bar-chart-2.svelte";
  export let statsTod = null;
  export let color = null;

  let points = [];

  const labels = {
    early_morning: "Early AM",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
  };

  $: if (statsTod) {
    console.log({ statsTod });
    points = Object.keys(statsTod).map((key) => {
      return {
        x: labels[key],
        y: statsTod[key].total,
      };
    });
  }
</script>

<style lang="scss">

</style>

{#if statsTod}
  <BarChart height={90} {points} hideYTicks={true} beginAtZero={false} type="line" labels={points.map((p) => p.x)} {color} />
{/if}
