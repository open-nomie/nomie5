<script lang="ts">
  import dayjs from "dayjs";
  import { UserStore } from "../../store/user-store";
  import { onMount, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let value = dayjs();
  export let className = "";
  export let style = "";

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
  $: hours = $UserStore.meta.is24Hour ? hours24 : hours12;
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
    hour = $UserStore.meta.is24Hour ? value.format("HH") : value.format("hh");
    minute = value.format("mm");
    ampm = value.format("a");
  }

  // Fire Change
  function onChange() {
    let _hour = !$UserStore.meta.is24Hour && ampm == "pm" ? parseInt(hour) + 12 : parseInt(hour);
    value = value.set("hour", _hour);
    value = value.set("minute", parseInt(minute));
    dispatch("change", value);
  }

  onMount(init);
</script>

<style>
  .time-select {
    flex-shrink: 1;
    width: 100px;
    padding: 0 16px;
  }
  select {
    flex-shrink: 0;
    flex-grow: 1;
    color: var(--color-primary-bright);
  }
</style>

{#if minute}
  <div class="time-select {className}" {style}>
    <div class="n-row">
      <!-- Loop over hours -->
      <select bind:value={hour} class="filler hour text-right" style="text-align:center;" on:change={onChange}>
        {#each hours as h}
          <option value={h} selected={h == hour} style="text-align:center;">{`${h}`.length == 1 ? `0${h}` : h}</option>
        {/each}
      </select>
      :
      <!-- Loop over minutes -->
      <select bind:value={minute} class="filler minutes" style="" on:change={onChange}>
        {#each minutes as m}
          <option value={m} selected={m == minute}>{`${m}`.length == 1 ? `0${m}` : m}</option>
        {/each}
      </select>
      <!-- If is not 24 hour - show ampm -->
      {#if !$UserStore.meta.is24Hour}
        <select bind:value={ampm} class="filler ampm" on:change={onChange}>
          <option value="am" selected={ampm === 'am'}>AM</option>
          <option value="pm" selected={ampm === 'pm'}>PM</option>
        </select>
      {/if}
    </div>
  </div>
{/if}
