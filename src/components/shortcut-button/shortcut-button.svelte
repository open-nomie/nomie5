<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  import is from "../../utils/is/is";
  import Avatar from "../avatar/avatar.svelte";

  import Button from "../button/button.svelte";
  import Icon from "../icon/icon.svelte";
  import TimeBalls from "../time-balls/time-balls.svelte";
  // import Text from "../text/text.svelte";

  export let title: string | undefined = undefined;
  export let subtitle: string | undefined = undefined;
  export let value: number | undefined = undefined;
  export let color: string | undefined = undefined;
  export let emoji: string | undefined = undefined;
  export let style: string = "";
  export let id: string | undefined = undefined;
  // export let titleSize: string = "sm";
  // export let taps: number = 0;
  export let hideMore: boolean = false;
  export let hideValue: boolean = false;
  export let className: string = "";
  export let compact: boolean = false;
  export let moreIcon: string = "more";
  export let oneTap: boolean = false;
  export let hoursUsed = [];

  let clickSkip;

  const dispatch = createEventDispatcher();

  async function more() {
    dispatch("more");
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
	 @apply rounded-lg;
	 --scb-pad: 14px;
	 height: 146px;
	 
	 box-shadow: var(--box-shadow-tight) !important;
	 overflow: hidden;
	 transition: all 0.4s cubic-bezier(0.19, -0.33, 0.78, 1.32);
	 color: var(--color-inverse-2);
	 padding: 0;
}
.shortcut-button:focus {
	@apply ring;
	@apply ring-2;
	@apply ring-blue-500;
}
 .shortcut-button .title {
	 font-weight: 600;
}
 .shortcut-button .title, .shortcut-button .subtitle, .shortcut-button .value {
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
 .shortcut-button:hover, .shortcut-button:active {
	 color: var(--color-inverse-2);
}
 .shortcut-button:active, .shortcut-button:focus {
	 box-shadow: var(--box-shadow-tight) !important;
}
 .shortcut-button .title {
	 font-size: 0.792em;
}
 .shortcut-button .value {
	 font-size: 1.1em;
}
 .shortcut-button .subtitle {
	 font-size: 0.77em;
}
 .shortcut-button.compact {
	 --scb-pad: 12px;
	 height: 124px;
}
 .shortcut-button.compact .title {
	 font-size: 0.6912em;
}
 .shortcut-button.compact .value {
	 font-size: 0.96em;
}
 .shortcut-button.compact .subtitle {
	 font-size: 0.672em;
}
 .shortcut-button .emoji {
	 margin-top: -2px;
	 margin-left: -2px;
}
 .shortcut-button:before {
	 transition: all 0.4s ease-in-out;
	 content: "";
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
 .shortcut-button .top, .shortcut-button .bottom {
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
 .shortcut-button .top {
	 position: absolute;
	 top: var(--scb-pad);
	 left: var(--scb-pad);
	 flex-grow: 0;
	 flex-shrink: 0;
}
 .shortcut-button button.more {
	 position: absolute;
	 top: 0;
	 right: 26px;
	 width: 20px;
	 height: 20px;
	 display: flex;
	 align-items: center;
	 justify-content: center;
	 border-radius: 50%;
	 background-color: transparent;
	 font-size: 12px;
	 border: solid 1px var(--color-inverse-3);
	 color: rgba(255, 255, 255, 0.4);
	 outline: none;
}
 .shortcut-button button.more:focus {
	 outline: none;
}
 .shortcut-button button.more:before {
	 content: "";
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
	 background-color: var(--color-solid-2);
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
  className="{className} shortcut-button d-flex flex-column {is.truthy(value) ? 'has-value' : 'no-value'}
  {compact ? 'compact' : ''}"
  style={`--tracker-color:${color}; background-color:${value ? color || 'var(--color-primary)' : 'var(--color-solid)'}; ${style}`}
  on:longpress={() => {
    dispatch('longpress');
    clickSkip = true;
  }}
  on:click={() => {
    if (!clickSkip) {
      dispatch('click');
    }
    clickSkip = undefined;
  }}>
  <div class="highlight {oneTap ? 'one-tap' : ''}">
    <TimeBalls color="#FFF" hours={hoursUsed} />
  </div>
  <div class="flex top">
    <div class="emoji" style={is.truthy(value) ? 'color:#FFF' : `color:${color}`}>
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
    {#if title}
      <div class="title">{title}</div>
    {/if}
    {#if value && !hideValue}
      <div class="truncate value">{value}</div>
    {/if}
    {#if subtitle}
      <div class="truncate subtitle" style="opacity:0.6;">{subtitle}</div>
    {/if}
    <slot name="subtitle" />
  </div>
</Button>
