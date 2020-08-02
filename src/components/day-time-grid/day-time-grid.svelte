<script>
  import { onMount } from "svelte";
  // vendors
  import dayjs from "dayjs";
  // Utils
  import Logger from "../../utils/log/log";
  import math from "../../utils/math/math";
  import extractor from "../../utils/extract/extract";

  import { UserStore } from "../../store/user-store";
  import { TrackerStore } from "../../store/tracker-store";

  //   // Props
  export let rows = undefined;
  export let color = undefined;
  export let style = "";
  export let className = "";
  export let term = undefined;
  // export let flex = true;

  let _el;
  let height = 200;

  // Consts
  const console = new Logger("⏰ Grid");
  const getEmptyDay = () => new Array(24).fill(0);
  const emptyGrid = () => {
    let grid = [[], [], [], [], [], [], []];
    grid.forEach((day, index) => {
      for (let i = 0; i < 24; i++) {
        grid[index].push(0);
      }
    });

    // // In case firstDayOfWeek is Monday, move the first row to the end.
    // if ($UserStore.meta.firstDayOfWeek === '2') {
    //   const sunday = grid.shift();
    //   grid.push(sunday);
    // }

    return grid;
  };

  const hours = [];
  const dateStart = dayjs().startOf("day");
  for (var i = 0; i < 24; i++) {
    let date = dateStart.add(i, "hour");
    hours.push(
      trimHour($UserStore.meta.is24Hour ? date.format("H") : date.format("ha"))
    );
  }

  const getGridMax = () => {
    let max = 0;
    days.forEach((day, di) => {
      day.forEach((hour, hi) => {
        max = days[di][hi] > max ? days[di][hi] : max;
      });
    });
    return max;
  };

  function trimHour(hour) {
    if (hour.length == 4) {
      return hour.substr(0, 3);
    } else if (hour.length == 3) {
      return hour.substr(0, 2);
    } else {
      return hour;
    }
  }

  // Local Variables
  let days = emptyGrid();
  let maxValue = 0;

  $: if (rows) {
    let trackableElement = extractor.toElement(term);

    days = emptyGrid();
    rows.forEach(row => {
      let date = new Date(row.end);
      let day = date.getDay();
      let hour = date.getHours();
      let value;
      // If a tracker, use the value to highlight the date/time
      // if it's not a tracker, it will just be a value of 1 so the overall
      // useage of time will be displayed.
      if (trackableElement.type == "tracker") {
        let tracker = TrackerStore.byTag(trackableElement.id);
        value = row.getTrackerValue(trackableElement.id, tracker.math);
      } else {
        value = 1;
      }
      days[day][hour] = days[day][hour] + value;
    });
    maxValue = getGridMax();
    // Convert to percentage
    days = days.map((day, di) => {
      return day.map((hvalue, hindex) => {
        return math.percentage(maxValue, hvalue);
      });
    });

    // // In case firstDayOfWeek is Monday, move the first row to the end.
    // if ($UserStore.meta.firstDayOfWeek === '2') {
    //   const sunday = days.shift();
    //   days.push(sunday);
    // }
  }

  function main() {
    height = _el.parentElement.clientHeight;
  }

  const methods = {
    hourStyle(value) {
      return {
        opacity: value / 100
      };
    }
  };

  onMount(() => {
    main();
  });
</script>

<style type="scss">
  @import "../../scss/utils/_utils";

  .time-grid {
    display: flex;
    flex-direction: column;
    position: relative;
    flex-grow: 1;
    min-height: 100%;
    flex-shrink: 1;

    .hour-header {
      padding-left: 25px;
      padding-top: 4px;
      padding-bottom: 2px;
      display: flex;
      flex-direction: row;
      .hour {
        width: calc(100% / 24);
        font-size: 0.4rem;
      }
    }

    label {
      margin: 0;
      font-size: 0.6rem;
      text-align: right;
      color: var(--color-inverse);
      padding-right: 4px;
      width: 36px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .hour {
      color: var(--color-inverse);
    }
    .day {
      display: flex;
      flex-direction: row;
      height: calc(100% / 7);
      align-items: center;
      .hour {
        width: calc(100% / 24);
        text-align: center;
        margin: 0px;
        background-color: $primary;
        margin-right: 4px;
        margin-bottom: 2px;
        border-radius: 4px;
        height: 95%;
      }
    }
  }
</style>

<div
  class="time-grid {className}"
  style="height:{height}px; {style}"
  bind:this={_el}>

  <!--<pre>{JSON.stringify(days, null, 2)}</pre>-->

  {#if $UserStore.meta.firstDayOfWeek === '2'}
    <!-- firstDayOfWeek is Monday -->

    <!-- Monday-Saturday -->
    {#each days as day, index}
      {#if index !== 0}
        <div class="day">
          <label>
            {dayjs(new Date())
            .day(index)
            .format('ddd')
            .substr(0, 2)}
          </label>
          {#each day as hour, hi}
            <div
                    class="hour hour-{hi}"
                    style="opacity: {days[index][hi] / 100 || 0.1}; background-color: {color}" />
          {/each}
        </div>
      {/if}
    {/each}
    <!-- /Monday-Saturday -->

    <!-- Sunday -->
    <div class="day">
      <label>
        {dayjs(new Date())
            .day(0)
            .format('ddd')
            .substr(0, 2)}
      </label>
      {#each days[0] as hour, hi}
        <div
                class="hour hour-{hi}"
                style="opacity: {days[0][hi] / 100 || 0.1}; background-color: {color}" />
      {/each}
    </div>
    <!-- /Sunday -->

  {:else}
  <!-- firstDayOfWeek is Sunday -->
    {#each days as day, index}
      <div class="day">
        <label>
          {dayjs(new Date())
          .day(index)
          .format('ddd')
          .substr(0, 2)}
        </label>
        {#each day as hour, hi}
          <div
                  class="hour hour-{hi}"
                  style="opacity: {days[index][hi] / 100 || 0.1}; background-color: {color}" />
        {/each}
      </div>
    {/each}
  {/if}

  <div class="hour-header">
    {#each hours as hour, index}
      <div class="hour hour-{index} header">{hour}</div>
    {/each}
  </div>
</div>
