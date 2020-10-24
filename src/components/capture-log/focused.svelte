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

  async function save() {
    try {
      await LedgerStore.saveLog($ActiveLogStore);
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
    console.log("Moved Date", dir, dayjs($ActiveLogStore.end).format("MMM DDD YYYY Do "));
  }
  function nextDate() {
    moveDate("next", 1);
  }
  function previousDate() {
    moveDate("prev", 1);
  }
</script>

<Modal fullscreen show={$Interact.focusedEditor}>
  <div slot="header">
    <ToolbarGrid>
      <div slot="left">
        <Button icon on:click={Interact.toggleFocusedEditor}>
          <Icon name="close" className="fill-inverse-2" />
        </Button>
      </div>
      <main slot="main">Compose</main>
      <div slot="right">
        <Button type="clear" on:click={save}>Save</Button>
      </div>
    </ToolbarGrid>
    <Toolbar>
      <Row>
        <Button size="sm" icon className="tap-icon" on:click={previousDate}>
          <Icon name="chevronLeft" />
        </Button>
        <DatePicker
          bind:time={$ActiveLogStore.end}
          style="width:230px; border-radius:2px; padding:4px; background-color:var(--color-grey-9);" />
        <Button size="sm" icon className="tap-icon" on:click={nextDate}>
          <Icon name="chevronRight" />
        </Button>
      </Row>
      <Spacer />
      <PositivityMenu bind:score={$ActiveLogStore.score} closeBackgroundTap={true} size="md" />
    </Toolbar>
  </div>

  <textarea
    use:autosize
    use:autofocus
    placeholder={Lang.t('general.whats-up', "What's up?")}
    bind:value={$ActiveLogStore.note}
    style="outline:none; overflow:hidden; border:none; padding:16px; width:100%; line-height:120%;" />
</Modal>
