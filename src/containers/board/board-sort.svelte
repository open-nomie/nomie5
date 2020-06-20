<script>
  import Modal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NText from "../../components/text/text.svelte";
  import NSortableList from "../../components/sortable-list/sortable-list.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  // Utils
  import arrayUtils from "../../utils/array/array_utils";

  // Stores
  import { Lang } from "../../store/lang";
  import { BoardStore } from "../../store/boards";
  import { Interact } from "../../store/interact";

  import is from "../../utils/is/is";

  function boardsSorted(evt) {
    if (evt.detail instanceof Array) {
      $BoardStore.boards = evt.detail;
      BoardStore.save($BoardStore.boards);
    }
  }
</script>

<style>
  .btn-group .btn {
    width: 36px;
  }
  .emoji-only {
    font-size: 2.4rem;
  }
</style>

<Modal
  title="Sort Tabs"
  type="fullscreen"
  allowClose={true}
  on:close={Interact.toggleBoardSorter}>
  <div slot="modal-header">
    <NToolbarGrid>
      <button
        slot="left"
        class="btn btn-icon btn-clear tap-icon"
        on:click={Interact.toggleBoardSorter}>
        <NIcon name="close" />
      </button>
      <div slot="main">{Lang.t('board.sort-tabs', 'Sort Tabs')}</div>
      <button class="btn btn-clear" slot="right">
        {Lang.t('general.save')}
      </button>
    </NToolbarGrid>
  </div>
  <div class="n-list">
    <NSortableList
      bind:items={$BoardStore.boards}
      handle=".menu-handle"
      key="label"
      on:update={boardsSorted}
      let:item>
      <NItem bottom-line className="bottom-line">
        <div slot="right" class="menu-handle">
          <NIcon name="menu" />
        </div>
        <NText size="lg">{item.label}</NText>
        <!-- <div class="name-only text-center">{item.label}</div> -->
        <!-- {#if is.emoji(item.label)}
          <div class="emoji-only text-center">{item.label}</div>
        {:else}
          <div class="name-only text-center">{item.label}</div>
        {/if} -->
      </NItem>
    </NSortableList>
  </div>
</Modal>
