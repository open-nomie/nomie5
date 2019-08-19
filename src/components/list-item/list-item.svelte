<script>
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

  const has_left = (arguments[1].$$slots || {}).hasOwnProperty("left");
  const has_right = (arguments[1].$$slots || {}).hasOwnProperty("right");
  const has_icon = (arguments[1].$$slots || {}).hasOwnProperty("icon");

  const dispatch = createEventDispatcher();

  const methods = {
    clicked(event) {
      if (this.href) {
        // event.preventDefault();
        window.location.href = this.href;
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

<style lang="scss">
  @import "../../scss/utils/_utils.scss";

  :global(.n-item .right .btn) {
    margin-right: -10px !important;
  }
  .n-item {
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: stretch;
    padding: 0px 16px;
    min-height: 50px;
    position: relative;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    color: var(--color-inverse);
    font-size: 1rem;

    background-color: var(--color-solid);

    select,
    input {
      margin: 6px 0;
    }

    &.item-divider {
      background-color: var(--color-solid);
    }
    &.large {
      min-height: 56px;
    }

    &.compact {
      min-height: 20px;
    }

    &.border,
    &[border] {
      border: none !important;
      box-shadow: 0px 3px 4px -2px rgba(0, 0, 0, 0.03);
      background-color: var(--color-solid);
      border-radius: 0.9rem;
      overflow: hidden;
      max-width: 95vw;
    }

    &.border-bottom,
    &[border-bottom] {
      border-bottom: solid 1px rgba(0, 0, 0, 0.1);
    }

    .left {
      padding-right: 16px;
    }
    .right {
      padding-left: 16px;
      text-align: right;
    }
    .left,
    .right {
      flex-grow: 0;
      flex-shrink: 0;
      color: var(--color-inverse-2);
      font-size: 0.9rem;
      .icon {
        $iconSize: 50px;
        height: $iconSize;
        width: $iconSize;
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: $iconSize * 0.5;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .main {
      overflow: hidden;
      flex-grow: 1;
      flex-shrink: 1;
      h4 {
        font-size: 1.14rem;
        margin: 2px 0;
        line-height: 1.56rem;
      }
      p {
        margin: 2px 0;
        color: var(--color-inverse-3);
        line-height: 140%;
        font-size: 0.98rem;
        &.sm,
        &.small {
          font-size: 0.8rem;
        }
      }
    }
  }
</style>

<div
  {id}
  on:click={methods.clicked}
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
      <p>{description}</p>
    {/if}
    <slot />
  </div>

  {#if has_right}
    <div class="right">
      <slot name="right" />
    </div>
  {/if}
</div>
