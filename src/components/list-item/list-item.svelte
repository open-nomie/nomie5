<script>
  import { navigate, Link } from "svelte-routing";
  import NText from "../text/text.svelte";
  import { createEventDispatcher } from "svelte";
  export let title = undefined;
  export let description = undefined;
  export let borderBottom = false;
  export let icon = undefined;
  export let href = undefined;
  export let to = undefined;
  export let click = undefined;
  export let id = null;
  export let className = "";
  export let itemDivider = undefined;

  const has_left = (arguments[1].$$slots || {}).hasOwnProperty("left");
  const has_right = (arguments[1].$$slots || {}).hasOwnProperty("right");
  const has_icon = (arguments[1].$$slots || {}).hasOwnProperty("icon");

  const dispatch = createEventDispatcher();

  const methods = {
    clicked(event) {
      if (href) {
        // event.preventDefault();
        window.location.href = href;
      } else if (to) {
        navigate(to);
      } else {
        // this.$emit("click", this.$props);
      }
      dispatch("click", {});
    },
    getHref() {
      return this.href || this.to || null;
    },
    getStyle() {
      if (this.getHref) {
        return {
          cursor: "pointer"
        };
      } else {
        return {};
      }
    }
  };
</script>

<div
  {id}
  on:click={methods.clicked}
  item-divider={itemDivider}
  class="n-item {borderBottom ? 'border-bottom' : 'no-border'}
  {className}"
  :alt="title">
  {#if has_left}
    <div class="left">
      <slot name="left" />
    </div>
  {/if}
  <div class="main">
    {#if title}
      <NText size="md" medium>{title}</NText>
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
