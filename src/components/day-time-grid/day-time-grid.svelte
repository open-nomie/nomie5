<script>
  // vendors
  import dayjs from "dayjs";
  // Utils
  import Logger from "../../utils/log/log";
  import math from "../../utils/math/math";

  //   // Props
  export let rows = undefined;
  export let color = undefined;

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
    return grid;
  };

  const getGridMax = () => {
    let max = 0;
    days.forEach((day, di) => {
      day.forEach((hour, hi) => {
        max = days[di][hi] > max ? days[di][hi] : max;
      });
    });
    return max;
  };

  // Local Variables
  let days = emptyGrid();
  let maxValue = 0;

  $: if (rows) {
    days = emptyGrid();
    rows.forEach(row => {
      let date = new Date(row.end);
      let day = date.getDay();
      let hour = date.getHours();
      days[day][hour] = days[day][hour] + 1;
    });
    maxValue = getGridMax();
    // Convert to percentage
    days = days.map((day, di) => {
      return day.map((hvalue, hindex) => {
        return math.percentage(maxValue, hvalue);
      });
    });
  }

  const methods = {
    hourStyle(value) {
      return {
        opacity: value / 100
      };
    }
  };
</script>

<style type="scss">
  @import "../../scss/utils/_utils";

  .time-grid {
    display: flex;
    flex-direction: column;
    position: relative;
    label {
      margin: 0;
      width: 40px;
      font-size: 0.6rem;
      text-align: right;
      color: var(--color-faded-3);
      padding-right: 4px;
    }
    .day {
      display: flex;
      flex-direction: row;

      .hour {
        width: calc(100% / 24);
        text-align: center;
        margin: 0px;
        margin-right: 1px;
        margin-bottom: 1px;
        background-color: $primary;
      }
    }
  }
</style>

<div class="time-grid">
  {#each days as day, index}
    <div class="day">
      <label>
        {dayjs(new Date())
          .day(index)
          .format('ddd')}
      </label>
      {#each day as hour, hi}
        <div
          class="hour hour-{hi}"
          style="opacity: {days[index][hi] / 100 || 0.1}; background-color: {color}" />
      {/each}
    </div>
  {/each}
</div>
