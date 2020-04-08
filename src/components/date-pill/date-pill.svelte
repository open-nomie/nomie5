<script>
  /**
   *
   * DEPRECATED!
   *
   */

  // svelte
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  // vendors
  import dayjs from "dayjs";

  // Utils
  import Logger from "../../utils/log/log";

  const console = new Logger("📅 Date Picker Pill");
  const dispatch = createEventDispatcher();

  export let date = dayjs();
  export let timeUnit = "day";
  export let buttonFormat = "ddd";

  $: dayObj = dayjs(date);

  const methods = {
    next() {
      date = date.add(1, timeUnit);
      methods.onChange();
    },
    previous() {
      date = date.subtract(1, timeUnit);
      methods.onChange();
    },
    datePress() {
      dispatch("datePress", date);
    },
    onChange() {
      dispatch("change", date);
    },
    onSearchPress() {
      dispatch("searchPress", date);
    },
    onLocationPress() {
      dispatch("locationPress", date);
    }
  };
</script>

<style lang="scss">
  $height: 60px;
  .n-date-pill {
    border: solid 1px var(--color-faded-2);
    height: $height;
    border-radius: $height * 0.5;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    .btn {
      min-width: 60px;
      margin: 0px;
      flex-grow: 1;
      padding-left: 6px;
      padding-right: 6px;
      border-right: solid 1px var(--color-faded-2);
    }

    .btn:last-child {
      border-right: none;
    }
    .date-btn {
      width: 120px;
      flex-grow: 0;
      flex-shrink: 0;
      flex-direction: column;
      .day {
        font-size: 1rem;
        font-weight: bold;
        line-height: 1.2rem;
      }
      .date {
        font-size: 0.9rem;
        line-height: 0.91rem;
      }
    }
  }
</style>

<div class="n-date-pill">
  <!--  -->
</div>
