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

  :global(.shortcut-button) {
    flex-grow: 1;
    flex-shrink: 0;
    height: 144px;
    justify-content: stretch;
    border-radius: 22px;
    margin: 6px;
    padding: 14px 14px 6px 14px;
    box-shadow: var(--box-shadow-float) !important;
    overflow: hidden;

    transition: all 0.2s ease-in-out;

    position: relative;
    color: var(--color-inverse-2);

    .title {
      font-weight: 500;
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

    &.compact {
      .emoji {
        font-size: 30px;
        line-height: 100%;
      }
      .title {
        font-size: 0.8rem !important;
      }
      .value {
        font-size: medium !important;
      }
      .subtitle {
        font-size: x-small !important;
      }
      height: 120px;
    }

    @include media-breakpoint-down(xs) {
      padding: 12px 12px 4px 12px;
    }

    @include media-breakpoint-down(sm) {
      width: calc(33% - 12px);
      min-width: calc(33% - 12px);
      max-width: calc(33% - 12px);
      .title {
        font-size: 0.8rem !important;
      }
      .value {
        font-size: large;
      }
      .subtitle {
        font-size: small !important;
      }
    }

    @include media-breakpoint-up(md) {
      width: 150px;
      min-width: 150px;
      max-width: 150px;
      .title {
        font-size: medium !important;
      }
      .value {
        font-size: large;
      }
      .subtitle {
        font-size: small !important;
      }
    }

    .emoji {
      font-size: 40px;
      line-height: 40px;
      text-shadow: 0px 4px 8px rgba(0, 0, 0, 0.23);
      letter-spacing: -6px;
      color: var(--color-inverse);
      white-space: nowrap;
    }

    &.no-value {
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

    .bottom {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      flex-shrink: 1;
      justify-content: flex-end;
      padding-bottom: 6px;
    }

    .top {
      position: relative;
      z-index: 10;
      flex-grow: 0;
      flex-shrink: 0;
    }

    button.more {
      position: absolute;
      top: 0;
      right: -2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: transparent;
      font-size: 12px;
      border: solid 1px var(--color-inverse-3);
      color: rgba(255, 255, 255, 0.6);
      svg {
        stroke: var(--color-inverse-3) !important;
      }
      &.icon-other {
        border: none;
      }
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
      <button class="btn more {moreIcon !== 'more' ? 'icon-other' : ''} btn-icon p-0" on:click|preventDefault|stopPropagation={more}>
        <Icon name={moreIcon} size="16" />
      </button>
    {/if}
  </div>
  <slot />
  <div class="bottom w-100 text-left" style="padding-bottom:6px;">
    {#if title}
      <div class="title" style="margin-bottom:4px">{title}</div>
    {/if}
    {#if value && !hideValue}
      <div class="value" style="margin-bottom:4px">{value}</div>
    {/if}
    {#if subtitle}
      <div class="subtitle" style="opacity:0.6; margin-bottom:4px;">{subtitle}</div>
    {/if}
    <slot name="subtitle" class="what" />
  </div>
</Button>
