<script lang="ts">
  import dayjs from "dayjs";
  import type { Dayjs } from "dayjs";

  import TrackableElement, { toElement } from "../../modules/trackable-element/trackable-element";
  import TrackerConfig from "../../modules/tracker/tracker";

  import Calendar from "../../components/calendar/calendar.svelte";
  import Spinner from "../../components/spinner/spinner.svelte";

  import { TrackerStore } from "../../store/tracker-store";
  import { UserStore } from "../../store/user-store";

  import StreakHelper from "./streak-helper";
  import type { StreakViewTypes } from "./streak-helper";
  import type { CalendarLog } from "./streak-helper";
  import StreakDays from "./streak-days.svelte";

  export let term: string;
  export let selectedDate: Dayjs = dayjs();
  export let view: StreakViewTypes = "month";
  export let element: TrackableElement;
  export let className: string = "";

  let calendarLogs: Array<CalendarLog>;
  let mockTracker: TrackerConfig;
  let lastTerm: string;
  let lastElement: TrackableElement;

  $: if (term && lastTerm !== term && !element) {
    lastTerm = term;
    element = toElement(term);
    main();
  } else if (element && lastElement !== element) {
    lastElement = element;
    main();
  }

  async function main() {
    if (element) {
      mockTracker = element.type == "tracker" ? TrackerStore.getByTag(element.id) : new TrackerConfig({ tag: `${element.id}-mock` });
      let logs = await StreakHelper.getLogs(element, selectedDate, view, $UserStore.meta.firstDayOfWeek);
      calendarLogs = StreakHelper.logsToCalendar(logs);
    }
  }
</script>

<style>

</style>

<div class="n-streak n-streak-{view} {className}">
  {#if calendarLogs && mockTracker}
    {#if view == 'month'}
      <Calendar tracker={mockTracker} events={calendarLogs} />
    {:else if view == 'week'}
      <div class="week">
        <StreakDays logs={calendarLogs} date={selectedDate} days={7} />
      </div>
    {:else if view == 'quarter'}
      <div class="n-row align-items-start">
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(2, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(1, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate} events={calendarLogs} />
      </div>
    {:else if view == 'year'}
      <div class="n-row align-items-start">
        <Calendar tracker={mockTracker} compact initialDate={selectedDate} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(1, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(2, 'month')} events={calendarLogs} />
      </div>
      <div class="n-row align-items-start">
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(3, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(4, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(5, 'month')} events={calendarLogs} />
      </div>
      <div class="n-row align-items-start">
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(6, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(7, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(8, 'month')} events={calendarLogs} />
      </div>
      <div class="n-row align-items-start">
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(9, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(10, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(11, 'month')} events={calendarLogs} />
      </div>
    {/if}
  {:else}
    <div class="n-panel center-all">
      <Spinner />
    </div>
  {/if}
</div>
