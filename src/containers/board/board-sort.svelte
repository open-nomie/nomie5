<script>
  import Modal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NSortableList from "../../components/sortable-list/sortable-list.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  // Utils
  import arrayUtils from "../../utils/array/array_utils";

  // Stores
  import { Lang } from "../../store/lang";
  import { BoardStore } from "../../store/boards";
  import { Interact } from "../../store/interact";

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
</style>

<Modal
  title="Sort Tabs"
  type="fullscreen"
  allowClose={true}
  on:close={Interact.toggleBoardSorter}>
  <div slot="modal-header" class="n-row w-100">
    <button
      class="btn btn-icon btn-clear zmdi zmdi-close"
      on:click={Interact.toggleBoardSorter} />
    {Lang.t('board.sort-tabs', 'Sort Tabs')}
    <button class="btn btn-clear">{Lang.t('general.save')}</button>
    <button class="btn btn-icon btn-clear" />
  </div>
  <div class="n-list">
    <NSortableList
      bind:items={$BoardStore.boards}
      handle=".menu-handle"
      key="label"
      on:update={boardsSorted}
      let:item>
      <NItem className="bottom-line" title={item.label}>
        <div slot="right" class="menu-handle">
          <NIcon className="fill-faded-2" name="sort" />
        </div>
      </NItem>
    </NSortableList>
  </div>
</Modal>
