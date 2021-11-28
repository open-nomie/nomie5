<script lang="ts">
  import { Interact } from './../../../store/interact'
  import { Lang } from './../../../store/lang'
  import type { ITracker } from 'modules/tracker/tracker'
  import { onMount, afterUpdate, createEventDispatcher } from 'svelte'
  import NInput from '../../../components/input/input.svelte'
  import Icon from '../../../components/icon/icon.svelte'
  import Avatar from '../../../components/avatar/avatar.svelte'
  import TrackerConfig from '../../../modules/tracker/tracker'
  import Modal2 from '../../../components/modal/modal2.svelte'

  export let tracker: ITracker | any

  const dispatch = createEventDispatcher()

  let tagHardcoded: boolean = false
  let isDirty: boolean = false
  let localTracker: ITracker
  let showEmojiModal: boolean = false

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

  const getFreshTracker = () => {
    return new TrackerConfig(tracker)
  }

  $: if (
    (tracker?.emoji || '').length &&
    localTracker?.emoji !== tracker.emoji
  ) {
    localTracker = getFreshTracker()
  }

  $: if (
    (tracker?.color || '').length &&
    localTracker?.color !== tracker.color
  ) {
    localTracker = getFreshTracker()
  }

  onMount(() => {
    console.log('On Mount of Editor Color emoji')
    localTracker = getFreshTracker()
    isDirty = localTracker.tag?.length === 0
  })

  // afterUpdate(() => {
  //   console.log('Tracker Updated', tracker)
  //   localTracker = { ...tracker }
  // })

  const labelChanged = (evt: any) => {
    const input = evt.detail.target
    if (input) localTracker.label = input.value
    if (isDirty && input) {
      let tag = input.value
        .trim()
        .replace(/[^A-Z0-9]/gi, '_')
        .toLowerCase()
      localTracker.tag = tag
    }
    dispatch('label', localTracker.label)
  }

  const editTag = async () => {
    let tag: any = await Interact.prompt(
      `${Lang.t('general.notice', 'Notice')}`,
      `${Lang.t(
        'tracker.tag-no-change-message',
        'Once a tracker is saved, its tag can no longer be changed (easily). Make sure you like it!',
      )}`,
      {
        value: localTracker.tag,
      },
    )
    if (tag) {
      tagHardcoded = true
      localTracker.tag = tag
    }
  }
</script>

{#if localTracker}
  <div class="flex items-center px-2 py-1">
    <button
      style="background-color:{localTracker.color};"
      class="p-1 rounded-md"
      on:click={() => {
        dispatch('selectEmoji')
      }}>
      <Avatar size={50} className="" emoji={localTracker.emoji || '?'} />
    </button>
    <div>
      <NInput
        listItem
        className="z-10 h-10"
        type="text"
        name="label"
        solo
        placeholder={Lang.t('tracker.label', 'Tracker Label')}
        value={localTracker.label}
        on:keyup={(evt) => {
          console.log({ evt })
          labelChanged(evt)
        }} />
      {#if localTracker.tag}
        <button
          on:click={editTag}
          class="relative z-20 flex items-center justify-start w-full pb-2 pl-5 -mt-3 space-x-2 text-xs text-primary-500">
          <span>#{localTracker.tag}</span>
          {#if isDirty}
            <Icon name="edit" size={12} />
          {/if}
        </button>
      {/if}
    </div>
  </div>
{/if}
