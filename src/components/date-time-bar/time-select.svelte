<script lang="ts">
  import dayjs from "dayjs";
  import { onMount, createEventDispatcher } from "svelte";
  import { isTruthy } from "../../utils/truthy/truthy";
  import tick from "../../utils/tick/tick";

  const dispatch = createEventDispatcher();

  export let value = dayjs();
  export let className = "";
  export let style = "";
  export let is24Hour;

  let lastValue; // Value to hold last reaction
  let hour; // local hour
  let minute; // local minute
  let ampm; // local ampm
  let lastAMPM;
  let mounted = false;
  let hour12;

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

  $: if (value && value.format("hh:mm a") !== dayjs(lastValue || "2010-01-01T01:01:01").format("hh:mm a")) {
    lastValue = value;
    hour = parseInt(value.format("HH"));
    hour12 = ((hour + 11) % 12) + 1;
    minute = parseInt(value.format("mm"));
    ampm = value.format("a");
    lastAMPM = ampm;
  }

  function onChange(evt) {
    let ogDate = dayjs(value);
    let ogDay = ogDate.get("day");
    let newHour = hour;

    if (!is24Hour) {
      if (newHour == 12 && ampm == "am") {
        newHour = 0;
      } else if (ampm == "am" && newHour > 12) {
        newHour = newHour - 12;
      } else if (ampm == "pm" && newHour < 12) {
        newHour = newHour + 12;
      }
    }
    dispatch("change", ogDate.set("hour", newHour).set("minute", minute).set("day", ogDay));
  }
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

{#if value}
  <div class="time-select-wrapper {className}" {style}>
    <div class="time-select">
      <!-- Loop over hours -->
      {#if is24Hour}
        <select bind:value={hour} class=" hour" on:change={onChange}>
          {#each hours as h}
            <option value={h} selected={h == hour} style="text-align:center;">{`${h}`.length == 1 ? `0${h}` : h}</option>
          {/each}
        </select>
      {:else}
        <select bind:value={hour} class="hour" on:change={onChange}>
          {#each hours as h}
            <option value={h} selected={h == hour12} style="text-align:center;">{`${h}`.length == 1 ? `0${h}` : h}</option>
          {/each}
        </select>
      {/if}
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
