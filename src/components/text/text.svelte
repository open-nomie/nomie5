<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { get } from "svelte/store";

  export let size = "md";
  // export let color = undefined;
  export let bold: boolean = false;
  export let center: boolean = false;
  export let className: string = "";
  export let color = "";
  export let faded: boolean = false;
  export let inline: boolean = false;
  export let lineHeightMd: boolean = false;
  export let medium: boolean = false;
  export let style = "";
  export let tag = "div";
  export let truncate: boolean = false;
  export let truncate2: boolean = false;
  export let truncate3: boolean = false;
  export let underline: boolean = false;
  export let leading1: boolean = false;
  export let leading2: boolean = false;
  export let leading3: boolean = false;

  const dispatch = createEventDispatcher();
</script>

<style type="text/scss">
  .n-text {
    color: var(--color-inverse);
    line-height: 116%;
    white-space: normal;
    line-height: 125%;

    &.line-height-md {
      line-height: 140%;
    }

    &.leading1 {
      line-height: 1.25em;
    }
    &.leading2 {
      line-height: 1.5em;
    }
    &.leading3 {
      line-height: 1.8em;
    }

    &.xxs {
      font-size: 0.6em;
    }
    &.xs {
      font-size: 0.7em;
    }
    &.sm {
      font-size: 0.85em;
    }
    &.md {
      font-size: 1em;
    }
    &.lg {
      font-size: 1.15em;
    }

    &.faded {
      opacity: 0.6;
    }
    &.xl {
      font-size: 1.3em;
    }
    &.xxl {
      font-size: 1.6em;
    }
    &.font-weight-bold {
      font-weight: bold;
    }
    &.font-weight-medium {
      font-weight: 500;
    }
  }
</style>

{#if tag === 'span' || inline}
  <span
    {style}
    on:click={() => {
      dispatch('click');
    }}
    class="n-text {` ${leading1 ? 'leading1' : ''} ${leading2 ? 'leading2' : ''} ${leading3 ? 'leading3' : ''} ${size || 'sm'} ${className} text-${color} ${truncate ? 'truncate' : ''} ${truncate2 ? 'truncate-2' : ''} ${truncate3 ? 'truncate-3' : ''} ${lineHeightMd ? 'line-height-md' : ''} ${center ? 'text-center' : ''} ${underline ? 'text-underline' : ''} ${faded ? 'faded ' : ''} ${bold ? 'font-weight-bold ' : ''} ${medium ? 'font-weight-medium ' : ''}`.trim()}">
    <slot />
  </span>
{:else}
  <div
    {style}
    on:click={() => {
      dispatch('click');
    }}
    class="n-text {` ${leading1 ? 'leading1' : ''} ${leading2 ? 'leading2' : ''} ${leading3 ? 'leading3' : ''} ${size || 'sm'} ${className} text-${color} ${truncate ? 'truncate' : ''} ${truncate2 ? 'truncate-2' : ''} ${truncate3 ? 'truncate-3' : ''} ${lineHeightMd ? 'line-height-md' : ''} ${center ? 'text-center' : ''} ${underline ? 'text-underline' : ''} ${faded ? 'faded ' : ''} ${bold ? 'font-weight-bold ' : ''} ${medium ? 'font-weight-medium ' : ''}`.trim()}">
    <slot />
  </div>
{/if}
