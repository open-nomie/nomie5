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
  export let date: Date;
  export let time: number;
  export let className: string = "";

  //consts
  const dispatch = createEventDispatcher();

  let inputEle: HTMLInputElement;
  let localDate: any;
  let lastTime: number;
  const dtlFormat = "YYYY-MM-DDTHH:mm";
  let dateTimeFormat: string;

  $: dateTimeFormat = $UserStore.meta.is24Hour ? "dd/mm/yyyy HH:mm" : "mm/dd/yyyy hh:mm a";

  $: {
    if (time) {
      console.log("we have a time prop");
      if (time !== lastTime) {
        console.log("its a new  time prop");
        lastTime = time;
        localDate = dayjs(new Date(time)).format(dtlFormat);
      } else {
        console.log("same time prop");
      }
      // If a date is provided use that as the base
    } else {
      // time = new Date().getTime();
      localDate = dayjs(new Date()).format(dtlFormat);
    }
  }

  // else if (date) {
  //     console.log("we have a date prop");
  //     if (date.getTime() !== lastTime) {
  //       console.log("It a new date", date);
  //       lastTime = date.getTime();
  //       localDate = dayjs(date).format(dtlFormat);
  //     } else {
  //       console.log("It's an old date");
  //       localDate = dayjs().format(dtlFormat);
  //     }
  //   } else {
  //     console.log("no date or time?");
  //     date = new Date();
  //     lastTime = date.getTime();
  //     localDate = dayjs(date).format(dtlFormat);
  //   }

  function fireChange(evt: any) {
    date = new Date(evt.target.value);
    time = date.getTime();
    dispatch("change", dayjs(new Date(localDate)));
  }
</script>

<style type="text/scss" lang="scss">
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
    &:active,
    &:focus {
      outline: none !important;
    }
  }
</style>

<div class="n-date-picker {className}">
  {#if Device.is(/(firefox)/gi)}
    <DateTimeBar
      bind:date={time}
      on:change={(event) => {
        let oldtime = event.detail.toDate().getTime();
        dispatch('change', event.detail);
      }} />
  {:else}
    <input
      type="datetime-local"
      placeholder={dayjs().format(dateTimeFormat)}
      class="native-datetime m-0"
      on:input={fireChange}
      bind:value={localDate}
      bind:this={inputEle} />
  {/if}
</div>
