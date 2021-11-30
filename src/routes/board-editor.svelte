<script>
  //Vendors
  import { navigate, Router, Route } from 'svelte-routing'
  import { tap } from '@sveltejs/gestures'

  import { onMount, onDestroy } from 'svelte'

  // Utils
  import Logger from '../utils/log/log'
  import arrayUtils from '../utils/array/array_utils'
  import tick from '../utils/tick/tick'
  // Modules
  import Tracker from '../modules/tracker/tracker'
  // Components
  import NIcon from '../components/icon/icon.svelte'
  import NText from '../components/text/text.svelte'
  import NInput from '../components/input/input.svelte'
  import NItem from '../components/list-item/list-item.svelte'
  import NBackButton from '../components/back-button/back-button.svelte'

  import NSortableList from '../components/sortable-list/sortable-list.svelte'

  // containers
  import NPage from '../domains/layout/page.svelte'

  //store
  import { BoardStore } from '../store/BoardStore'
  import { UserStore } from '../store/user-store'
  import { TrackerStore } from '../store/tracker-store'
  import { Interact } from '../store/interact'
  import { Lang } from '../store/lang'
  import Button from '../components/button/button.svelte'
  import Avatar from '../components/avatar/avatar.svelte'
  import ToolbarGrid from '../components/toolbar/toolbar-grid.svelte'
  import List from '../components/list/list.svelte'

  const console = new Logger('🎲 Board Editor')
  let trackers = []

  const data = {
    board: null,
    updatedLabel: null,
    trackers: null,
    draggingTag: null,
    droppedTag: null,
    hoverTag: null,
    refreshing: false,
    notice: 'Notice',
    lastDraggingTag: null,
    draggingTracker: null,
  }

  let ready = false
  let path = window.location.href.split('/')
  let id = path[path.length - 1]

  let showDeletes = true

  // Reactive Moments!
  $: if (
    // If board is active and not ready, and not ALL Board
    $BoardStore.activeBoard &&
    ready == false &&
    $BoardStore.activeBoard.id != 'all'
  ) {
    ready = true
    data.updatedLabel = $BoardStore.activeBoard.label
    data.board = $BoardStore.activeBoard
  } else if (id == 'all' && ready == false) {
    // If ALL board and not ready...
    ready = true
    // Set up the all board
    data.board = BoardStore.boardById('all') || {
      id: 'all',
      trackers: [],
      label: 'All',
    }
    // Set trackers to ALL trackers, sorted by the ALL board tracker list.
    data.board.trackers = Object.keys($TrackerStore.trackers).sort((a, b) => {
      if (data.board.trackers.indexOf(a) > data.board.trackers.indexOf(b)) {
        return 1
      } else if (
        data.board.trackers.indexOf(a) < data.board.trackers.indexOf(b)
      ) {
        return -1
      } else {
        return a > b ? 1 : -1
      }
    })
    trackers = data.board.trackers
      .map((tag) => $TrackerStore.trackers[tag])
      .filter((t) => t)
  }

  let titleChange = false
  $: if (data.updatedLabel !== (data.board || {}).label) {
    titleChange = true
  } else {
    titleChange = false
  }

  const methods = {
    refresh() {
      data.refreshing = true
      setInterval(() => {
        data.refreshing = false
      }, 100)
    },
    /**
     * Save the Current Active Board
     */
    async save(options = {}) {
      options.silent = options.silent == false ? false : true
      try {
        // If the Active Board is set...
        if ($BoardStore.activeBoard) {
          BoardStore.update((state) => {
            state.activeBoard.label = data.updatedLabel
            state.activeBoard.trackers = trackers.map((tracker) => tracker.tag)
            return state
          })
        }
        // Wait 10ms then Save
        await tick(10)
        let saved = await BoardStore.saveBoard(data.board)
        // If not silent show toast
        if (!options.silent) {
          Interact.toast(Lang.t('general.saved', 'Saved'))
        }
      } catch (e) {
        Interact.alert(Lang.t('general.error', 'Error'), e.message)
      }
    },
    async deleteBoard() {
      let confirmed = await Interact.confirm(
        'Delete ' + data.board.label + ' tab?',
        "You can recreate it later, but it's not super easy.",
      )
      if (confirmed === true) {
        data.refreshing = true
        await BoardStore.deleteBoard(data.board.id)
        navigate('/')
        Interact.toast('Deleted')
      }
    },
    removeTracker(event, tracker) {
      event.preventDefault()
      event.stopPropagation()
      Interact.confirm(
        `Remove ${tracker.label} from ${data.board.label}?`,
        'You can always add it later.',
      ).then((res) => {
        if (res === true) {
          event.preventDefault()
          BoardStore.removeTrackerFromBoard(tracker, data.board.id).then(() => {
            data.refreshing = true
            setTimeout(() => {
              data.refreshing = false
            }, 100)
          })
        } // accepted
      })
    },
    trackerIndex(tracker) {
      return trackers.indexOf(tracker)
    },
  }

  async function trackersSorted(evt) {
    trackers = evt.detail
    data.board.trackers = trackers.map((tracker) => tracker.tag)
    await tick(100)
    methods.save({ silent: true })
  }

  let boardUnsub

  onMount(() => {
    boardUnsub = BoardStore.subscribe((b) => {
      if (b.activeBoard) {
        trackers = b.activeBoard.trackers.map((tag) => {
          return $TrackerStore.trackers[tag] || new Tracker({ tag: tag })
        })
      } else {
        // navigate("/");
      }
    })
  })

  onDestroy(() => {
    boardUnsub()
  })

  UserStore.onReady(() => {
    // methods.initialize();
  })

  let list = [
    { id: 1, name: 'First Item' },
    { id: 2, name: 'Second Item' },
    { id: 3, name: 'Third Item' },
  ]
  const sortList = (ev) => {
    trackers = ev.detail
  }
</script>

{#if data.board}
  <NPage>
    <div slot="header">
      <ToolbarGrid>
        <div slot="left">
          <NBackButton />
        </div>
        <div slot="main" />
        <div slot="right">
          {#if data.board.id != 'all'}
            <Button icon on:click={methods.deleteBoard}>
              <NIcon name="delete" className="fill-red" />
            </Button>
          {/if}
        </div>
      </ToolbarGrid>
    </div>

    <!-- /.container -->

    <div class="px-0 ">

      <List className="pt-2">
        {#if data.board.id !== 'all'}
          <NItem className="py-2">
            <NInput
              type="text"
              placeholder="Tab Label"
              bind:value={data.updatedLabel}>
              <div slot="right">
                {#if data.updatedLabel != data.board.label}
                  <Button
                    type="clear"
                    color="primary-bright"
                    on:click={methods.save}>
                    {Lang.t('general.save')}
                  </Button>
                {/if}
              </div>

            </NInput>
          </NItem>
        {/if}
        {#if trackers}
          <NSortableList
            bind:items={trackers}
            handle=".menu-handle"
            key="tag"
            on:update={trackersSorted}
            let:item>
            <NItem className="py-2 bottom-line">
              <div slot="left" class="menu-handle">
                <NIcon className="fill-inverse mr-2" name="menu" />
                <Avatar emoji={item.emoji} size={40} />
              </div>
              {item.label}
              <div slot="right" class="flex">
                <Button
                  icon
                  className="mr-2"
                  on:click={(evt) => {
                    methods.removeTracker(evt, item)
                  }}>
                  <NIcon name="remove" className="fill-red" />
                </Button>

              </div>

            </NItem>
          </NSortableList>
        {/if}
      </List>

    </div>
    {#if data.board.id != 'all'}
      <div class="flex p-2">
        <div class="filler" />
        <Button type="clear" on:click={methods.deleteBoard}>
          <NIcon name="delete" className="fill-red mr-2" />
          Delete Tab
        </Button>
        <div class="filler" />
      </div>
    {/if}
  </NPage>
{:else}
  <NPage>
    <div slot="header" class="flex">
      <div class="filler" />
      <h1>Loading...</h1>
      <div class="filler" />
    </div>
  </NPage>
{/if}

<!-- <div class="notice">{data.notice}</div> -->
