<script lang="ts">
  import dayjs from "dayjs";
  import { onMount, createEventDispatcher } from "svelte";
  import { isTruthy } from "../../utils/truthy/truthy";

  const dispatch = createEventDispatcher();

  export let value = dayjs();
  export let className = "";
  export let style = "";
  export let is24Hour;

  let lastValue; // Value to hold last reaction
  let hour; // local hour
  let minute; // local minute
  let ampm; // local ampm
  // 24 Hour Array
  let hours24 = Array(24)
    .fill(0)
    .map((t, i) => {
      return i;
    });
  // 12 Hour Array
  let hours12 = Array(12)
    .fill(0)
    .map((t, i) => {
      return i + 1;
    });
  // 60 minute Array
  let minutes = Array(60)
    .fill(0)
    .map((t, i) => {
      return i;
    });

  // Reactively Set Hours
  $: hours = is24Hour ? hours24 : hours12;
  // Reactively Initialize - if the date changes - fire off the init.
  $: if (dayjs(value).format("YYYY-MM-DD hh:mm a") !== dayjs(lastValue).format("YYYY-MM-DD hh:mm a")) {
    init();
  }

  /**
   * Init the time Selector
   */
  function init() {
    // Set values
    lastValue = value;
    hour = is24Hour ? value.format("HH") : value.format("hh");
    minute = value.format("mm");
    ampm = value.format("a");
  }

  // Fire Change
  function onChange() {
    if (!is24Hour) {
      // Create a date string - to toggle AM/PM without affecting the actual date
      let dateString = `${dayjs(value).format("YYYY-MM-DD")} ${hour}:${minute} ${ampm}`;
      // Parse the string
      value = dayjs(dateString, "YYYY-MM-DD h:mm a");
    } else {
      // 24 Hour clock
      value = value.set("hour", parseInt(hour));
      value = value.set("minute", parseInt(minute));
    }
    dispatch("change", value);
  }

  onMount(init);
</script>

<style>
  .time-select {
    padding: 2px 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-shrink: 1;
    flex-grow: 1;
    color: var(--color-inverse-2);
    max-height: 30px;
  }
  select {
    flex-shrink: 0;
    flex-grow: 0;
    color: var(--color-primary-bright);
    text-align: center;
    -webkit-appearance: none;
  }
</style>

{#if isTruthy(minute)}
  <div class="time-select-wrapper {className}" {style}>
    <div class="time-select">
      <!-- Loop over hours -->
      <select bind:value={hour} class=" hour" on:change={onChange}>
        {#each hours as h}
          <option value={h} selected={h == hour} style="text-align:center;">{`${h}`.length == 1 ? `0${h}` : h}</option>
        {/each}
      </select>
      <span class="blinker">:</span>
      <!-- Loop over minutes -->
      <select bind:value={minute} class="minutes" on:change={onChange}>
        {#each minutes as m}
          <option value={m} selected={m == minute}>{`${m}`.length == 1 ? `0${m}` : m}</option>
        {/each}
      </select>
      <!-- If is not 24 hour - show ampm -->
      {#if !is24Hour}
        <select bind:value={ampm} class="filler ampm" on:change={onChange} style="margin-left:4px">
          <option value="am" selected={ampm === 'am'}>AM</option>
          <option value="pm" selected={ampm === 'pm'}>PM</option>
        </select>
      {/if}
    </div>
  </div>
{/if}
