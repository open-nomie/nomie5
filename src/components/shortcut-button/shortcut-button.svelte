<script lang="ts">
  import type { fill, tap } from "lodash";
  import { createEventDispatcher } from "svelte";
  import { UserStore } from "../../store/user-store";

  import Button from "../button/button.svelte";
  import Icon from "../icon/icon.svelte";
  // import Text from "../text/text.svelte";

  export let title: string | undefined = undefined;
  export let subtitle: string | undefined = undefined;
  export let value: string | undefined = undefined;
  export let color: string | undefined = undefined;
  export let emoji: string | undefined = undefined;
  // export let titleSize: string = "sm";
  export let taps: number = 0;
  export let hideMore: boolean = false;
  export let hideValue: boolean = false;
  export let className: string = "";
  export let compact: boolean = false;
  export let moreIcon: string = "more";

  const dispatch = createEventDispatcher();

  async function more() {
    dispatch("more");
  }
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";

  @mixin generateLabelSizes($base) {
    .title {
      font-size: $base * 0.8;
    }
    .value {
      font-size: $base;
    }
    .subtitle {
      font-size: $base * 0.7;
    }
  }

  :global(.shortcut-button .more.icon-other) {
    border: none !important;
  }

  :global(.shortcut-button) {
    --scb-pad: 14px;

    flex-grow: 1;
    flex-shrink: 0;
    height: 144px;
    justify-content: stretch;
    border-radius: 22px;
    margin: 6px;
    box-shadow: var(--box-shadow-tight) !important;
    overflow: hidden;
    transition: all 0.2s ease-in-out;
    position: relative;
    color: var(--color-inverse-2);
    padding: 0;

    .title {
      font-weight: 600;
    }
    .title,
    .subtitle,
    .value {
      line-height: 112%;
      margin-bottom: 4px;
      width: 100%;
    }
    .value {
      font-weight: bold;
    }

    &:hover,
    &:active {
      color: var(--color-inverse-2);
    }

    &:active,
    &:focus {
      box-shadow: var(--box-shadow-tight) !important;
    }

    @include generateLabelSizes(1.1em);

    &.compact {
      --scb-pad: 12px;
      .emoji {
        font-size: 30px;
        line-height: 100%;
      }
      @include generateLabelSizes(0.96em);
      height: 124px;
      .highlight {
        display: none;
      }
    }

    @include media-breakpoint-down(xs) {
      --scb-pad: 12px;
      @include generateLabelSizes(0.96em);
    }

    @include media-breakpoint-down(sm) {
      width: calc(33% - 12px);
      min-width: calc(33% - 12px);
      max-width: calc(33% - 12px);
    }

    @include media-breakpoint-up(md) {
      width: 150px;
      min-width: 150px;
      max-width: 150px;
    }

    .emoji {
      font-size: 2em;
      line-height: 100%;
      // text-shadow: 0px 4px 8px rgba(0, 0, 0, 0.23);
      letter-spacing: -6px;
      color: var(--color-inverse);
      white-space: nowrap;
      width: 100%;
      text-align: left;
    }

    &:before {
      transition: all 0.4s ease-in-out;
      content: "";
      z-index: 0;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      // background-color: rgba(0, 0, 0, 0.12);
      opacity: 0;
      transform: translateX(-180px);
    }

    &.has-value {
      position: relative;

      &:before {
        transform: translateY(0px);
        opacity: 1;
      }
    }

    .top,
    .bottom {
      position: relative;
      z-index: 10;
      display: flex;
    }

    .bottom {
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

    .top {
      position: absolute;
      top: var(--scb-pad);
      left: var(--scb-pad);
      flex-grow: 0;
      flex-shrink: 0;
    }

    button.more {
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
      color: rgba(255, 255, 255, 0.6);
    }
    .highlight {
      transition: all 0.2s ease-in-out;
      position: absolute;
      bottom: 7px;
      left: 14px;
      right: 14px;
      height: 3px;
      border-radius: 2px;
      overflow: hidden;
      transform: scaleX(0%);
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: stretch;
      opacity: 0.2;
      .bar {
        border-radius: 2px;
        height: 3px;
        flex-grow: 1;
        flex-shrink: 1;
        margin-right: 1px;
        margin-left: 2px;
      }
    }
  }
  :global(.shortcut-button.has-value .highlight) {
    // color: #fff !important;
    transform: scaleX(100%);
    opacity: 0.2;
  }

  :global(.shortcut-button.has-value svg) {
    stroke: #fff !important;
  }
  :global(.shortcut-button.no-value .more svg) {
    stroke: rgba(150, 150, 150, 0.6);
  }
  :global(.shortcut-button.no-value .more) {
    border: solid 1px rgba(150, 150, 150, 0.6);
  }
  :global(.shortcut-button.has-value) {
    color: #fff;
    .more {
      border: solid 1px rgba(255, 255, 255, 0.6);
    }
    &:before {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.12);
    }
  }
  :global(.shortcut-button.has-value .n-text) {
    color: #fff !important;
  }
  :global(.shortcut-button.has-value .n-counter) {
    color: #fff !important;
  }
</style>

<Button
  ariaLabel={title || 'button'}
  color="clear"
  className="{className} shortcut-button d-flex flex-column {value ? 'has-value' : 'no-value'}
  {compact ? 'compact' : ''}"
  style={`background-color:${value ? color || 'var(--color-primary)' : 'var(--color-solid)'};`}
  on:longpress={() => {
    dispatch('longpress');
  }}
  on:click={() => {
    dispatch('click');
  }}>
  <div class="highlight">
    {#each new Array(taps) as tap}
      <div class="bar {tap}" style={value ? `background-color:#FFF` : ''} />
    {/each}
  </div>
  <div class="n-row top">
    <div class="emoji" style={value ? 'color:#FFF' : `color:${color}`}>
      {#if emoji}{emoji}{/if}
      <slot name="emoji" />
    </div>
    {#if !hideMore}
      <button class="more {moreIcon !== 'more' ? 'icon-other' : ''} p-0" on:click|preventDefault|stopPropagation={more}>
        <Icon name={moreIcon} size="16" />
      </button>
    {/if}
  </div>
  <slot />
  <div class="bottom text-left" style="padding-bottom:6px;">
    {#if title}
      <div class="title">{title}</div>
    {/if}
    {#if value && !hideValue}
      <div class="value truncate">{value}</div>
    {/if}
    {#if subtitle}
      <div class="subtitle truncate" style="opacity:0.6;">{subtitle}</div>
    {/if}
    <slot name="subtitle" class="what" />
  </div>
</Button>
