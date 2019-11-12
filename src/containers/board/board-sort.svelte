<script>
  import Modal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";

  // Utils
  import arrayUtils from "../../utils/array/array_utils";

  // Stores
  import { Lang } from "../../store/lang";
  import { BoardStore } from "../../store/boards";
  import { Interact } from "../../store/interact";

  const methods = {
    moveUp(board) {
      let index = methods.indexOf(board);
      if (index > 0) {
        $BoardStore.boards = arrayUtils.move(
          $BoardStore.boards,
          index,
          index - 1
        );
        BoardStore.save($BoardStore.boards);
      }
    },
    moveDown(board) {
      let index = methods.indexOf(board);
      if (index < $BoardStore.boards.length - 1) {
        $BoardStore.boards = arrayUtils.move(
          $BoardStore.boards,
          index,
          index + 1
        );
        BoardStore.save($BoardStore.boards);
      }
    },
    indexOf(board) {
      return $BoardStore.boards.indexOf(board);
    }
  };
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
    {#each $BoardStore.boards as board, i (board.label)}
      <NItem className="border-bottom" title={board.label}>

        <div class="btn-group flex-shrink-off" slot="left">
          <button
            class="btn px-2 btn-lg btn-light {i === 0 ? 'disabled' : ''}"
            on:click={() => {
              methods.moveUp(board);
            }}>
            <i class="zmdi zmdi-long-arrow-up" />
          </button>
          <button
            class="btn px-2 btn-lg btn-light {i === $BoardStore.boards.length - 1 ? 'disabled' : ''}"
            on:click={() => {
              methods.moveDown(board);
            }}>
            <i class="zmdi zmdi-long-arrow-down" />
          </button>
        </div>

      </NItem>
    {/each}
  </div>
</Modal>
