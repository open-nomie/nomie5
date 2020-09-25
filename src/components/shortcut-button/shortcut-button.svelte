<script lang="ts">
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

  const dispatch = createEventDispatcher();

  async function more() {
    dispatch("more");
  }
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  :global(.shortcut-button) {
    @include media-breakpoint-down(xs) {
      width: calc(50% - 12px);
    }

    @include media-breakpoint-up(sm) {
      width: calc(33% - 12px);
    }

    @include media-breakpoint-up(md) {
      width: 180px;
    }

    max-width: 180px;
    height: 140px;
    border-radius: 22px;
    margin: 6px;
    padding: 14px;
    box-shadow: var(--box-shadow-float) !important;
    overflow: hidden;

    transition: all 0.2s ease-in-out;

    .emoji {
      font-size: 34px;
      line-height: 34px;
      text-shadow: 0px 4px 8px rgba(0, 0, 0, 0.23);
    }

    &.no-value {
      background-color: var(--color-solid);
      button.more {
        border: solid 1px var(--color-solid-2) !important;
        color: var(--color-solid-2) !important;
      }
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
      background-color: rgba(0, 0, 0, 0.12);
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
    }

    .top {
      position: relative;
      z-index: 10;
      flex-grow: 0;
      flex-shrink: 0;
    }

    button.more {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: transparent;
      font-size: 12px;
      border: solid 1px rgba(255, 255, 255, 0.6);
      color: rgba(255, 255, 255, 0.6);
    }
  }
  :global(.shortcut-button.has-value .n-text) {
    color: #fff !important;
  }
  :global(.shortcut-button.has-value svg) {
    stroke: #fff !important;
  }
</style>

<Button
  className="shortcut-button d-flex flex-column {value ? 'has-value' : 'no-value'}"
  style={`${value ? `background-color:${color}` : 'background-color:var(--color-solid)'}`}
  on:longpress={() => {
    dispatch('longpress');
  }}
  on:click={() => {
    dispatch('click');
  }}>
  <div class="n-row top">
    <div class="emoji">
      {#if emoji}{emoji}{/if}
      <slot name="emoji" />
    </div>
    <button class="btn more btn-icon p-0" on:click|preventDefault|stopPropagation={more}>
      <Icon name="more" size="16" />
    </button>
  </div>
  <div class="bottom w-100 text-left">
    {#if title}
      <Text size={titleSize} leading1 style="margin-bottom:6px">{title}</Text>
    {/if}
    {#if value}
      <Text size="md" leading1 style="margin-bottom:6px">{value}</Text>
    {/if}
    {#if subtitle}
      <Text size="xs" truncate leading1 faded>{subtitle}</Text>
    {/if}
  </div>
</Button>
