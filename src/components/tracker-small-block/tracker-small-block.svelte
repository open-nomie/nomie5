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
  // export let value = undefined;

  let hasEmojiSlot = arguments[1].$$slots || {}.emoji
  let avatarSize = 40

  $: if (xs) {
    avatarSize = 20
  }
  $: if (sm) {
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
    @apply flex;
    @apply items-center;
    @apply justify-center;
    @apply bg-gray-100 dark:bg-gray-900;
    @apply flex-shrink-0;
    @apply p-1;
    @apply h-auto;
  }
</style>

{#if element}

  <Button
    color={solo ? 'light' : 'clear'}
    {style}
    className="{className} flex tracker-small-block {solo ? 'solo' : ''}
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
        className="mr-2" />
    {:else if element.type == 'person'}
      {#if $PeopleStore.people[element.id] && $PeopleStore.people[element.id].avatar}
        <Avatar
          size={avatarSize}
          src={$PeopleStore.people[element.id].avatar}
          className="mr-2" />
      {:else if $PeopleStore.people[element.id] && $PeopleStore.people[element.id].displayName}
        <Avatar
          size={avatarSize}
          label={$PeopleStore.people[element.id].displayName}
          className="mr-2" />
      {:else}
        <Avatar size={avatarSize} label={element.id} className="mr-2" />
      {/if}
    {/if}
    <div
      class="{truncate ? 'line-clamp-1' : ''} text-left flex flex-col
      justify-center w-full items-start">
      <h3 class="flex-grow flex-shrink w-full text-sm line-clamp-1">
        {(element.obj || {}).label || element.id}
      </h3>
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

  </Button>
{/if}
