<script>
  // Svelte
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";

  // Utils
  import time from "../../utils/time/time";
  import Logger from "../../utils/log/log";

  // Vendors
  import dayjs from "dayjs";

  // Props
  // export let started = undefined;
  export let className = "";
  export let value = 0;

  // Consts
  const dispatch = createEventDispatcher();
  const console = new Logger("⏰ manual-time.svelte");

  // methods
  const methods = {
    // +ADD to unit
    add(unit) {
      switch (unit) {
        case "hours":
          value = value + 60 * 60;
          break;
        case "minutes":
          value = value + 60;
          break;
        case "seconds":
          value = value + 1;
          break;
      }
      dispatch("change", value);
    },
    // -SUBTRACT from Unit
    subtract(unit) {
      switch (unit) {
        case "hours":
          if (value > 60 * 60) {
            value = value - 60 * 60;
          }
          break;
        case "minutes":
          if (value > 60) {
            value = value - 60;
          }
          break;
        case "seconds":
          if (value > 1) {
            value = value - 1;
          }
          break;
      }
      // Fire off change event
      dispatch("change", value);
    },
    // Get Unit Value - for select value
    getUnitValue(unit) {
      return data[unit] || "00";
    },
    // Set unit value by select box action
    setUnitValue(event, unit) {
      // Set to init
      let selected = parseInt(event.target.value);
      // Set temp time chunks
      let dateChunks = {
        hours: data.hours,
        minutes: data.minutes,
        seconds: data.seconds
      };
      // Set new unit
      dateChunks[unit] = time.padTime(selected);
      // New Set of the value to Seconds
      value = time.unitsToSeconds(
        dateChunks.hours,
        dateChunks.minutes,
        dateChunks.seconds
      );
      // Fire off change
      dispatch("change", value);
    },
    // Takes 00:00:00 and converts it to seconds
    timeStringToNode(str) {
      let initialTime = time.secondsToTime(str).split(":");
      let payload = {
        hours: initialTime[0],
        minutes: initialTime[1],
        seconds: initialTime[2]
      };
      return payload;
    }
  };

  // Data
  let data = {
    ...methods.timeStringToNode(value),
    computed: {
      totalSeconds: 0
    },
    localValue: value
  };

  // Watch for Value Change
  $: if (value > -1) {
    // Get the Chunks from Seconds
    let dateChunks = methods.timeStringToNode(value);
    // Set local data chunks to new value
    data.hours = time.padTime(dateChunks.hours);
    data.minutes = time.padTime(dateChunks.minutes);
    data.seconds = time.padTime(dateChunks.seconds);
  }

  // On Mount
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";

  .n-counter-manual {
    // padding: 40px 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    span {
      line-height: 40px;
      font-size: 40px;
    }
    .unit {
      text-align: center;
      select {
        border: solid 1px rgba(0, 0, 0, 0.1);
        height: 50px;
        line-height: 50px;
        font-size: 40px;
        font-weight: bold;
        padding-left: 10px;
        min-width: 86px;
        flex-grow: 1;
        text-align: center;
        -webkit-appearance: none;
      }
      display: flex;
      flex-direction: column;
      label {
        font-size: 0.9rem;
        color: var(--color-inverse-3);
        margin-top: 10px;
      }
      &.hours {
        margin-left: 6px;
        margin-right: 6px;
      }
    }
  }
</style>

<div class="n-counter-manual {className}">
  <div class="unit hours">
    <select
      value={methods.getUnitValue('hours')}
      on:change={event => {
        methods.setUnitValue(event, 'hours');
      }}>
      {#each time.getNumberedArray(120) as unit (unit)}
        <option value={unit}>{unit}</option>
      {/each}
    </select>

    <label>Hour</label>
  </div>
  <!-- Minutes -->
  <div class="unit hours">

    <select
      value={methods.getUnitValue('minutes')}
      on:change={event => {
        methods.setUnitValue(event, 'minutes');
      }}>
      {#each time.getNumberedArray(59) as unit (unit)}
        <option value={unit}>{unit}</option>
      {/each}
    </select>

    <label>Min</label>
  </div>
  <!-- SEconds -->
  <div class="unit seconds">

    <select
      value={methods.getUnitValue('seconds')}
      on:change={event => {
        methods.setUnitValue(event, 'seconds');
      }}>
      {#each time.getNumberedArray(59) as unit (unit)}
        <option value={unit}>{unit}</option>
      {/each}
    </select>

    <label>Sec</label>
  </div>
</div>
