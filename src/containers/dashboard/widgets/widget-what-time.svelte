<script lang="ts">
  import NLog from "../../../modules/nomie-log/nomie-log";
  import type { IStats } from "../../../modules/stats/statsV5";
  import type { Widget } from "../../../modules/dashboard/widget";
  import TrackerLogsToTime from "../../../utils/tracker-logs-to-time/tracker-logs-to-time";
  import { onMount } from "svelte";
  export let widget: Widget;

  let times = [];

  async function init() {
    times = TrackerLogsToTime(widget.element.id, widget.logs);
  }
</script>

<style lang="scss">
  .time-graph {
    border: solid 1px var(--color-solid-1);
    height: 120px;
  }
  .time-graph .days {
    display: flex;
    flex-direction: row;
    width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    height: 100%;
    justify-content: stretch;
  }
  .time-graph .days .day {
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    .bar {
      min-width: 4px;
      max-width: 14px;
      border-radius: 7px;
      background-color: var(--color-inverse);
      min-height: 10px;
      flex-grow: 0;
      flex-shrink: 0;
    }
  }
</style>

{#await init()}
  Loading...
{:then value}
  <div class="time-graph">
    <div class="days">
      {#each times as day}
        <div class="day">
          <div class="bar" style="height:{day.percent}%" />
        </div>
      {/each}
    </div>
  </div>
{:catch error}
  error{error.message}
{/await}
