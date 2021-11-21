<script lang="ts">
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

  import ListItem from '../../../components/list-item/list-item.svelte'
  import NModal from '../../../components/modal/modal.svelte'
  import NIcon from '../../../components/icon/icon.svelte'
  import NToggle from '../../../components/toggle-switch/toggle-switch.svelte'
  import NInput from '../../../components/input/input.svelte'
  import ColorPicker from '../../../components/color-picker/color-picker.svelte'
  import AutoComplete from '../../../components/auto-complete/auto-complete.svelte'
  import PickerListEditor from '../../../components/picker-list/picker-editor.svelte'

  // Utils
  import { createEventDispatcher } from 'svelte'
  import NomieUOM from '../../../utils/nomie-uom/nomie-uom'
  import tick from '../../../utils/tick/tick'

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

  import is from '../../../utils/is/is'
  import trackerTypes from '../../../modules/tracker-types/tracker-types'
  import type { toLower } from 'lodash'
  import Emoji from '../../../components/emoji-selector/Emoji.svelte'
  import Avatar from '../../../components/avatar/avatar.svelte'

  const dispatch = createEventDispatcher()

  export let tracker = new Tracker({})

  let showEmojiSelector = false
  // export let show = false;

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

  // Watch for Tracker Change
  $: if (tracker && lastTracker != tracker.tag) {
    lastTracker = tracker.tag
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

  $: if (data.tracker._dirty && data.tracker.label && !data.tracker.emoji) {
    data.tracker.emoji = data.tracker.label.substr(0, 1)
  } else if (data.tracker._dirty && data.tracker.emoji == '⚪') {
    data.tracker.emoji = undefined
  }

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
          click() {
            if (data.tracker) {
              data.tracker.type = typeKey
            }
          },
        }
      })
      Interact.popmenu({
        title: Lang.t('tracker.type', 'Tracker Type'),
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

<style global lang="postcss">
  .n-tracker-editor .n-modal {
    background-color: var(--color-bg) !important;
  }
  .n-tracker-editor .emoji-editor {
    min-height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    justify-items: center;
    margin: 24px 0;
    --emoji-size: 100px;
    --emoji-size-half: 50px;
  }
  .n-tracker-editor .emoji-editor input {
    display: block;
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .n-tracker-editor .emoji-editor .emoji {
    --emoji-width: calc(var(--emoji-size) * 2);
    transition: all 0.2s ease-in-out;
    position: relative;
    width: var(--emoji-width);
    height: var(--emoji-size);
    border-radius: var(--emoji-size-half);
  }
  .n-tracker-editor .emoji-editor .emoji input {
    height: calc(var(--emoji-size) - 8px);
    width: calc(var(--emoji-width) - 8px);
    text-align: center;
    font-size: calc(var(--emoji-size) * 0.7) !important;
  }
  .n-tracker-editor .emoji-editor .emoji input:focus {
    outline: none !important;
    box-shadow: var(--box-shadow-float);
  }
  .n-tracker-editor .emoji-editor .emoji .background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.5;
    border-radius: var(--emoji-size-half);
  }
  .n-tracker-editor .emoji-editor .emoji.no-emoji:after {
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9em;
    color: var(--color-solid-1);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    content: 'Emoji';
  }
</style>

{#if $Interact.trackerEditor.show}

  <div class="n-tracker-editor">
    <NModal
      type="fullscreen"
      allowClose
      on:close={methods.cancel}
      style="z-index:2002">

      <header slot="header" class="n-toolbar-grid">
        <div class="left">
          <Button type="clear" color="primary" on:click={methods.cancel}>
            Cancel
          </Button>
        </div>
        <div class="main">
          {data.tracker._dirty ? 'Create' : 'Edit'}
          {data.tracker.label.length ? data.tracker.label : ''}
        </div>
        <div class="right">
          <Button
            className="save-action"
            disabled={!canSave}
            color="primary"
            type="clear"
            on:click={methods.saveTracker}>
            {Lang.t('general.save')}
          </Button>
        </div>
      </header>

      <!-- Colort Selector -->
      <ColorPicker
        bind:value={data.tracker.color}
        className="mb-1 tracker-color" />

      <!-- Tracker Label input -->
      <div class="mb-3">
        <NInput
          listItem
          className="mt-2 tracker-label"
          type="text"
          name="label"
          placeholder={Lang.t('tracker.label', 'Tracker Label')}
          bind:value={data.tracker.label}
          on:keyup={methods.labelChanged}>
          <div slot="right">
            {#if data.tracker.tag}
              <button
                on:click={methods.editTag}
                class="space-x-3 bg-opacity-50 rounded-full bg-blue-500
                text-white text-sm py-1 px-3 flex items-center justify-between">
                <span>#{data.tracker.tag}</span>
                {#if data.tracker._dirty}
                  <Icon name="edit" size="12" />
                {/if}
              </button>
            {/if}
          </div>
        </NInput>

      </div>

      <div class="mb-3">
        <ListItem title="Emoji" on:click={() => (showEmojiSelector = true)}>
          <div slot="right">
            {#if data.tracker.emoji}
              <Avatar size={42} emoji={data.tracker.emoji} />
            {:else}No Emoji{/if}
          </div>
        </ListItem>
        {#if showEmojiSelector}
          <div class="bg-solid-1">
            <EmojiSelector
              on:emoji={(evt) => {
                showEmojiSelector = false
                data.tracker.emoji = evt.detail
                console.log(evt, data.tracker)
              }} />
          </div>
        {/if}
      </div>

      <!-- Tracker Type Selector -->

      <ListItem
        on:click={methods.selectType}
        className="tracker-type py-3 mb-3">
        {Lang.t('tracker.tracker-type', 'Tracker Type')}
        <div slot="right" class="flex">
          <Text bold>{(getTypeDetails(data.tracker.type) || {}).label}</Text>
          <Icon
            name="chevronDown"
            className="fill-inverse-2 mr-3 ml-2"
            size="16" />
        </div>
      </ListItem>

      {#if data.tracker.type == 'picker'}
        <PickerListEditor
          canSelect={false}
          bind:list={tracker.picks}
          className="tracker-picker"
          itemClass=""
          on:change={(evt) => {
            data.tracker.picks = (evt.detail || []).filter((d) => d.length)
          }} />
      {/if}

      {#if data.tracker.type == 'range'}
        <ListItem className="py-0 mb-3">
          <div class="flex">
            <NInput
              pattern="[0-9]*"
              inputmode="numeric"
              className="mr-2 tracker-min"
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
        </ListItem>
      {/if}

      {#if data.tracker.type == 'note'}
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
      {/if}

      {#if data.tracker.type !== 'timer' && data.tracker.type !== 'note' && data.tracker.type !== 'picker'}
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
      {/if}

      <!-- ADVANCED OPTIONS -->

      {#if advancedCanToggle}
        <Button
          block
          text
          color="clear"
          size="sm"
          className="mt-2 mb-1 advanced-toggler"
          on:click={() => (forcedAdvanced = !forcedAdvanced)}>
          {#if advanced}Hide Advanced Options{:else}Show Advanced Options{/if}
          <Icon
            name={advanced ? 'chevronUp' : 'chevronDown'}
            size="12"
            className="ml-2" />

        </Button>
      {/if}

      {#if advanced}
        {#if data.tracker.type == 'tick'}
          <ListItem
            title={Lang.t('tracker.save-on-tap', 'Save on Tap')}
            className="tracker-one-tap mb-3 leading1"
            description={Lang.t('tracker.save-on-tap-description', 'Save note immediately after tapping the button.')}>
            <div slot="right">
              <NToggle bind:value={data.tracker.one_tap} />
            </div>
          </ListItem>
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
      {/if}

      {#if advanced && ['note', 'picker'].indexOf(data.tracker.type) === -1}
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
      {/if}

      {#if advanced}
        <PositivityEditor tracker={data.tracker} className="mb-3" />
      {/if}

      {#if data.tracker.type !== 'note' && data.tracker.type !== 'picker' && advanced}
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
      {/if}

      {#if advanced}
        <ListItem
          bg="transparent"
          id="hide-all-board"
          title={Lang.t('tracker.hide-on-all-board', 'Hide on All Board')}>
          <div slot="right">
            <NToggle bind:value={data.tracker.hidden} />
          </div>
        </ListItem>
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
    </NModal>

  </div>
{/if}
