<script>
  // Port and modification from vue-sweet-calendar
  // https://github.com/maryayi/vue-sweet-calendar/blob/master/src/components/Calendar.vue

  // svelte
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  // Local
  import DateTime from "./DateTime.js";

  // vendors
  import dayjs from "dayjs";

  // Utils
  import Logger from "../../utils/log/log";
  import NIcon from "../../components/icon/icon.svelte";

  const console = new Logger("📅 Sweet");
  const dispatch = createEventDispatcher();

  // export let name = "Calendar";
  // export let color = "#319ed7";

  // Props
  export let initialDate = new Date();
  export let firstDayOfWeek = 1; // 1: Sunday, 2: Monday, etc
  // export let eventCategories = [];
  export let events = [];
  export let offDays = [[1, 7]];
  export let showHeader = true;
  export let tracker = null;

  // Data
  let state = {
    date: dayjs(initialDate),
    today: new Date(),
    weekdays: null
  };

  let days = null;
  let day = null;

  let startWeekDayOfMonth =
    state.date
      .startOf("month")
      .toDate()
      .getDay() + 1;
  let numberOfDays = state.date.daysInMonth();
  let selectedMonth = state.date.month();
  let selectedMonthName = state.date.format("MMMM");
  let selectedYear = state.date.format("YYYY");
  let monthStartDate = dayjs(state.date).startOf("month");
  let refreshing = false;

  // If the initial date is set, convert to dayjs date
  $: if (initialDate) {
    state.date = dayjs(initialDate);
    state.weekdays = methods.generateWeekdayNames(firstDayOfWeek);
  }

  // If date change - do the magic.
  $: if (state.date) {
    startWeekDayOfMonth =
      state.date
        .startOf("month")
        .toDate()
        .getDay() + 1;

    numberOfDays = state.date.daysInMonth();
    selectedMonth = state.date.month();
    selectedMonthName = state.date.format("MMMM");
    selectedYear = state.date.format("YYYY");
    monthStartDate = dayjs(state.date).startOf("month");

    // Create array of empty days previous month calendar bleed over
    let emptyDays = Array((startWeekDayOfMonth - firstDayOfWeek + 7) % 7).fill(
      null
    );
    // Create array of days for this month
    let nonEmptyDays = Array(numberOfDays)
      .fill()
      .map((item, index) => dayjs(monthStartDate).add(index, "days"));

    // Merge the arrays
    days = emptyDays.concat(nonEmptyDays);
  }

  // Methods
  const methods = {
    prevMonth() {
      state.date = state.date.add(1, "month");
    },
    nextMonth() {
      state.date = state.date.subtract(1, "month");
    },
    generateWeekdayNames(firstDayOfWeek = 1) {
      let weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];
      for (let i = 2; i <= firstDayOfWeek; i++) {
        let first = weekdays.shift();
        weekdays.push(first);
      }
      return weekdays;
    },
    // Refresh the view
    refresh() {
      refreshing = true;
      setTimeout(() => {
        refreshing = false;
      }, 1);
    },
    // Go to Today
    goToday() {
      state.date = dayjs();
    },
    getDayStyle(day) {
      let score = undefined;

      let activeToday = events.find(row => {
        return day.toDate().toDateString() === new Date(row.end).toDateString();
      });

      // Lets extract the score for this tracker
      if (activeToday) {
        // Get the active Today log and pull meta from it.
        let meta = activeToday.getMeta();
        // Did we pass in a tracker?
        if (tracker) {
          // Get tracker value for this log
          const trackerValue = meta.trackers.find(t => t.tag == tracker.tag);
          // If we have a tracker value
          if (trackerValue) {
            // Calcuate the score just for this tracker
            score = activeToday.calculateScore(
              `#${trackerValue.tag}(${trackerValue.value})`
            );
          }
        }
        return `font-weight:bold; border:solid 2px ${
          score > -1 ? "var(--color-green)" : "var(--color-red)"
        }; color:${score > -1 ? "var(--color-green)" : "var(--color-red)"};`;
      } else {
        return ``;
      }
    },
    getDayClass(day) {
      let activeToday = events.find(row => {
        return (
          day.toDate().toDateString() === state.date.toDate().toDateString()
        );
      });
      let classes = [
        "day",
        `day-${day.format("D")}`,
        `weekday-${day.toDate().getDay()}`,
        activeToday ? "selected" : "not-selected",
        offDays.includes(day.toDate().getDay()) ? "off-day" : null,
        day.toDate().toDateString() === state.today.toDateString()
          ? "today"
          : null
      ];
      return classes.join(" ");
    }
  };
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  .sweet-calendar {
    $off-day-background-color: #e5e5e5;
    $selected-color: #994242;
    $selection-hover-color: rgba($selected-color, 0.5);
    $today-color: #008290;
    $day-color: #232323;
    $week-day-name-color: rgba($day-color, 0.7);

    .sweet-container {
      //   display: grid;
      //   grid-template-rows: 40px 1fr;
      .header {
        align-items: center;
        display: grid;
        grid-column-gap: 5px;
        grid-template-columns: 50px 1fr 50px;
        .month {
          justify-self: center;
        }
        .left-arrow {
          justify-self: end;
          span {
            cursor: pointer;
          }
        }
        .right-arrow {
          justify-self: start;
          span {
            cursor: pointer;
          }
        }
      }
      .body {
        align-items: center;
        display: grid;
        grid-row-gap: 8px;
        grid-template-columns: repeat(7, 1fr);
        grid-template-rows: repeat(7, 1fr);
        justify-items: center;
        .day-name {
          color: var(--color-inverse);
          font-weight: bold;
        }
        .day-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 28px;
          position: relative;
          width: 100%;
          .day {
            align-content: center;
            border-radius: 50%;
            box-sizing: content-box;
            color: var(--color-inverse-2);
            display: flex;
            height: 26px;
            justify-content: center;
            min-width: 26px;
            &.selected {
              border: 3px solid var(--color-solid-2);
            }
            &.off-day {
              background-color: #e5e5e5;
              font-weight: bold;
            }
            span {
              font-size: 14px;
              margin: 0;
              padding: 0;
              align-self: center;
            }
          }
        }
      }
    }
    .calendar {
      background-color: inherit;
      .body .day-container {
        .before,
        .after {
          height: 28px;
        }
      }
    }
    .date-picker {
      background-color: inherit;
      .body .day-container .day {
        &:hover {
          background-color: rgba(153, 66, 66, 0.5);
          border: 2px solid #994242;
          cursor: pointer;
        }
        &.selected {
          border: 2px solid #994242;
          color: #994242;
        }
      }
    }

    .day.filled {
    }
    .day.unfilled {
      background-color: transparent;
    }
  }
</style>

{#if state.date}
  <div class="sweet-calendar">
    <div class="sweet-container calendar">
      {#if showHeader}
        <div class="header">

          <div class="left-arrow" on:click={methods.prevMonth}>
            <NIcon name="chevronLeft" className="fill-primary-bright" />

          </div>
          <div class="month">{selectedMonthName} {selectedYear}</div>
          <div class="right-arrow" on:click={methods.nextMonth}>
            <NIcon name="chevronRight" className="fill-primary-bright" />
          </div>

        </div>
      {/if}

      <div class="body">
        {#each state.weekdays || [] as day, index}
          <div class="day-name" title={day}>{day[0]}</div>
        {/each}
        {#each days || [] as day, index}
          <div class="day-container clickable">
            {#if day}
              <div
                data-date={day.format('YYYY-MM-DD')}
                on:click={event => {
                  dispatch('dayClick', day);
                }}
                class={methods.getDayClass(day)}
                style={methods.getDayStyle(day)}>
                <span>{day.format('D')}</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}Loading{/if}
