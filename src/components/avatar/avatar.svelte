<script lang="ts">
  import type { join } from "lodash";
  import { createEventDispatcher } from "svelte";
  import { initials } from "../../utils/text/text";
  import { strToColor } from "../dymoji/dymoji";
  import emojiCount from "../../modules/emoji-count/emoji-count";

  // export let size: "xs" | "sm" | "md" | "lg" | "xl" = "md";
  export let size: number = 32;
  export let label: string = undefined;
  export let src: string = undefined;
  export let emoji: string = undefined;
  export let transparent: boolean = false;
  export let style: string = "";
  export let color: string = "transparent";
  export let circle: boolean = false;
  export let className: string = "";

  const dispatch = createEventDispatcher();

  let styles: Array<string> = [];
  let classList: Array<string> = [];
  $: {
    classList = [className];
    styles.push(`--avatar-size:${size}px`);
    styles.push(`height:${size}px`);
    if (!emoji) {
      styles.push(`width:${size}px`);
    }
    // If it's a source
    if (src && src.length) {
      classList.push("src");
      styles.push(`background-image:url(${src})`);

      /// If it's an emoji
    } else if (emoji && emoji.length) {
      classList.push("emoji");
      styles.push(`background-color:${color}`);

      // If a Label is provided
    } else if (label && label.length) {
      classList.push("label");
      color = strToColor(label);
      styles.push(`background-color:${color}`);
      styles.push(`font-size: ${size * 0.5}px`);
    }
    // If Transparent
    if (transparent) {
      classList.push("transparent");
    }

    // If is Circle
    if (circle) {
      classList.push("circle");
    } else {
      classList.push("rounded");
    }
    // Merge with props styl
  }

  function click() {
    dispatch("click");
  }
</script>

<style>
  .n-avatar {
    /* box-shadow: var(--box-shadow-tight); */
    display: inline-flex;
    flex-grow: 0;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
    overflow: hidden;
    letter-spacing: normal;
    color: var(--color-inverse);
  }

  .n-avatar.rounded {
    border-radius: 32% !important;
    width: var(--avatar-size);
    height: var(--avatar-size);
  }

  .n-avatar.circle {
    border-radius: 50% !important;
    width: var(--avatar-size);
    height: var(--avatar-size);
  }
  .n-avatar.label {
    color: #fff;
    text-shadow: 0px 2px 3px rgba(0, 0, 0, 0.1);
    font-size: calc(var(--avatar-size) * 0.55);
    font-weight: bold;
  }
  .n-avatar.emoji {
    font-size: calc(var(--avatar-size) * 0.9);
    box-shadow: none;
    white-space: nowrap;
    overflow: visible;
  }
  .n-avatar.src {
    color: transparent;
  }
  .n-avatar.emolen-0 {
    letter-spacing: -0.05em;
    font-size: calc(var(--avatar-size) * 0.75);
    font-weight: 500;
  }
  .n-avatar.emolen-2 {
    letter-spacing: -0.4em;
    text-indent: -0.4em;
  }
  .n-avatar.emolen-3 {
    letter-spacing: -0.4em;
    text-indent: -0.42em;
    font-size: calc(var(--avatar-size) * 0.6);
  }
</style>

<div
  class="n-avatar {emoji ? `emolen-${emojiCount(emoji)}` : 'no-emoji'}
  {size}
  {classList.join(' ')}"
  style={`${styles.join('; ')}; ${style}`}
  on:click|preventDefault={click}>
  {#if emoji}{emoji}{:else if label}{initials(label)}{/if}
</div>
