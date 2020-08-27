<script>
  import { Interact } from "../../store/interact";
  import Map from "./../map/map.svelte";
  import NoteTextualizer from "./../../components/note-textualizer/note-textualizer.svelte";
  import TrackerSmallBlock from "./../../components/tracker-ball/tracker-small-block.svelte";
  import { UserStore } from "./../../store/user-store.js";
  import { TrackerStore } from "../../store/tracker-store";
  import { LedgerStore } from "../../store/ledger.js";
  import Card from "./../../components/card/card.svelte";
  import Text from "./../../components/text/text.svelte";
  import HScroller from "./../../components/h-scroller/h-scroller.svelte";
  import NToolbarGrid from "./../../components/toolbar/toolbar-grid.svelte";
  import NToolbar from "./../../components/toolbar/toolbar.svelte";
  import NListItem from "./../../components/list-item/list-item.svelte";
  import NIcon from "./../../components/icon/icon.svelte";
  import NModal from "./../../components/modal/modal.svelte";
  import extractor from "../../utils/extract/extract";
  import math from "../../utils/math/math";
  import arrayUtils from "../../utils/array/array_utils";
  import dayjs from "dayjs";
  import TrackerConfig from "../../modules/tracker/tracker";

  const state = {
    notes: [],
    trackers: [],
    trackers1: [],
    trackers2: [],
    records: [],
  };

  let showDom = false;
  let showWindow = false;
  let loading = false;

  $: if ($Interact.onThisDay) {
    showDom = true;
    setTimeout(() => {
      showWindow = true;
    }, 20);
    loadDay();
  } else {
    showWindow = false;
    setTimeout(() => {
      showDom = false;
    }, 200);
  }

  async function loadDay() {
    loading = true;
    let day = await LedgerStore.getDay($Interact.onThisDay);
    let trackersUsed = LedgerStore.extractTrackerTagAndValues(day);
    let trackerKeys = Object.keys(trackersUsed);

    processTrackers(trackersUsed);

    let notes = day
      .filter((record) => {
        return hasNote(record.note);
      })
      .sort((a, b) => {
        return a.created > b.created ? 1 : -1;
      });
    state.notes = notes;
    state.records = day;
    loading = false;
  }

  function processTrackers(trackersUsed) {
    let trackers = Object.keys(trackersUsed)
      .map((tag) => {
        let base = trackersUsed[tag];
        let tracker = TrackerStore.getByTag(tag);

        let value = tracker.math == "sum" ? math.sum(base.values) : math.average(base.values);
        return {
          tag,
          tracker,
          values: base.values,
          count: base.values.length,
          value: tracker.displayValue(value),
        };
      })
      .sort((a, b) => {
        return a.count < b.count ? 1 : -1;
      });

    state.trackers = trackers;
  }

  function nextDay() {
    let date = dayjs($Interact.onThisDay).add(1, "day").toDate();
    Interact.onThisDay(date);
  }

  function previousDay() {
    let date = dayjs($Interact.onThisDay).subtract(1, "day").toDate();
    Interact.onThisDay(date);
  }

  function hasNote(str) {
    let parsed = extractor.parse(str, { includeGeneric: true });
    let generic = parsed.filter((tElement) => {
      return tElement.type == "generic";
    });
    return math.percentage(parsed.length, generic.length) > 70;
  }

  // let lastDate;
  // // $: if (date && date !== lastDate) {
  // //   lastDate = date;
  // //   loadDay();
  // // }
</script>

{#if showDom}
  <NModal show={showWindow} type="bottom-slideup" bodyClass="bg-solid-1">
    <header slot="header" class="w-100">
      <div class="n-toolbar-grid">
        <button class="btn btn-clear btn-icon tap-icon left" on:click={Interact.closeOnThisDay}>
          <NIcon name="close" />
        </button>
        <div class="main">
          <Text>{dayjs($Interact.onThisDay).format('ddd MMM D, YYYY')}</Text>
          <Text className="text-faded-3" size="sm">{dayjs($Interact.onThisDay).fromNow()}</Text>
        </div>
        <div class="right">
          <div class="n-row">
            <button class="btn btn-clear btn-icon tap-icon px-1" on:click={previousDay}>
              <NIcon name="chevronLeft" />
            </button>
            <button class="btn btn-clear btn-icon tap-icon px-1" on:click={nextDay}>
              <NIcon name="chevronRight" />
            </button>
          </div>
        </div>
      </div>
      <HScroller className="py-2">

        {#each state.trackers as tracker (tracker.tag)}
          <TrackerSmallBlock
            style="min-width:140px;"
            solo
            element={{ id: tracker.tag, value: tracker.value, type: 'tracker', obj: tracker.tracker }}
            on:click={() => {}} />
        {/each}

      </HScroller>
    </header>
    {#if !loading}
      <section class="bg-solid-2">
        {#each state.notes as note}
          <Card className="p-3">
            <Text size="xs" className="mb-2 text-faded-2">{dayjs(note.end).format(UserStore.getTimeFormat())}</Text>
            <NoteTextualizer note={note.note} />
          </Card>
        {/each}
      </section>
    {/if}
    <div slot="footer">
      {#if !loading}
        <Map records={state.records} height={100} />
      {/if}
    </div>

  </NModal>
{/if}
