<script lang="ts">
  import ToolbarGrid from './../../components/toolbar/toolbar-grid.svelte'
  import Panel from './../../components/panel/panel.svelte'
  import Modal2 from '../../components/modal/modal2.svelte'

  import NText from '../../components/text/text.svelte'
  import NIcon from '../../components/icon/icon.svelte'

  // Stores
  import { TrackerStore } from '../../store/tracker-store'
  import { Lang } from '../../store/lang'
  import { TrackerLibrary } from '../../store/tracker-library'
  import { Interact } from '../../store/interact'
  import { UserStore } from '../../store/user-store'
  import tick from '../../utils/tick/tick'
  import TrackerList from '../board/trackers.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import Text from '../../components/text/text.svelte'
  import Button from '../../components/button/button.svelte'

  import TrackerTypes from '../../modules/tracker-types/tracker-types'
  import Avatar from '../../components/avatar/avatar.svelte'
  import List from '../../components/list/list.svelte'
  import Empty from '../../components/empty/empty.svelte'
  import type { t } from 'i18next'

  let installed = {} // hol der for anything installed during the opening

  let trackers = []
  let ready = false

  UserStore.onReady(() => {
    ready = true
  })

  $: if ($TrackerLibrary && !trackers.length && ready) {
    trackers = $TrackerLibrary.trackers
      .map((tracker) => {
        if (tracker.uom == 'oz' && $UserStore.meta.is24Hour === true) {
          tracker.uom = 'milliliter'
          tracker.default = '350'
        }
        return tracker
      })
      .filter((tracker) => {
        return !$TrackerStore.trackers[tracker.tag]
      })
  }

  function isInstalled(tracker) {
    return (
      $TrackerStore.trackers.hasOwnProperty(tracker.tag) ||
      installed.hasOwnProperty(tracker.tag)
    )
  }

  function getTypeLabel(id: string) {
    if (TrackerTypes.hasOwnProperty(id)) {
      return TrackerTypes[id].label
    } else {
      return id
    }
  }

  async function toggleTrackerInstalled(tracker) {
    if (!isInstalled(tracker)) {
      TrackerStore.saveTracker(tracker)
      installed[tracker.tag] = true
      Interact.toast(`${tracker.label} added`)
    } else {
      let confirmed = await Interact.confirm(
        `Remove ${tracker.label}?`,
        `Data will be untouched`,
      )
      if (confirmed) {
        await TrackerStore.deleteTracker(tracker)
        delete installed[tracker.tag]
        installed = installed
        Interact.toast(`${tracker.label} removed`)
      }
    }
  }
</script>

<style lang="postcss">
  .intro-message {
    text-align: center;
    margin: 0 16px;
  }
</style>

<Modal2 visible={true} id="library" className="library-modal h-full">
  <Panel className="h-full">
    <header slot="header">
      <ToolbarGrid>
        <h3 class="ntitle">
          {Lang.t('tracker.things-to-track', 'Things to Track')}
        </h3>
      </ToolbarGrid>
    </header>

    {#if $TrackerLibrary.first}
      <div class="p-3 intro-message">
        <NText size="sm" tag="div">
          {Lang.t('tracker.pick-at-least-one', 'Pick 1 to continue')}
        </NText>
      </div>
    {/if}

    <List>
      {#if trackers.length == 0}
        <Empty
          title={"That's all!"}
          description="You've installed the library trackers!"
          emoji="🤗">
          <Text size="sm" center className="mt-2">
            Visit
            <a href="https://nomie.app/trackers" target="_blank">
              https://nomie.app
            </a>
            for more
          </Text>
        </Empty>
      {/if}
      {#each trackers as tracker, index (tracker.tag)}
        <ListItem
          className="tracker-{tracker.tag} index-{index}"
          title={tracker.label}
          description={`${getTypeLabel(tracker.type)}`}
          clickable
          on:click={() => {
            toggleTrackerInstalled(tracker)
          }}>
          <div slot="left">
            <Avatar emoji={tracker.emoji} size={45} />
          </div>
          <div slot="right">
            {#if $TrackerStore.trackers.hasOwnProperty(tracker.tag) || installed.hasOwnProperty(tracker.tag)}
              <NIcon
                name="checkmarkOutline"
                className="fill-primary"
                size={24} />
            {/if}
          </div>
        </ListItem>
      {/each}
    </List>

    <div slot="footer" class="flex-shrink-0 p-3">
      <Button
        color="primary"
        block
        disabled={Object.keys(installed).length === 0 && $TrackerLibrary.first}
        on:click={TrackerLibrary.toggle}>
        {Lang.t('general.start-tracking', 'Start Tracking')}
      </Button>
    </div>

  </Panel>

</Modal2>
