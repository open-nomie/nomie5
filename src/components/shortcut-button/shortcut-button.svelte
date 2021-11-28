<script lang="ts">
  import IonIcon from './../icon/ion-icon.svelte'
  import { createEventDispatcher, onMount } from 'svelte'

  import MoreCircle from 'ionicons/dist/svg/ellipsis-horizontal-circle.svg?component'

  import is from '../../utils/is/is'
  import Avatar from '../avatar/avatar.svelte'

  import Button from '../button/button.svelte'
  import Icon from '../icon/icon.svelte'
  import TimeBalls from '../time-balls/time-balls.svelte'

  import './shortcut-button.css'
  // import Text from "../text/text.svelte";

  export let title: string | undefined = undefined
  export let subtitle: string | undefined = undefined
  export let value: any = undefined
  export let color: string | undefined = undefined
  export let emoji: string | undefined = undefined
  export let style: string = ''
  export let id: string | undefined = undefined
  // export let titleSize: string = "sm";
  // export let taps: number = 0;
  export let hideMore: boolean = false
  export let hideValue: boolean = false
  export let className: string = ''
  export let compact: boolean = false
  export let moreIcon: any = MoreCircle
  export let oneTap: boolean = false
  export let hoursUsed = []

  let clickSkip

  const dispatch = createEventDispatcher()

  async function more() {
    dispatch('more')
  }
</script>

<style global lang="postcss">

</style>

<Button
  {id}
  ariaLabel={title || 'button'}
  color="clear"
  className="{className} shortcut-button {is.truthy(value) ? 'has-value' : 'no-value bg-white dark:bg-black'}
  {compact ? 'compact' : ''}"
  style={[style, `--tracker-color:${color};`, value ? `background-color:${color};` : ``].join('')}
  on:longpress={() => {
    dispatch('longpress')
    clickSkip = true
  }}
  on:click={() => {
    if (!clickSkip) {
      dispatch('click')
    }
    clickSkip = undefined
  }}>
  <div class="highlight {oneTap ? 'one-tap' : ''}">
    <TimeBalls color="#FFF" hours={hoursUsed} />
  </div>
  <div class="flex top">
    <div
      class="emoji"
      style={is.truthy(value) ? 'color:#FFF' : `color:${color}`}>
      {#if emoji}
        <Avatar {emoji} size={compact ? 30 : 42} />
      {/if}
      <slot name="emoji" />
    </div>
    {#if !hideMore}
      <button
        aria-label="Tracker Options"
        class="p-0 more"
        on:click|preventDefault|stopPropagation={more}>
        <IonIcon icon={moreIcon} size={24} />
      </button>
    {/if}
  </div>
  <slot />
  <div class="text-left bottom" style="padding-bottom:6px;">

    {#if value && !hideValue}
      <div class="line-clamp-1 value">{value}</div>
    {/if}
    {#if title}
      <div class="title">{title}</div>
    {/if}
    {#if subtitle}
      <div class="truncate subtitle" style="opacity:0.6;">{subtitle}</div>
    {/if}
    <slot name="subtitle" />
  </div>
</Button>
