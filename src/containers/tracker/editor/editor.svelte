<script lang="ts">
  import ButtonGroup from './../../../components/button-group/button-group.svelte'
  import EmojiSelector from './../../../components/emoji-selector/EmojiSelector.svelte'
  import EmojiEditor from './../../../components/emoji-editor/emoji-editor.svelte'
  // components

  /**
   * Welcome to the Editor - this is a mess... but I'm trying to simplify the whole process
   * this version will be removing the multistep tracker designer and replace it with
   * this view only.
   *
   * God speed.
   */
  import math from '../../../utils/math/math'
  import ListItem from '../../../components/list-item/list-item.svelte'

  import NIcon from '../../../components/icon/icon.svelte'
  import NToggle from '../../../components/toggle-switch/toggle-switch.svelte'
  import NInput from '../../../components/input/input.svelte'
  import AutoComplete from '../../../components/auto-complete/auto-complete.svelte'
  import PickerListEditor from '../../../components/picker-list/picker-editor.svelte'

  // Utils
  import { createEventDispatcher, onMount } from 'svelte'
  import NomieUOM from '../../../utils/nomie-uom/nomie-uom'

  import './editor.css'

  // modules
  import Tracker, { toTag } from '../../../modules/tracker/tracker'
  import type { ITrackerType } from '../../../modules/tracker/tracker'
  import TrackerTypes, {
    getTypeDetails,
  } from '../../../modules/tracker-types/tracker-types'

  // containers
  import PositivityEditor from '../points-editor.svelte'

  // Stores
  import { Interact } from '../../../store/interact'
  import { TrackerStore } from '../../../store/tracker-store'
  import { Lang } from '../../../store/lang'
  import Text from '../../../components/text/text.svelte'
  import Icon from '../../../components/icon/icon.svelte'
  import Button from '../../../components/button/button.svelte'

  import trackerTypes from '../../../modules/tracker-types/tracker-types'

  import Panel from '../../../components/panel/panel.svelte'
  import Modal2 from '../../../components/modal/modal2.svelte'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
  import FormGroup from '../../../components/form-group/form-group.svelte'
  import ColorEmojiTitleInput from './color-emoji-title-input.svelte'
  import ColorPicker from '../../../components/color-picker/color-picker.svelte'
  import ClassicButton from '../../../components/classic-button/classic-button.svelte'

  const dispatch = createEventDispatcher()

  let showEmojiSelector = false
  let emojiOrColor = 'emoji'
  // export let show = false;

  const randomEmojis = [
    '😂',
    '❤️',
    '🥳',
    '🍦',
    '🌞',
    '🍹',
    '🎱',
    '😎',
    '🥫',
    '🍲',
    '🍩',
    '🐕',
    '🌵',
    '📗',
    '🏈',
    '🌸',
  ]

  export let tracker = new Tracker({})

  type DataConfig = {
    groupedUOMs: any
    types: Array<any>
    editTag: boolean
    tracker?: Tracker
  }

  let data: DataConfig = {
    groupedUOMs: NomieUOM.toGroupedArray(),
    types: Object.keys(TrackerTypes).map((id: any) => {
      let type = TrackerTypes[id]
      type.id = id
      return type
    }),
    editTag: false,
    tracker: null,
  }

  let lastTracker: string // tag of the last tracker
  let advanced = false
  let forcedAdvanced = false
  let advancedCanToggle = true
  let tagHardcoded = false
  let canSave = true

  onMount(() => {
    console.log('FIRE FIRE FIRE ON MOUNT!')
  })

  // Watch for Tracker Change
  $: if (tracker && !data.tracker) {
    const randomEmoji =
      randomEmojis[math.random_range(0, randomEmojis.length - 1)]
    lastTracker = tracker.tag
    if (!tracker.emoji || tracker.emoji.length === 0)
      tracker.emoji = randomEmoji

    // Load up to a local state
    console.log('FIRE FIRE FRE !!!!!!!!!!', tracker.emoji)
    data.tracker = new Tracker(tracker)
  }

  // Watch for Tracker Changed while NOT Forced Advanced
  $: if (tracker && !forcedAdvanced) {
    if (
      tracker.default ||
      tracker.math !== 'sum' ||
      tracker.uom !== 'num' ||
      tracker.step
    ) {
      advanced = true
      advancedCanToggle = false
    } else {
      advancedCanToggle = true
      advanced = false
    }
  } else if (forcedAdvanced) {
    advanced = true
  }

  //Catch if the UPM is timer and not a timer tracker
  $: if (data.tracker.type === 'timer') {
    data.tracker.uom = 'timer'
    data.tracker.min = null
    data.tracker.max = null
  } else if (data.tracker.uom == 'timer') {
    data.tracker.uom = 'num'
  } else if (data.tracker.type === 'range' && isNaN(data.tracker.min)) {
    data.tracker.min = 1
    data.tracker.max = 10
  }

  $: if (data.tracker.label && data.tracker._dirty && !tagHardcoded) {
    data.tracker.tag = toTag(data.tracker.label)
  }

  /**
   * Can we save this?
   */

  $: {
    if (data.tracker.label.length > 0 && data.tracker.tag.length > 0) {
      canSave = true
    } else {
      canSave = false
    }
  }

  // $: if (data.tracker._dirty && data.tracker.label && !data.tracker.emoji) {
  //   data.tracker.emoji = data.tracker.label.substr(0, 1)
  // } else if (data.tracker._dirty && data.tracker.emoji == '⚪') {
  //   data.tracker.emoji = undefined
  // }

  /**
   * Get the Input for a tracker
   * used in getting defaults
   * but instead of using the defaults we will
   * make ranges use value input instead of the slider.
   */
  const getTrackerInput = async (target) => {
    const response = await Interact.trackerInput(
      {
        label: data.tracker.label || 'Value',
        tracker: 'value',
        type: data.tracker.type == 'range' ? 'numeric' : data.tracker.type,
        emoj: data.tracker.emoji || '',
      },
      {
        value: data.tracker.default,
        allowSave: false,
      },
    )
    if (response && response.value) {
      data.tracker[target] = response.value
    }
  }

  async function duplicate() {
    let duplicated = await TrackerStore.duplicateTracker(data.tracker)
  }

  async function remove() {
    let confirmed = await Interact.confirm(
      `${tracker.label} - ${Lang.t(
        'tracker.delete-from-nomie',
        'Delete from Nomie?',
      )}`,
      `${Lang.t(
        'tracker.delete-description',
        'You can always recreate it later. No log data will be deleted.',
      )} `,
    )
    if (confirmed) {
      await TrackerStore.deleteTracker(tracker)
      methods.cancel()
    }
  }

  const methods = {
    async saveTracker() {
      if (!data.tracker.tag || !data.tracker.label) {
        Interact.alert(
          'Missing Data',
          'Please fill out all required fields: title, tag and emoji',
        )
      } else {
        try {
          // If picker - clean up list
          if (data.tracker.type == 'picker') {
            data.tracker.picks = data.tracker.picks.filter((d) => `${d}`.length)
          }

          await TrackerStore.saveTracker(data.tracker)
          Interact.toast(`${data.tracker.label} saved`)
          dispatch('save', data.tracker)
          methods.cancel()
        } catch (e) {
          console.error(e)
          Interact.error(e.message)
        }
      }
    },
    async editTag() {
      let tag: any = await Interact.prompt(
        `${Lang.t('general.notice', 'Notice')}`,
        `${Lang.t(
          'tracker.tag-no-change-message',
          'Once a tracker is saved, its tag can no longer be changed (easily). Make sure you like it!',
        )}`,
        {
          value: data.tracker.tag,
        },
      )
      if (tag) {
        tagHardcoded = true
        data.tracker.tag = tag
      }
    },
    selectType() {
      const buttons = Object.keys(trackerTypes).map((typeKey: ITrackerType) => {
        let type = trackerTypes[typeKey]
        return {
          emoji: type.emoji,
          title: `${type.label} ${typeKey === data.tracker.type ? ' ✓' : ''}`,
          description: `${type.description}`,
          click: () => {
            if (data.tracker) {
              data.tracker.type = typeKey
            }
          },
        }
      })
      Interact.popmenu({
        title: Lang.t('tracker.type', 'Type'),
        buttons,
      })
    },
    async addTrackerToNote() {
      let trackers: any = await Interact.selectTrackers({
        filter: (v: Tracker) => {
          return v.type !== 'note'
        },
      })

      if (trackers) {
        let trkString = trackers
          .filter((t) => t)
          .map((tkr) => {
            return `#${tkr.tag}`
          })
          .join(' ')
        data.tracker.note =
          `${data.tracker.note || ''} ${trkString}`.trim() + ' '
      }
    },
    labelChanged(event) {
      if (data.tracker._dirty) {
        let tag = event.target.value
          .trim()
          .replace(/[^A-Z0-9]/gi, '_')
          .toLowerCase()
        data.tracker.tag = tag
      }
    },
    cancel() {
      data.tracker = new Tracker({})
      forcedAdvanced = false
      dispatch('close')
    },
  }
</script>

<Modal2 id="emoji-color" visible={showEmojiSelector}>
  <Panel>
    <header slot="header">
      <ToolbarGrid>
        <div slot="left">
          <Button
            type="clear"
            color="primary"
            on:click={() => (showEmojiSelector = false)}>
            Done
          </Button>
        </div>
        <ButtonGroup
          buttons={[{ label: 'Emoji', active: emojiOrColor === 'emoji', click() {
                emojiOrColor = 'emoji'
              } }, { label: 'Color', active: emojiOrColor === 'color', click() {
                emojiOrColor = 'color'
              } }]} />
        <div slot="right" />
      </ToolbarGrid>
      <section aria-label="Preview" class="px-4 py-2">
        <div
          class="p-4 text-center rounded-lg"
          style="background-color:{data.tracker.color}">
          <ClassicButton labelClass="text-black" tracker={data.tracker} />
        </div>
      </section>
    </header>
    {#if emojiOrColor === 'emoji'}
      <EmojiSelector
        on:emoji={(evt) => {
          data.tracker.emoji = evt.detail
        }} />
    {:else}
      <ColorPicker grid={true} bind:value={data.tracker.color} />
    {/if}
  </Panel>
</Modal2>

<Modal2
  id="tracker-editor"
  className="n-tracker-editor"
  visible={$Interact.trackerEditor.show}>
  <Panel
    className={`bg-gray-50 dark:bg-gray-800 max-w-screen-sm `}
    on:close={methods.cancel}>

    <header slot="header" class="n-toolbar-grid">
      <ToolbarGrid>
        <div slot="left">
          <Button type="clear" color="primary" on:click={methods.cancel}>
            Cancel
          </Button>
        </div>
        <div class="ntitle">
          {data.tracker._dirty ? 'Make a Tracker' : 'Edit'}
        </div>
        <div slot="right">
          <Button
            className="save-action"
            disabled={!canSave}
            color="primary"
            type="clear"
            on:click={methods.saveTracker}>
            {Lang.t('general.save')}
          </Button>
        </div>
      </ToolbarGrid>

    </header>

    <!-- Colort Selector -->
    <!-- <ColorPicker
      bind:value={data.tracker.color}
      className="mb-1 tracker-color" /> -->

    <!-- Tracker Label input -->
    <FormGroup pad>
      <ColorEmojiTitleInput
        on:label={(evt) => {
          data.tracker.label = evt.detail
        }}
        on:selectEmoji={() => {
          showEmojiSelector = true
        }}
        bind:tracker={data.tracker} />
    </FormGroup>

    <!-- <FormGroup pad>
      <ListItem
        title="Emoji"
        on:click={() => (showEmojiSelector = !showEmojiSelector)}>
        <div slot="right">
          {#if data.tracker.emoji}
            <Avatar size={42} emoji={data.tracker.emoji} />
          {:else}No Emoji{/if}
        </div>
      </ListItem>

    </FormGroup> -->

    <!-- Tracker Type Selector -->

    <FormGroup pad>
      <ListItem on:click={methods.selectType} className="tracker-type">
        {Lang.t('tracker.tracker-type', 'Tracker Type')}
        <div slot="right" class="flex">
          <Text bold>{(getTypeDetails(data.tracker.type) || {}).label}</Text>
          <Icon
            name="chevronDown"
            className="fill-inverse-2 mr-3 ml-2"
            size={16} />
        </div>
      </ListItem>
    </FormGroup>

    {#if data.tracker.type == 'picker'}
      <FormGroup pad>
        <!-- canSelect={false} -->
        <PickerListEditor
          bind:list={tracker.picks}
          className="tracker-picker"
          itemClass=""
          on:change={(evt) => {
            data.tracker.picks = (evt.detail || []).filter((d) => d.length)
          }} />
      </FormGroup>
    {/if}

    {#if data.tracker.type == 'range'}
      <FormGroup pad>
        <div class="flex px-1">
          <NInput
            pattern="[0-9]*"
            inputmode="numeric"
            className="mr-2 tracker-min bg-transparent"
            style="width:45%;"
            name="min"
            placeholder={Lang.t('tracker.min', 'Min Value')}
            label={Lang.t('tracker.min', 'Min Value')}
            on:focus={(e) => {
              e.detail.target.select()
            }}
            bind:value={data.tracker.min}>
            <div slot="right" class="pr-1">
              <Button
                icon
                on:click={() => {
                  getTrackerInput('min')
                }}>
                <NIcon name="addOutline" className="fill-inverse-2" />
              </Button>
            </div>

          </NInput>
          <NInput
            pattern="[0-9]*"
            inputmode="numeric"
            className="tracker-max"
            style="width:45%;"
            name="max"
            label={Lang.t('tracker.max', 'Max Value')}
            placeholder={Lang.t('tracker.max', 'Max Value')}
            on:focus={(e) => e.detail.target.select()}
            bind:value={data.tracker.max}>
            <div slot="right" class="pr-1">
              <Button
                icon
                on:click={() => {
                  getTrackerInput('max')
                }}>
                <NIcon name="addOutline" className="fill-inverse-2" />
              </Button>
            </div>
          </NInput>
        </div>
      </FormGroup>
    {/if}

    {#if data.tracker.type == 'note'}
      <FormGroup pad>
        <NInput
          listItem
          type="textarea"
          className="tracker-note mb-0"
          bind:value={data.tracker.note}
          placeholder={Lang.t('tracker.note-placeholder', 'Any content including #tracker @people +context')}>
          <span slot="right">
            <Button
              icon
              shape="circle"
              color="transparent"
              on:click={methods.addTrackerToNote}>
              <Icon name="addOutline" />
            </Button>
          </span>
        </NInput>
        <AutoComplete
          input={data.tracker.note}
          scroller
          on:select={async (evt) => {
            data.tracker.note = evt.detail.note + ''
          }} />
        <ListItem
          transparent
          description={Lang.t('tracker.note-description', 'Combine multiple trackers together using their #hashtags. For example, #mood #sleep_quality. Nomie will then ask for values one by one.')} />
      </FormGroup>
    {/if}

    {#if data.tracker.type !== 'timer' && data.tracker.type !== 'note' && data.tracker.type !== 'picker'}
      <FormGroup pad>
        <NInput
          listItem
          placeholder={Lang.t('tracker.measure-by', 'Measure By')}
          type="select"
          className="tracker-uom mb-3"
          bind:value={data.tracker.uom}>
          {#each Object.keys(data.groupedUOMs) as groupKey (groupKey)}
            {#if data.tracker.type !== 'timer' && groupKey !== 'Timer'}
              <option disabled>-- {groupKey}</option>
              {#each data.groupedUOMs[groupKey] as uom (`${groupKey}-${uom.key}`)}
                <option
                  value={uom.key}
                  disabled={uom.key == 'time' && data.tracker.type != 'timer'}>
                  {NomieUOM.plural(uom.key)}
                  {#if NomieUOM.plural(uom.key).toLowerCase() !== NomieUOM.symbol(uom.key).toLowerCase()}
                    ({NomieUOM.symbol(uom.key)})
                  {/if}
                </option>
              {/each}
            {/if}
          {/each}
        </NInput>
      </FormGroup>
    {/if}

    <!-- ADVANCED OPTIONS -->

    {#if advancedCanToggle}
      <div class="px-4">
        <Button
          block
          text
          color="clear"
          size="sm"
          className="mt-2 mb-3 advanced-toggler text-gray-600 dark:text-gray-200"
          on:click={() => (forcedAdvanced = !forcedAdvanced)}>
          {#if advanced}Hide Advanced Options{:else}Show Advanced Options{/if}
          <Icon
            name={advanced ? 'chevronUp' : 'chevronDown'}
            size={12}
            className="ml-2 text-gray-500" />

        </Button>
      </div>
    {/if}

    {#if advanced}
      {#if data.tracker.type == 'tick'}
        <FormGroup pad>
          <ListItem
            title={Lang.t('tracker.save-on-tap', 'Save on Tap')}
            className="tracker-one-tap mb-3 leading1"
            description={Lang.t('tracker.save-on-tap-description', 'Save note immediately after tapping the button.')}>
            <div slot="right">
              <NToggle bind:value={data.tracker.one_tap} />
            </div>
          </ListItem>
        </FormGroup>
      {/if}

      {#if data.tracker.type === 'range'}
        <NInput
          listItem
          className="tracker-default mb-3"
          pattern="[0-9]*"
          inputmode="numeric"
          label={Lang.t('tracker.step', 'Range Step')}
          placeholder={Lang.t('tracker.step', 'Range Step')}
          bind:value={data.tracker.step}>
          <div slot="right" class="pr-1">
            <Button
              icon
              on:click={() => {
                getTrackerInput('step')
              }}>
              <NIcon name="addOutline" className="fill-inverse-2" />
            </Button>
          </div>
        </NInput>
      {/if}

      <!-- Advanced -->

      <!-- End Advanced -->
    {/if}

    {#if data.tracker.type !== 'note' && data.tracker.type !== 'picker' && advanced}
      <FormGroup pad>
        <NInput
          listItem
          type="select"
          className="tracker-math mb-3"
          name="math"
          placeholder={Lang.t('tracker.calculate-total', 'Calculate Totals')}
          bind:value={data.tracker.math}>
          {#each [{ value: 'sum', label: Lang.t('general.sum', 'Sum') }, { value: 'mean', label: Lang.t('general.avg', 'Average') }] as math_key}
            <option value={math_key.value}>{math_key.label}</option>
          {/each}
        </NInput>

        <ListItem
          className="px-3 py-1 mb-3 tracker-ignore-zeros"
          title="Ignore Zeros"
          description="Ignore zero values when averaging">
          <div slot="right">
            <NToggle bind:value={data.tracker.ignore_zeros} />
          </div>
        </ListItem>
      </FormGroup>
    {/if}

    {#if advanced && ['note', 'picker'].indexOf(data.tracker.type) === -1}
      <FormGroup pad>
        <NInput
          listItem
          className="tracker-default mb-3"
          pattern="[0-9]*"
          inputmode="numeric"
          label={Lang.t('tracker.value', 'Default Value')}
          placeholder={Lang.t('tracker.default-value', 'Default Value')}
          bind:value={data.tracker.default}>

          <div slot="right">
            {#if data.tracker.default}
              <Text size="xs" className="text-right text-primary-bright">
                {data.tracker.displayValue(data.tracker.default)}
              </Text>
            {/if}
            <Button
              className="pr-1"
              icon
              on:click={() => {
                getTrackerInput('default')
              }}>
              <NIcon name="addOutline" className="fill-inverse-2" />
            </Button>
          </div>
        </NInput>
      </FormGroup>
    {/if}

    {#if advanced}
      <FormGroup pad>
        <PositivityEditor tracker={data.tracker} />
      </FormGroup>
    {/if}

    {#if data.tracker.type !== 'note' && data.tracker.type !== 'picker' && advanced}
      <FormGroup pad>
        <ListItem>
          <NInput
            className="tracker-include"
            type="textarea"
            rows={2}
            label={Lang.t('tracker.include', 'Also Include')}
            placeholder={Lang.t('tracker.include-placeholder', 'Insert additional #trackers, @people, and +context when using this tracker')}
            bind:value={data.tracker.include} />
          <AutoComplete
            input={data.tracker.include}
            scroller
            on:select={async (evt) => {
              data.tracker.include = evt.detail.note + ''
            }} />
        </ListItem>
      </FormGroup>
    {/if}

    {#if advanced}
      <FormGroup pad>
        <ListItem
          bg="transparent"
          id="hide-all-board"
          title={Lang.t('tracker.hide-on-all-board', 'Hide on All Board')}>
          <div slot="right">
            <NToggle bind:value={data.tracker.hidden} />
          </div>
        </ListItem>
      </FormGroup>
    {/if}

    {#if !data.tracker._dirty}
      <div class="p-4 mt-4" />

      <ListItem
        on:click={() => {
          TrackerStore.download(data.tracker)
        }}
        className="bottom-line">
        <div class="text-primary-bright">
          {Lang.t('general.download', 'Download')} .tkr
        </div>
        <div slot="right" class="text-faded-2">For Sharing</div>
      </ListItem>
      <ListItem on:click={duplicate} className="bottom-line">
        <div class="text-primary-bright">
          {Lang.t('tracker.duplicate-tracker', 'Duplicate Tracker')}
        </div>
      </ListItem>

      <ListItem on:click={remove} className="bottom-line">
        <div class="text-red">
          {Lang.t('tracker.remove-tracker', 'Delete Tracker')}
        </div>
      </ListItem>
    {/if}

    <div slot="footer" />
  </Panel>

</Modal2>
