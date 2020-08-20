<script lang="ts">
  import Calendar from "../../../components/calendar/calendar.svelte";
  import dayjs from "dayjs";
  import type { Widget } from "../../../modules/dashboard/widget";

  let _elCalendar;

  export let widget: Widget;
</script>

<style>
  .calendar-wrapper {
    max-width: 120px;
    min-height: 200px;
  }
</style>

{#if widget && widget.element.type == 'tracker'}
  <div class="calendar-wrapper">
    <Calendar
      bind:this={_elCalendar}
      color={widget.element.obj.color}
      tracker={widget.element.obj}
      showHeader={false}
      on:dayClick={(event) => {}}
      initialDate={new Date()}
      events={widget.stats.rows} />
  </div>
{:else}Streaks currently only support Trackers{/if}
