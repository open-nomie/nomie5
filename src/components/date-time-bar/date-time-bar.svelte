<script lang="ts">
  import dayjs from "dayjs";
  import type { Dayjs } from "dayjs";

  import { onMount, createEventDispatcher } from "svelte";

  import Calendar from "../calendar/calendar.svelte";
  import Text from "../text/text.svelte";
  import ListItem from "../list-item/list-item.svelte";
  import TimeSelect from "./time-select.svelte";

  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import tick from "../../utils/tick/tick";
  import Button from "../button/button.svelte";

  const dispatch = createEventDispatcher();

  export let date: any = new Date().getTime(); // prop
  export let opened: boolean = false;
  export let style: string = "";
  export let calendarClass: string = "";
  export let calendarPosition: "top" | "bottom" = "bottom";

  let lastDate;
  let _date: Dayjs; // local
  let _opened: boolean = opened;
  let hide = false;

  $: if (date && date !== lastDate) {
    init();
  } else if (!date && lastDate) {
    init();
  }

  async function toggleOpen(): Promise<void> {
    _opened = !_opened;
  }

  function init() {
    // Get provided date - default to today
    date = date || new Date().getTime();
    // SEt local date to maniuplate
    _date = date instanceof Date ? dayjs(date) : dayjs(new Date(date));
    // Set local opened
    _opened = opened;
    // Set last date to avoid uneeded reaction
    lastDate = date;
  }

  /**
   * Set the Date
   * Sets month, day, year - leaving time alone
   */
  async function setDate(d: Dayjs) {
    // _date = _date.set("month", d.get("month")).set("date", d.get("date")).set("year", d.get("year"));
    _date = d;
    _date = _date;

    if (!opened && _opened) {
      await tick(300);
      hide = true;
      await tick(200);
      _opened = false;
      hide = undefined;
    }
    dispatch("change", _date);
  }
  onMount(init);

  const hasLeftSlot = (arguments[1].$$slots || {}).hasOwnProperty("left");
</script>

<style global lang="scss">
  .alert-dialog-window .date-time-bar-wrapper {
    margin-left: -16px;
    margin-right: -16px;
    width: calc(100% + 32px) !important;
    margin-top: 6px;
  }

  .date-time-bar-wrapper {
    flex-grow: 1;
    flex-shrink: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    &.calendar-top {
      flex-direction: column-reverse;
    }
  }
  .date-time-bar {
    background-color: var(--color-solid);
    display: grid;
    flex-shrink: 1;
    flex-grow: 1;
    grid-template-columns: 1fr 0.7fr;
    align-items: center;
    width: 100%;
    padding-left: 10px;

    button {
      height: 40px;
      flex-grow: 1;
      flex-shrink: 1;
      border: none;
      background-color: var(--color-solid);
      color: var(--color-primary-bright);
      margin: 0px;
      font-size: 0.7em;
    }
    button.date {
      border-right: solid 1px var(--color-solid-2);
      text-align: left;
      padding-left: 10px;
    }
  }
  .date-time-bar-wrapper .view.visible {
    border-top: solid 1px var(--color-solid-2);
    margin-bottom: 8px;
  }
  .date-time-bar-wrapper .no-left-slot > .left {
    display: none;
  }
</style>

{#if _date}
  <div
    class="date-time-bar-wrapper {calendarPosition == 'top' ? 'calendar-top' : 'calendar-bottom'}">

    <div class="date-time-bar" {style}>
      <div class="flex">
        <slot name="left" />
        <Button
          className="date justify-content-start flex-grow "
          color="clear"
          on:click={() => {
            toggleOpen();
          }}>
          <Text
            size="sm"
            className="text-align-left"
            color={_opened ? 'primary-bright' : ''}
            truncate>
            {$UserStore.meta.is24Hour ? _date.format('ddd D MMM YYYY') : _date.format('ddd MMM D YYYY')}
          </Text>
        </Button>
      </div>

      <TimeSelect
        is24Hour={$UserStore.meta.is24Hour ? true : false}
        bind:value={_date}
        on:change={(evt) => {
          setDate(evt.detail);
        }} />
    </div>
    <div
      class="animate up view date "
      class:visible={_opened && !hide}
      class:hidden={!_opened || hide}>
      {#if _opened}
        <Calendar
          showCalControl={false}
          className={calendarClass}
          on:dayClick={(evt) => {
            let calDate = evt.detail.hour(_date.hour()).minute(_date.minute());
            setDate(calDate);
          }}
          initialDate={_date} />
      {/if}
    </div>
  </div>
{/if}
