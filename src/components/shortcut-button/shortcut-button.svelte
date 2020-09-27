<script lang="ts">
  import type { fill, tap } from "lodash";
  import { createEventDispatcher } from "svelte";

  import Button from "../button/button.svelte";
  import Icon from "../icon/icon.svelte";
  import Text from "../text/text.svelte";

  export let title: string | undefined;
  export let subtitle: string | undefined;
  export let value: string | undefined;
  export let color: string | undefined;
  export let emoji: string | undefined;
  export let titleSize: string = "sm";
  export let taps: number = 0;

  const dispatch = createEventDispatcher();

  const has_subtitle_slot = (arguments[1].$$slots || {}).hasOwnProperty("subtitle");

  async function more() {
    dispatch("more");
  }
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  :global(.shortcut-button) {
    @include media-breakpoint-down(xs) {
      width: calc(33% - 12px);
    }

    @include media-breakpoint-up(sm) {
      width: calc(33% - 12px);
    }

    @include media-breakpoint-up(md) {
      width: 180px;
    }

    flex-grow: 1;
    flex-shrink: 0;
    max-width: 180px;
    height: 144px;
    border-radius: 22px;
    margin: 6px;
    padding: 14px 14px 6px 14px;
    box-shadow: var(--box-shadow-float) !important;
    overflow: hidden;

    transition: all 0.2s ease-in-out;

    .emoji {
      font-size: 40px;
      line-height: 40px;
      text-shadow: 0px 4px 8px rgba(0, 0, 0, 0.23);
      letter-spacing: -6px;
      color: var(--color-inverse-3);
      white-space: nowrap;
    }

    &.no-value {
      // background-color: var(--color-solid);
      // button.more {
      //   border: solid 1px var(--color-solid-2) !important;
      //   color: var(--color-solid-2) !important;
      // }
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
      top: -2px;
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
    opacity: 1;
  }

  :global(.shortcut-button.has-value svg) {
    // stroke: #fff !important;
  }
</style>

<Button
  className="shortcut-button d-flex flex-column {value ? 'has-value' : 'no-value'}"
  style={`background-color:var(--color-solid);`}
  on:longpress={() => {
    dispatch('longpress');
  }}
  on:click={() => {
    dispatch('click');
  }}>
  <div class="highlight">
    {#each new Array(taps) as tap}
      <div class="bar {tap}" style={value ? `background-color:${color}` : ''} />
    {/each}
  </div>
  <div class="n-row top">
    <div class="emoji">
      {#if emoji}{emoji}{/if}
      <slot name="emoji" />
    </div>
    <button class="btn more btn-icon p-0" on:click|preventDefault|stopPropagation={more}>
      <Icon name="more" size="16" />
    </button>
  </div>
  <slot />
  <div class="bottom w-100 text-left" style="padding-bottom:6px;">
    {#if title}
      <Text size={titleSize} leading1 style="margin-bottom:4px">{title}</Text>
    {/if}
    {#if value}
      <Text size="lg" bold leading1 style="margin-bottom:4px">{value}</Text>
    {/if}
    {#if subtitle}
      <Text size="xs" truncate leading1 faded style="opacity:0.6; margin-bottom:4px;">{subtitle}</Text>
    {/if}
    <slot name="subtitle" />
  </div>
</Button>
