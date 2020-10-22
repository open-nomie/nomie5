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

  async function save() {
    try {
      await LedgerStore.saveLog($ActiveLogStore);
      Interact.toggleFocusedEditor();
    } catch (e) {
      Interact.error(e.message);
    }
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
      <DatePicker bind:time={$ActiveLogStore.end} />
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
