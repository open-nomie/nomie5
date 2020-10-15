<script lang="ts">
  import { Interact } from "../../store/interact";
  import Map from "./../map/map.svelte";
  import NoteTextualizer from "./../../components/note-textualizer/note-textualizer.svelte";
  import TrackerSmallBlock from "../../components/tracker-small-block/tracker-small-block.svelte";
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
  import Button from "../../components/button/button.svelte";
  import ListItemLog from "../../components/list-item-log/list-item-log.svelte";
  import type NLog from "../../modules/nomie-log/nomie-log";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Icon from "./../../components/icon/icon.svelte";
  import Toolbar from "./../../components/toolbar/toolbar.svelte";
  import type { loop } from "svelte/internal";
  import { Lang } from "../../store/lang";
  import type Person from "../../modules/person/person";
  import TrackableElement from "../../modules/trackable-element/trackable-element";
  import { PeopleStore } from "../../store/people-store";
  import ShortcutUserButton from "../../components/shortcut-button/shortcut-user-button.svelte";
  import Row from "../../components/row/row.svelte";
  import Empty from "../empty/empty.svelte";
  import type { t } from "i18next";

  const state = {
    notes: [],
    trackers: [],
    trackers1: [],
    trackers2: [],
    records: [],
    people: [],
    context: [],
    locations: [],
  };

  let showDom = false;
  let showWindow = false;
  let loading = false;

  type ViewOption = "notes" | "trackers" | "people" | "locations" | "context";
  interface View {
    view: ViewOption;
    icon: string;
    label: string;
  }

  let views: Array<View> = [
    { view: "notes", icon: "annotation", label: `${Lang.t("general.notes", "Notes")}` },
    { view: "trackers", icon: "tracker", label: `${Lang.t("general.trackers", "Trackers")}` },
    { view: "locations", icon: "map", label: `${Lang.t("general.locations", "Locations")}` },
    { view: "people", icon: "people", label: `${Lang.t("general.people", "People")}` },
    { view: "context", icon: "bulb", label: `${Lang.t("general.context", "Context")}` },
  ];

  let view: ViewOption = "notes";
  let activeView: View = views[0];

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

  function setView(v: ViewOption) {
    view = v;
    activeView = views.find((lview) => lview.view === v);
  }

  async function loadDay() {
    loading = true;
    let day = await LedgerStore.getDay($Interact.onThisDay);
    let trackersUsed = LedgerStore.extractTrackerTagAndValues(day);

    getPeople(day);
    getContext(day);
    getNotes(day);
    processTrackers(trackersUsed);

    state.records = day;
    loading = false;
  }

  function getNotes(day) {
    let notes = day
      .filter((record) => {
        return hasNote(record.note);
      })
      .sort((a: NLog, b: NLog) => {
        return a.end > b.end ? 1 : -1;
      });
    state.notes = notes;
  }

  function getContext(day) {
    let contexts = [];
    day.forEach((log: NLog) => {
      log.context.forEach((element: TrackableElement) => {
        const context = element.id;
        if (context) {
          if (contexts.indexOf(context) === -1) {
            contexts.push(context);
          }
        }
      });
    });
    state.context = contexts;
  }

  function getPeople(day) {
    let people = [];
    day.forEach((log: NLog) => {
      log.people.forEach((element: TrackableElement) => {
        let person = $PeopleStore.people[element.id];
        if (person) {
          if (people.indexOf(person) === -1) {
            people.push(person);
          }
        }
      });
    });
    state.people = people;
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
        return a.tracker.label < b.tracker.label ? 1 : -1;
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
  <NModal show={showWindow} type="bottom-slideup" bodyClass="bg-solid-1" ariaLabel="On this day">
    <header slot="header" class="w-100">
      <div class="n-toolbar-grid">
        <div class="left">
          <Button icon className="tap-icon" on:click={Interact.closeOnThisDay}>
            <NIcon name="close" />
          </Button>
        </div>
        <div class="main">
          <Text className="mt-1">{dayjs($Interact.onThisDay).format('ddd MMM D, YYYY')}</Text>
          <Row className="justify-content-center">
            <Text size="sm" className="mr-2">{activeView.label}</Text>
            <Text className="text-faded-3" size="sm">{dayjs($Interact.onThisDay).fromNow()}</Text>
          </Row>
        </div>
        <div class="right">
          <div class="n-row">
            <Button className="tap-icon px-1" on:click={previousDay}>
              <NIcon name="chevronLeft" />
            </Button>
            <Button className="tap-icon px-1" on:click={nextDay}>
              <NIcon name="chevronRight" />
            </Button>
          </div>
        </div>
      </div>
      <Toolbar>
        <ButtonGroup>
          {#each views as loopView}
            <Button
              className={view === loopView.view ? 'active' : ''}
              icon
              on:click={() => {
                setView(loopView.view);
              }}>
              <Icon name={loopView.icon} />
            </Button>
          {/each}
        </ButtonGroup>
      </Toolbar>
      <!-- <HScroller className="py-2">

        

      </HScroller> -->
    </header>

    {#if !loading}
      {#if view === 'trackers'}
        <Card shadow={false} pad>
          {#each state.trackers as tracker (tracker.tag)}
            <TrackerSmallBlock
              className="m-1"
              style="width:150px;"
              element={{ id: tracker.tag, value: tracker.value, type: 'tracker', obj: tracker.tracker }}
              on:click={() => {
                Interact.elementOptions(new TrackableElement({
                    id: tracker.tag,
                    value: tracker.value,
                    type: 'tracker',
                    obj: tracker.tracker,
                  }));
              }} />
          {/each}
        </Card>
      {:else if view === 'notes'}
        {#if !state.notes.length}
          <Empty title={Lang.t('on-this-day.no-notes', 'No Notes on this Day')} emoji="✍🏽" />
        {/if}
        <div class="p-1">
          {#each state.notes as note}
            <ListItemLog log={note} />
          {/each}
        </div>
      {:else if view === 'people'}
        {#if !state.people.length}
          <Empty title={Lang.t('on-this-day.no-people', 'No People on this Day')} emoji="👨‍👩‍👧" />
        {/if}
        <div class="n-grid mt-3">
          {#each state.people as person}
            <ShortcutUserButton
              {person}
              on:click={() => {
                Interact.elementOptions(new TrackableElement({ id: person.username, raw: `@${person.username}`, type: 'person' }));
              }}
              on:more={() => {
                Interact.elementOptions(new TrackableElement({ id: person.username, raw: `@${person.username}`, type: 'person' }));
              }} />
          {/each}
        </div>
      {:else if view === 'context'}
        {#if !state.context.length}
          <Empty title={Lang.t('on-this-day.no-context', 'No Context on this Day')} emoji="🤷‍♂️" />
        {/if}
        <div class="n-grid mt-3">
          {#each state.context as context}
            <Button
              shape="round"
              size="lg"
              color="light"
              className="m-2"
              on:click={() => {
                Interact.elementOptions(new TrackableElement({ id: context, raw: context, type: 'context' }));
              }}>
              {context}
            </Button>
          {/each}
        </div>
      {:else if view === 'locations'}
        <Map records={state.records} style="height:100%;" />
      {/if}
    {/if}

  </NModal>
{/if}
