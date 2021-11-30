<script lang="ts">
  import Calendar from "../../../components/calendar/calendar.svelte";
  import dayjs from "dayjs";
  import type { Widget } from "../../../modules/dashboard/widget";
  import { onMount } from "svelte";

  let _elCalendar;

  export let widget: Widget;

  let streakCount: number = 0;

  function countDays(): number {
    let count = 0;
    return count;
  }

  async function main() {
    let days = 0;
    let count = 0;
    let streakData: any = widget.stats._stats.getStreakData();
    streakCount = streakData.streak;
  }

  onMount(main);
</script>

<style>
  .calendar-wrapper {
    max-width: 120px;
    min-height: 200px;
  }
</style>

{#if widget && widget.element.type == 'tracker'}
  <div class="calendar-wrapper">{streakCount}</div>
{:else}Streaks currently only support Trackers{/if}
