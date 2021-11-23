<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'

  import is from '../../utils/is/is'
  import Avatar from '../avatar/avatar.svelte'

  import Button from '../button/button.svelte'
  import Icon from '../icon/icon.svelte'
  import TimeBalls from '../time-balls/time-balls.svelte'
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
  export let moreIcon: string = 'more'
  export let oneTap: boolean = false
  export let hoursUsed = []

  let clickSkip

  const dispatch = createEventDispatcher()

  async function more() {
    dispatch('more')
  }
</script>

<style global lang="postcss">
  .shortcut-button .more.icon-other {
    border: none !important;
  }
  .shortcut-button {
    @apply relative;
    @apply flex-grow;
    @apply flex-shrink-0;
    @apply justify-items-stretch;
    @apply rounded-2xl;
    @apply shadow-md;
    @apply bg-white dark:bg-black;
    --scb-pad: 14px;
    height: 146px;

    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.19, -0.33, 0.78, 1.32);
    color: var(--color-inverse-2);
    padding: 0;
  }
  .shortcut-button:focus {
    @apply ring;
    @apply ring-2;
    @apply ring-primary-500;
  }

  .shortcut-button .title,
  .shortcut-button .subtitle,
  .shortcut-button .value {
    line-height: 112%;
    margin-bottom: 3px;
    width: 100%;
  }
  .shortcut-button .subtitle {
    margin-bottom: 5px;
  }
  .shortcut-button .value {
    font-weight: bold;
  }
  .shortcut-button:hover,
  .shortcut-button:active {
    color: var(--color-inverse-2);
  }
  .shortcut-button:active,
  .shortcut-button:focus {
    box-shadow: var(--box-shadow-tight) !important;
  }
  .shortcut-button .title {
    @apply font-medium;
    @apply text-sm;
    @apply md:text-base;
    @apply leading-tight;
    @apply line-clamp-2;
  }
  .shortcut-button .value {
    @apply font-bold;
    @apply text-base md:text-lg;
    @apply leading-none;
  }
  .shortcut-button .subtitle {
    @apply text-xs md:text-sm;
    @apply leading-none;
  }

  .shortcut-button .emoji {
    margin-top: -2px;
    margin-left: -2px;
  }
  .shortcut-button:before {
    transition: all 0.4s ease-in-out;
    content: '';
    z-index: 0;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0;
    transform: translateX(-180px);
  }
  .shortcut-button.has-value {
    position: relative;
  }
  .shortcut-button.has-value:before {
    transform: translateY(0px);
    opacity: 1;
  }
  .shortcut-button .top,
  .shortcut-button .bottom {
    position: relative;
    z-index: 10;
    display: flex;
  }
  .shortcut-button .bottom {
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
    justify-content: flex-end;
    padding-bottom: 6px;
    position: absolute;
    bottom: 6px;
    left: var(--scb-pad);
    right: var(--scb-pad);
  }

  .shortcut-button .more {
    @apply relative;
    @apply flex;
    @apply items-center;
    @apply justify-center;
    @apply bg-transparent;
    @apply rounded-full;
    width: 20px;
    height: 20px;

    font-size: 12px;
    border: solid 1px var(--color-inverse-3);
    color: rgba(255, 255, 255, 0.4);
    outline: none;
  }
  .shortcut-button button.more:focus {
    outline: none;
  }
  .shortcut-button button.more:before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    border-radius: 50%;
  }
  .shortcut-button .highlight {
    transition: all 0.2s ease-in-out;
    position: absolute;
    bottom: 7px;
    left: 14px;
    right: 14px;
    height: 5px;
    border-radius: 4px;
    overflow: hidden;
  }
  .shortcut-button .highlight.one-tap {
    @apply bg-gray-200 dark:bg-gray-900;
  }
  .shortcut-button.in-note {
    transform: scale(0.94);
    box-shadow: 0px 0px 9px var(--tracker-color) !important;
  }
  .shortcut-button.has-value .highlight.one-tap {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  .shortcut-button.has-value .emoji {
    color: #fff !important;
  }
  .shortcut-button.no-value .more svg {
    stroke: rgba(150, 150, 150, 0.6);
  }
  .shortcut-button.no-value .more {
    border: solid 1px rgba(150, 150, 150, 0.6);
  }
  .shortcut-button.has-value {
    color: #fff;
  }
  .shortcut-button.has-value .more {
    border: solid 1px rgba(255, 255, 255, 0.6);
  }
  .shortcut-button.has-value:before {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.12);
  }
  .shortcut-button .top {
    @apply flex;
    @apply justify-between;
    @apply items-start;
    @apply w-auto;
    @apply absolute;
    @apply top-4;
    @apply right-2;
    @apply left-2;
    flex-grow: 0;
    flex-shrink: 0;
    @apply px-2;
  }
  .shortcut-button.has-value .n-text {
    color: #fff !important;
  }
  .shortcut-button.has-value .n-counter {
    color: #fff !important;
  }
  .shortcut-button.full-width {
    width: calc(100% - 12px) !important;
    min-width: calc(100% - 12px) !important;
    max-width: calc(100% - 12px) !important;
  }
</style>

<Button
  {id}
  ariaLabel={title || 'button'}
  color="clear"
  className="{className} shortcut-button d-flex flex-column {is.truthy(value) ? 'has-value' : 'no-value bg-white dark:bg-black'}
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
        class="more {moreIcon !== 'more' ? 'icon-other' : ''} p-0"
        on:click|preventDefault|stopPropagation={more}>
        <Icon name={moreIcon} size={16} />
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
