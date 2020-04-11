<script>
  import NModal from "../../components/modal/modal.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NCalendar from "../../components/calendar/calendar.svelte";
  import NToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import NProgressBar from "../../components/progress-bar/progress-bar.svelte";

  import dayjs from "dayjs";

  import Tracker from "../../modules/tracker/tracker";

  import { UserStore } from "../../store/user";
  import { Interact } from "../../store/interact";
  import { LedgerStore } from "../../store/ledger";
  import { TrackerStore } from "../../store/trackers";

  const timeFormat = $UserStore.meta.is24Hour ? "HH:mm" : "h:mm a";
  const dateFormat = $UserStore.meta.is24Hour ? "MM/DD/YYYY" : "MMM D YYYY";
  let _elCalendar;

  const state = {
    date: dayjs().startOf("month"),
    logs: [],
    percentage: 0
  };

  function next() {
    state.date = state.date.add(1, "month");
  }

  function prev() {
    state.date = state.date.subtract(1, "month");
  }

  function getTracker() {
    return $TrackerStore.hasOwnProperty($Interact.streak.show)
      ? $TrackerStore[$Interact.streak.show]
      : new Tracker({ tag: $Interact.streak.show });
  }

  function getPercentage(rows) {
    let start = dayjs(state.date).startOf("month");
    let end = dayjs(start).endOf("month");
    let diff = end.diff(start, "day");
    let final = [];
    for (var i = 0; i < diff; i++) {
      let date = dayjs(start).add(i, "day");
      let hasEvent = rows.find(
        row => new Date(row.end).toDateString() === date.toDate().toDateString()
      );
      final.push(hasEvent);
    }
    let found = final.filter(r => r).length;
    let total = final.length;
    return found / total;
  }

  async function main() {
    let payload = {
      start: state.date.startOf("month"),
      end: state.date.endOf("month")
    };
    let logs = await LedgerStore.query({
      search: `#${$Interact.streak.show}`,
      start: payload.start,
      end: payload.end
    });
    logs = logs.map(row => {
      row.start = new Date(row.start);
      row.end = new Date(row.end);
      row.repeat = "never";
      return row;
    });
    state.logs = logs;
    state.percentage = getPercentage(logs) * 100;
  }

  let lastDate;
  $: if ($Interact.streak.show && state.date.format("YYYY-MM") !== lastDate) {
    lastDate = state.date.format("YYYY-MM");
    main();
  }
  $: if (!$Interact.streak.show) {
    console.log("CLosing");
    lastDate = null;
  }
</script>

<NModal show={$Interact.streak.show} type="bottom-slideup">
  <div slot="header" class="w-100">
    <NToolbarGrid>
      <button
        class="btn btn-clear tap-icon"
        slot="left"
        on:click={Interact.closeStreak}>
        <NIcon name="close" />
      </button>
      <main slot="main">{$Interact.streak.show}</main>
    </NToolbarGrid>
    <NToolbarGrid>
      <button class="btn btn-clear tap-icon" slot="left" on:click={prev}>
        <NIcon name="chevronLeft" />
      </button>
      <main slot="main" class="w-100 text-center">
        {state.date.format('MMM YYYY')}
        <NProgressBar percentage={state.percentage} />
      </main>
      <button class="btn btn-clear tap-icon" slot="right" on:click={next}>
        <NIcon name="chevronRight" />
      </button>
    </NToolbarGrid>
  </div>
  <div class="p-3">
    <NCalendar
      bind:this={_elCalendar}
      color={getTracker().color}
      tracker={getTracker()}
      showHeader={false}
      on:dayClick={event => {
        state.date = dayjs(event.detail);
        main();
      }}
      initialDate={state.date}
      events={state.logs} />
  </div>
</NModal>