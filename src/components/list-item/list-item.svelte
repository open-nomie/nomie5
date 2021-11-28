<script lang="ts">
  import { navigate, Link } from 'svelte-routing'
  import NText from '../text/text.svelte'
  import { createEventDispatcher } from 'svelte'
  import Ripple from '../button/ripple.svelte'
  import tick from '../../utils/tick/tick'
  import Icon from '../icon/icon.svelte'

  import './list-item.css'

  export let title = undefined
  export let description = undefined
  // export let borderBottom = false;

  export let href = undefined
  export let to = undefined
  export let id = null
  export let bg = undefined
  export let className = ''
  export let itemDivider = undefined
  export let compact = false
  export let truncate = false
  export let style = ''
  export let clickable = false
  export let ariaLabel = ''
  export let solo = false
  export let bottomLine = false
  export let topLine = false
  export let delay: number = undefined
  export let detail = false
  export let transparent = false

  const has_left = (arguments[1].$$slots || {}).hasOwnProperty('left')
  const has_right = (arguments[1].$$slots || {}).hasOwnProperty('right')
  const has_icon = (arguments[1].$$slots || {}).hasOwnProperty('icon')

  const dispatch = createEventDispatcher()

  let hit: Array<number>

  const methods = {
    async tap(event) {
      let timeout = 0
      if (delay !== undefined) {
        timeout = delay
      } else if (clickable || detail) {
        timeout = 200
      }
      await tick(timeout)
      if (href) {
        window.open(href, '_system')
      } else if (to) {
        navigate(to)
      }
      dispatch('click', event)
      dispatch('tap', event)
    },
    doubletap(evt) {
      dispatch('dbltap', evt)
    },
    longtap(evt) {
      dispatch('longtap', evt)
    },
    getHref() {
      return this.href || this.to || null
    },
    getStyle() {
      if (this.getHref) {
        return {
          cursor: 'pointer',
        }
      } else {
        return {}
      }
    },
  }
</script>

{#if clickable || detail}
  <button
    {id}
    aria-label={ariaLabel}
    on:tap={methods.tap}
    on:dbltap={methods.doubletap}
    on:longtap={methods.longtap}
    on:mousedown={(evt) => {
      hit = [evt.offsetX, evt.offsetY]
    }}
    on:contextmenu={(evt) => {
      dispatch('contextmenu', evt)
      return false
    }}
    item-divider={itemDivider}
    {style}
    class="n-item {compact ? 'compact' : ''}
    {transparent ? 'bg-transparent' : ''}
    {className}
    {bottomLine ? 'bottom-line' : ''}
    {topLine ? 'top-line' : ''}
    {solo ? 'solo' : ''}
    {bg ? `bg-${bg}` : ''}"
    :alt="title">
    {#if has_left}
      <div class="left">
        <slot name="left" />
      </div>
    {/if}
    <div class="main {truncate ? 'truncate' : ''}">
      {#if title}
        <div class="font-semibold leading-tight title">{title}</div>
      {/if}
      {#if description}
        <div class="description">{description}</div>
      {/if}
      <slot />
    </div>

    {#if has_right || detail}
      <div class="right d-flex align-items-center">
        <slot name="right" />
        {#if detail}
          <Icon
            name="chevronRight"
            className="fill-faded-2"
            style="margin-left:6px; margin-right:-10px;" />
        {/if}
      </div>
    {/if}
    {#if clickable || detail}
      <Ripple bind:hit />
    {/if}
  </button>
{:else}
  <div
    {id}
    aria-label={ariaLabel}
    on:tap={methods.tap}
    on:dbltap={methods.doubletap}
    on:longtap={methods.longtap}
    on:contextmenu={(evt) => {
      dispatch('contextmenu', evt)
      return false
    }}
    item-divider={itemDivider}
    {style}
    class="n-item {compact ? 'compact' : ''}
    {transparent ? 'bg-transparent' : ''}
    {className}
    {bottomLine === true ? 'bottom-line' : ''}
    {topLine ? 'top-line' : ''}
    {solo ? 'solo' : ''}
    {bg ? `bg-${bg}` : ''}
    "
    :alt="title">
    {#if has_left}
      <div class="left">
        <slot name="left" />
      </div>
    {/if}
    <div class="main {truncate ? 'truncate' : ''}">
      {#if title}
        <div class="font-semibold leading-tight title">{title}</div>
      {/if}
      {#if description}
        <div class="description">{description}</div>
      {/if}
      <slot />
    </div>

    {#if has_right}
      <div class="right">
        <slot name="right" />
      </div>
    {/if}
  </div>
{/if}
