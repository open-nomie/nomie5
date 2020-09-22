<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Button from "../button/button.svelte";
  import Text from "../text/text.svelte";

  export let title: string | undefined;
  export let subtitle: string | undefined;
  export let value: string | undefined;
  export let color: string | undefined;
  export let emoji: string = "⚪️";

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
    padding: 16px;
    box-shadow: var(--box-shadow-float);

    .emoji {
      transition: all 0.2s ease-in-out;
      font-size: 34px;
      line-height: 34px;
      text-shadow: 0px 5px 6px rgba(0, 0, 0, 0.23);
    }

    &.no-value {
      background-color: var(--color-solid);

      button.more {
        border: solid 1px var(--color-solid-2) !important;
        color: var(--color-solid-2) !important;
      }
    }

    .bottom {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      flex-shrink: 1;
      justify-content: flex-end;
    }

    .top {
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
</style>

<Button
  className="shortcut-button d-flex flex-column {value ? 'has-value' : 'no-value'}"
  style={`${value ? `background-color:${color}` : ''}`}
  on:longpress={() => {
    dispatch('longpress');
  }}
  on:click={() => {
    dispatch('click');
  }}>
  <div class="n-row top">
    <div class="emoji">{emoji}</div>
    <button class="more d-inline-flex justify-content-center align-items-center" on:click|preventDefault|stopPropagation={more}>•••</button>
  </div>
  <div class="bottom w-100 text-left">
    <Text size="sm">{title}</Text>
    {#if value}
      <Text size="lg">{value}</Text>
    {/if}
    {#if subtitle}
      <Text size="xs" truncate faded>{subtitle}</Text>
    {/if}
  </div>
</Button>
