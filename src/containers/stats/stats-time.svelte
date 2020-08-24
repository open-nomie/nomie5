<script lang="ts">
  import DayTimeGrid from "../../components/day-time-grid/day-time-grid.svelte";
  import type NLog from "../../modules/nomie-log/nomie-log";
  import DayOfWeek from "../../components/day-of-week/day-of-week.svelte";
  import TimeOfDay from "../../components/time-of-day/time-of-day.svelte";
  import type { IStats } from "../../modules/stats/statsV5";

  export let term: string;
  export let color: string;
  // export let rows: Array<NLog>;
  export let stats: IStats;
</script>

<div class="bg-solid py-2 pr-2 pl-0">
  <DayTimeGrid {term} {color} rows={stats.rows} style="min-height:100px;max-height:100px" />
</div>
<div class="bg-solid p-2">
  <TimeOfDay statsTod={stats.tod} {color} />
</div>
<div class="bg-solid p-2">
  <DayOfWeek height={90} statsDow={stats.dow} {color} />
</div>
