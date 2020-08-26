<script lang="ts">
  import { navigate, Link } from "svelte-routing";
  import NText from "../text/text.svelte";
  import { createEventDispatcher } from "svelte";
  import Ripple from "../button/ripple.svelte";
  import Hit from "../button/ripple-hit";
  import tick from "../../utils/tick/tick";

  export let title = undefined;
  export let description = undefined;
  // export let borderBottom = false;

  export let href = undefined;
  export let to = undefined;
  export let id = null;
  export let className = "";
  export let itemDivider = undefined;
  export let compact: boolean = false;
  export let truncate: boolean = false;
  export let style = "";
  export let clickable: boolean = false;
  export let ariaLabel = "";
  export let solo: boolean = false;
  export let bottomLine: boolean = false;
  export let topLine: boolean = false;
  export let delay: number = undefined;

  const has_left = (arguments[1].$$slots || {}).hasOwnProperty("left");
  const has_right = (arguments[1].$$slots || {}).hasOwnProperty("right");
  const has_icon = (arguments[1].$$slots || {}).hasOwnProperty("icon");

  const dispatch = createEventDispatcher();

  let hit: Array<number>;

  const methods = {
    async tap(event) {
      // let timeout = 200;
      // if (delay !== undefined) {
      //   timeout = delay;
      // } else if (!clickable) {
      //   timeout = 0;
      // }
      // await tick(timeout);
      if (href) {
        window.location.href = href;
      } else if (to) {
        navigate(to);
      }
      dispatch("click", {});
      dispatch("tap", {});
    },
    doubletap(evt) {
      dispatch("dbltap", evt);
    },
    longtap(evt) {
      dispatch("longtap", evt);
    },
    getHref() {
      return this.href || this.to || null;
    },
    getStyle() {
      if (this.getHref) {
        return {
          cursor: "pointer",
        };
      } else {
        return {};
      }
    },
  };
</script>

{#if clickable}
  <button
    {id}
    aria-label={ariaLabel}
    on:tap={methods.tap}
    on:dbltap={methods.doubletap}
    on:longtap={methods.longtap}
    on:mousedown={(evt) => {
      hit = [evt.offsetX, evt.offsetY];
    }}
    on:contextmenu={(evt) => {
      dispatch('contextmenu', evt);
      return false;
    }}
    item-divider={itemDivider}
    {style}
    class="n-item {compact ? 'compact' : ''}
    {className}
    {bottomLine ? 'bottom-line' : ''}"
    :alt="title">
    {#if has_left}
      <div class="left">
        <slot name="left" />
      </div>
    {/if}
    <div class="main {truncate ? 'truncate' : ''}">
      {#if title}
        <NText size="md" tag="div" medium>{title}</NText>
      {/if}
      {#if description}
        <NText size="sm" lineHeightMd className="mt-1" faded>{description}</NText>
      {/if}
      <slot />
    </div>

    {#if has_right}
      <div class="right">
        <slot name="right" />
      </div>
    {/if}
    {#if clickable}
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
      dispatch('contextmenu', evt);
      return false;
    }}
    item-divider={itemDivider}
    {style}
    class="n-item {compact ? 'compact' : ''}
    {className}
    {bottomLine ? 'bottom-line' : ''}
    {topLine ? 'top-line' : ''}
    {solo ? 'solo' : ''}
    "
    :alt="title">
    {#if has_left}
      <div class="left">
        <slot name="left" />
      </div>
    {/if}
    <div class="main {truncate ? 'truncate' : ''}">
      {#if title}
        <NText size="md" tag="div" className="title" medium>{title}</NText>
      {/if}
      {#if description}
        <NText size="sm" lineHeightMd className="mt-1" faded>{description}</NText>
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
