<script>
  import { navigate, Link } from "svelte-routing";
  import NText from "../text/text.svelte";
  import { createEventDispatcher } from "svelte";
  export let title = undefined;
  export let description = undefined;
  // export let borderBottom = false;

  export let href = undefined;
  export let to = undefined;
  export let id = null;
  export let className = "";
  export let itemDivider = undefined;
  export let compact = false;
  export let truncate = false;
  export let style = "";
  export let clickable = false;
  export let ariaLabel = "";
  export let solo = false;
  export let bottomLine = false;

  const has_left = (arguments[1].$$slots || {}).hasOwnProperty("left");
  const has_right = (arguments[1].$$slots || {}).hasOwnProperty("right");
  const has_icon = (arguments[1].$$slots || {}).hasOwnProperty("icon");

  const dispatch = createEventDispatcher();

  const methods = {
    tap(event) {
      if (href) {
        // event.preventDefault();
        window.location.href = href;
      } else if (to) {
        navigate(to);
      } else {
        // this.$emit("click", this.$props);
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
    on:contextmenu={(evt) => {
      dispatch('contextmenu', evt);
      return false;
    }}
    item-divider={itemDivider}
    {style}
    class="n-item {compact ? 'compact' : ''}
    {className}
    {bottomLine ? 'bottom-line' : ''}
    {clickable ? 'clickable' : ''}"
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
        <p class="description">{description}</p>
      {/if}
      <slot />
    </div>

    {#if has_right}
      <div class="right">
        <slot name="right" />
      </div>
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
        <p class="description">{description}</p>
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
