<script>
  import { TrackerStore } from "./../../store/tracker-store.js";
  import { LedgerStore } from "./../../store/ledger.js";
  import Card from "./../../components/card/card.svelte";
  import Text from "./../../components/text/text.svelte";
  import HScroller from "./../../components/h-scroller/h-scroller.svelte";
  import NToolbarGrid from "./../../components/toolbar/toolbar-grid.svelte";
  import NToolbar from "./../../components/toolbar/toolbar.svelte";
  import NListItem from "./../../components/list-item/list-item.svelte";
  import NIcon from "./../../components/icon/icon.svelte";
  import NModal from "./../../components/modal/modal.svelte";

  import dayjs from "dayjs";

  export let date = new Date();

  async function loadDay() {
    let day = await LedgerStore.getDay(date);
    let trackersUsed = LedgerStore.extractTrackerTagAndValues(day);
    console.log({ day, trackersUsed });
    let trackerKeys = Object.keys(trackersUsed);
  }

  let lastDate;
  $: if (date && date !== lastDate) {
    lastDate = date;
    loadDay();
  }
</script>

<NModal show={true}>
  <header slot="header" class="n-toolbar-grid">
    <div class="left">
      <NIcon name="close" />
    </div>

    <div class="main">{dayjs(date).format('ddd MMM D, YYYY')}</div>

    <div class="right">
      <NIcon name="add" />
    </div>
  </header>

  <section class="bg-faded d-flex" style="">
    <HScroller>
      <Card className="p-3" style="min-width:45%;">
        <Text size="sm">This is an example note dude.</Text>
        <Text size="xs">5:43pm</Text>
      </Card>
      <Card className="p-3" style="min-width:45%;">
        <Text size="sm">This is an example note dude.</Text>
        <Text size="xs">5:43pm</Text>
      </Card>
      <Card className="p-3" style="min-width:45%;">
        <Text size="sm">
          This is an example note dude. This is an example note dude. This is an
          example note dude.
        </Text>
        <Text size="xs">5:43pm</Text>
      </Card>
      <Card className="p-3" style="min-width:45%;">
        <Text size="sm">This is an example note dude.</Text>
        <Text size="xs">5:43pm</Text>
      </Card>
    </HScroller>
  </section>

</NModal>
