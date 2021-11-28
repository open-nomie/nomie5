<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import NomieUOM from '../../utils/nomie-uom/nomie-uom'
  import { PeopleStore } from '../../store/people-store'
  import Text from '../text/text.svelte'
  import Button from '../button/button.svelte'
  import Avatar from '../avatar/avatar.svelte'
  import Row from '../row/row.svelte'
  const dispatch = createEventDispatcher()

  export let element = undefined
  export let style = ''
  export let truncate = false
  export let solo = false
  export let xs = false
  export let sm = false
  export let novalue = false
  export let className = ''
  export let value: string | number | undefined = undefined
  export let compact: boolean = false
  // export let value = undefined;

  let hasEmojiSlot: any = (arguments[1].$$slots || { emoji: undefined }).emoji
  let avatarSize: number = 40

  $: if (xs) {
    avatarSize = 20
  }
  $: if (compact) {
    avatarSize = 30
  }

  function shouldShowValue(trackerElement) {
    if (trackerElement.obj && trackerElement.obj.type == 'picker') {
      return true
    } else if (trackerElement.type == 'person') {
      return false
    } else if (trackerElement.obj && trackerElement.obj.type == 'tick') {
      return true
    } else if (trackerElement.value !== undefined) {
      return true
    } else if (value) {
    } else {
      return false
    }
  }
</script>

<style global lang="postcss">
  .tracker-small-block {
    @apply text-left;
    @apply bg-gray-100 dark:bg-gray-900;
    @apply flex flex-row items-center justify-start;
    @apply text-black dark:text-white;
    @apply p-1;
    @apply rounded-xl;
  }
  .tracker-small-block .title {
    @apply leading-tight;
    @apply text-sm;
    @apply line-clamp-1;
  }
  .tracker-small-block .value {
    @apply font-bold;
  }

  .tracker-small-block.compact {
    @apply p-0;
    @apply bg-transparent;
    @apply text-xs;
  }
  .tracker-small-block.compact .title,
  .tracker-small-block.compact .value {
    @apply text-xs;
  }
</style>

{#if element}
  <button
    on:click={(event) => {
      event.preventDefault()
      event.stopPropagation()
      dispatch('click', element)
    }}
    class="tracker-small-block {compact ? 'compact' : ''}">
    <!-- avatar -->
    <div class="avatar-holder stiff">
      {#if hasEmojiSlot}
        <slot name="emoji" />
      {:else if element.type == 'tracker'}
        <Avatar
          size={avatarSize}
          color={(element.obj || {}).color}
          emoji={(element.obj || {}).emoji}
          label={(element.obj || {}).label || element.id}
          className="stiff mr-2" />
      {:else if element.type == 'person'}
        {#if $PeopleStore.people[element.id] && $PeopleStore.people[element.id].avatar}
          <Avatar
            size={avatarSize}
            src={$PeopleStore.people[element.id].avatar}
            className="stiff mr-2" />
        {:else if $PeopleStore.people[element.id] && $PeopleStore.people[element.id].displayName}
          <Avatar
            size={avatarSize}
            label={$PeopleStore.people[element.id].displayName}
            className="stiff mr-2" />
        {:else}
          <Avatar size={avatarSize} label={element.id} className="stiff mr-2" />
        {/if}
      {/if}
    </div>
    <!-- Label -->
    <div class="filler">
      <p class="title">{(element.obj || {}).label || element.id}</p>
      {#if shouldShowValue(element)}
        <p class="value">
          {#if element.value || value}
            {NomieUOM.format(element.value || value, (element.obj || {}).uom) || ''}
          {:else}0{/if}
        </p>
      {/if}
    </div>
  </button>
{/if}

<!-- 
{#if element}

  <button
    style="padding:inherit;"
    class="{className} tracker-small-block {solo ? 'solo' : ''}
    {xs ? 'size-xs' : 'size-md'}
    {novalue ? 'novalue' : ''}
    "
    on:click={(event) => {
      event.preventDefault()
      event.stopPropagation()
      dispatch('click', element)
      return false
    }}>

    {#if hasEmojiSlot}
      <slot name="emoji" />
    {:else if element.type == 'tracker'}
      <Avatar
        size={avatarSize}
        color={(element.obj || {}).color}
        emoji={(element.obj || {}).emoji}
        label={(element.obj || {}).label || element.id}
        className="stiff mr-2" />
    {:else if element.type == 'person'}
      {#if $PeopleStore.people[element.id] && $PeopleStore.people[element.id].avatar}
        <Avatar
          size={avatarSize}
          src={$PeopleStore.people[element.id].avatar}
          className="stiff mr-2" />
      {:else if $PeopleStore.people[element.id] && $PeopleStore.people[element.id].displayName}
        <Avatar
          size={avatarSize}
          label={$PeopleStore.people[element.id].displayName}
          className="stiff mr-2" />
      {:else}
        <Avatar size={avatarSize} label={element.id} className="stiff mr-2" />
      {/if}
    {/if}
    <div class="flex flex-col w-full">
      <div class="border-r border-red-500 line-clamp-1">
        {(element.obj || {}).label || element.id}
      </div>
      {#if shouldShowValue(element)}
        {#if element.value === 0}
          <div
            class="{xs ? 'text-xs' : 'text-lg'} font-bold leading-none"
            style="white-space:pre">
            0
          </div>
        {:else}
          <div
            class="{xs ? 'text-xs' : 'text-lg'} font-bold leading-none"
            style="white-space:pre">
            {NomieUOM.format(element.value || value, (element.obj || {}).uom) || ''}
          </div>
        {/if}
      {/if}
    </div>

  </button>
{/if} -->
