<script lang="ts">
  import Modal from '../../components/modal/modal.svelte'
  import NItem from '../../components/list-item/list-item.svelte'
  import NText from '../../components/text/text.svelte'
  import NSortableList from '../../components/sortable-list/sortable-list.svelte'
  import NIcon from '../../components/icon/icon.svelte'
  import NToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  // Utils
  import arrayUtils from '../../utils/array/array_utils'

  // Stores
  import { Lang } from '../../store/lang'
  import { BoardStore } from '../../store/BoardStore'
  import { Interact } from '../../store/interact'

  import is from '../../utils/is/is'
  import Button from '../../components/button/button.svelte'
  import List from '../../components/list/list.svelte'
  import Icon from '../../components/icon/icon.svelte'
  import BackButton from '../../components/back-button/back-button.svelte'
  import Text from '../../components/text/text.svelte'

  function boardsSorted(evt) {
    if (evt.detail instanceof Array) {
      $BoardStore.boards = evt.detail
      BoardStore.save($BoardStore.boards)
    }
  }
  async function deleteBoard(board) {
    let confirmed = await Interact.confirm(
      'Delete ' + board.label + ' tab?',
      "You can recreate it later, but it's not super easy.",
    )
    if (confirmed === true) {
      await BoardStore.deleteBoard(board.id)
      Interact.toast('Deleted')
    }
  }
</script>

<style global>
  .board-sort .btn-group .btn {
    width: 36px;
  }
  .board-sort .emoji-only {
    font-size: 2.4em;
  }
</style>

<Modal
  type="fullscreen"
  allowClose={true}
  on:close={Interact.toggleBoardSorter}>
  <div slot="header">
    <NToolbarGrid>
      <div slot="left">
        <BackButton back={Interact.toggleBoardSorter} />
      </div>
      <div slot="main">{Lang.t('board.organize-tabs', 'Organize Tabs')}</div>
      <div slot="right" />
    </NToolbarGrid>
  </div>
  <List className="board-sort">
    <NSortableList
      bind:items={$BoardStore.boards}
      handle=".menu-handle"
      key="label"
      on:update={boardsSorted}
      let:item>
      {#if item.label !== 'all'}
        <NItem bottom-line className="bottom-line">
          <div slot="left" class="menu-handle">
            <NIcon name="menu" />
          </div>
          <Text size="lg">{item.label}</Text>
          <div slot="right" class="flex-shrink-off">
            <Button
              icon
              className="text-red"
              on:click={() => {
                deleteBoard(item)
              }}>
              <NIcon name="remove" />
            </Button>
          </div>
        </NItem>
      {/if}
    </NSortableList>
  </List>
</Modal>
