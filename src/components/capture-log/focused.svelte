<script lang="ts">
  import Button from "../button/button.svelte";
  import Icon from "../icon/icon.svelte";
  import Modal from "../modal/modal.svelte";
  import ToolbarGrid from "../toolbar/toolbar-grid.svelte";
  import Toolbar from "../toolbar/toolbar.svelte";
  import autosize from "../../modules/svelte-actions/autosize";
  import autofocus from "../../modules/svelte-actions/autofocus";
  import { ActiveLogStore } from "../../store/active-log";
  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";
  import DateTimeBar from "../date-time-bar/date-time-bar.svelte";
  import DatePicker from "../date-picker/date-picker.svelte";
  import PositivityMenu from "../positivity-selector/positivity-menu.svelte";
  import { LedgerStore } from "../../store/ledger";
  import Row from "../row/row.svelte";
  import Spacer from "../spacer/spacer.svelte";
  import dayjs from "dayjs";
  import HScroller from "../h-scroller/h-scroller.svelte";
  import AutoComplete from "../auto-complete/auto-complete.svelte";
  import Location from "../../modules/locate/Location";
  import Text from "../text/text.svelte";

  let textarea: HTMLTextAreaElement;

  async function save() {
    try {
      await LedgerStore.saveLog($ActiveLogStore);
      ActiveLogStore.clear();
      Interact.toggleFocusedEditor();
    } catch (e) {
      Interact.error(e.message);
    }
  }

  function moveDate(dir: "next" | "prev", amount: number = 1) {
    let d = dayjs($ActiveLogStore.end || new Date().getTime());
    if (dir === "next") {
      $ActiveLogStore.end = d.add(amount, "day").toDate().getTime();
    } else {
      $ActiveLogStore.end = d.subtract(amount, "day").toDate().getTime();
    }
  }
  function nextDate() {
    moveDate("next", 1);
  }
  function previousDate() {
    moveDate("prev", 1);
  }

  function clearLocation() {
    $ActiveLogStore.location = undefined;
    $ActiveLogStore.lat = undefined;
    $ActiveLogStore.lng = undefined;
  }
  async function editLocation() {
    let activeLoc: Location;
    if ($ActiveLogStore.lat) {
      activeLoc = new Location({ name: $ActiveLogStore.location, lat: $ActiveLogStore.lat, lng: $ActiveLogStore.lng });
    }
    let location: any = await Interact.pickLocation(activeLoc);
    if (location) {
      $ActiveLogStore.location = location.name;
      $ActiveLogStore.lat = location.lat;
      $ActiveLogStore.lng = location.lng;
    }
  }
</script>

<Modal fullscreen show={$Interact.focusedEditor} level={1}>
  <div slot="header">
    <ToolbarGrid>
      <div slot="left">
        <Button icon on:click={Interact.toggleFocusedEditor}>
          <Icon name="close" className="fill-inverse-2" />
        </Button>
      </div>
      <main slot="main">{Lang.t('general.journal', 'Journal')}</main>
      <div slot="right">
        <Button type="clear" on:click={save}>Save</Button>
      </div>
    </ToolbarGrid>
    <Toolbar>
      <Button icon className={$ActiveLogStore.lat ? 'tap-icon' : 'text-inverse-2'} on:click={editLocation}>
        <Icon name="map" size="20" />
      </Button>
      <Spacer />
      <Button size="sm" icon className="tap-icon" on:click={previousDate}>
        <Icon name="chevronLeft" />
      </Button>
      <DatePicker
        bind:time={$ActiveLogStore.end}
        style="width:210px; font-size:14px; border-radius:2px; text-align:center padding:4px; background-color:var(--color-grey-9);" />
      <Button size="sm" icon className="tap-icon" on:click={nextDate}>
        <Icon name="chevronRight" />
      </Button>
      <Spacer />
      <PositivityMenu bind:score={$ActiveLogStore.score} closeBackgroundTap={true} size="lg" />
    </Toolbar>
  </div>

  {#if $ActiveLogStore.lat}
    <Row className="px-2 justify-items-center bg-solid-1">
      <Spacer />
      {#if $ActiveLogStore.location}
        <Text size="xs" faded center>{$ActiveLogStore.location}</Text>
      {:else if $ActiveLogStore.lat}
        <Text size="xs" faded center>{$ActiveLogStore.lat},{$ActiveLogStore.lng}</Text>
      {/if}
      <Button size="sm" icon className="text-danger" on:click={clearLocation}>
        <Icon name="close" />
      </Button>
      <Spacer />
    </Row>
  {/if}

  <AutoComplete
    input={$ActiveLogStore.note}
    scroller
    on:select={(evt) => {
      ActiveLogStore.updateNote(evt.detail.note);
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }} />
  <textarea
    bind:this={textarea}
    use:autofocus
    placeholder={Lang.t('general.whats-up', "What's up?")}
    bind:value={$ActiveLogStore.note}
    style="outline:none; background-color:var(--color-solid); color:var(--color-inverse); padding:16px; border:none; width:100%;
    height:calc(90% - 20px) !important; line-height:130%;" />

</Modal>
