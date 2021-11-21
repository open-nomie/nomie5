<script lang="ts">
  import type { Dayjs } from "dayjs";
  import Button from "../button/button.svelte";
  // vendors
  import dayjs from "dayjs";
  // utils
  import { createEventDispatcher } from "svelte";
  import { Device } from "../../store/device-store";
  import DateTimeBar from "../date-time-bar/date-time-bar.svelte";
  import { UserStore } from "../../store/user-store";

  // data
  export let date: Date | undefined;
  export let time: any;
  export let className: string = "";
  export let style: string = "";

  //consts
  const dispatch = createEventDispatcher();

  let inputEle: HTMLInputElement;
  let localDate: any;
  let lastTime: number;
  const dtlFormat = "YYYY-MM-DDTHH:mm";
  let dateTimeFormat: string;

  $: dateTimeFormat = $UserStore.meta.is24Hour ? "dd/mm/yyyy HH:mm" : "mm/dd/yyyy hh:mm a";

  $: if (time) {
    if (time !== lastTime) {
      lastTime = time;
      localDate = dayjs(new Date(time)).format(dtlFormat);
    }
  } else {
    localDate = dayjs(new Date()).format(dtlFormat);
  }

  function fireChange(evt: any) {
    date = new Date(evt.target.value);
    time = date.getTime();
    dispatch("change", dayjs(new Date(localDate)));
  }
</script>

<style global lang="postcss">
  .native-datetime {
    font-size: 85%;
    background-color: var(--color-solid);
    color: var(--color-inverse-2);
    border: none;
    display: flex;
    align-items: center;
    width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
  }
</style>

<div class="n-date-picker {className}">
  {#if Device.is(/(firefox)/gi)}
    <DateTimeBar
      {style}
      bind:date={time}
      on:change={(event) => {
        let oldtime = event.detail.toDate().getTime();
        dispatch('change', event.detail);
      }} />
  {:else}
    <input
      {style}
      type="datetime-local"
      placeholder={dayjs().format(dateTimeFormat)}
      class="native-datetime m-0"
      on:input={fireChange}
      bind:value={localDate}
      bind:this={inputEle} />
  {/if}
</div>
