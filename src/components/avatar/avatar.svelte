<script lang="ts">
  import { initials } from "../../utils/text/text";
  import { strToColor } from "../dymoji/dymoji";

  export let size: "xs" | "sm" | "md" | "lg" | "xl" = "md";
  export let label: string = undefined;
  export let src: string = undefined;
  export let emoji: string = undefined;
  export let transparent: boolean = false;
  export let style: string = "";
  export let color: string = "transparent";
  export let circle: boolean = false;

  let generatedStyle: string = "";
  let classList: Array<string> = [];
  $: {
    classList = [];

    // If it's a source
    if (src && src.length) {
      classList.push("src");
      generatedStyle = `background-image:url(${src});`;

      /// If it's an emoji
    } else if (emoji && emoji.length) {
      classList.push("emoji");

      // If a Label is provided
    } else if (label && label.length) {
      classList.push("label");
      color = strToColor(label);
      generatedStyle = `background-color:${color};`;
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
    // Merge with props style
    generatedStyle = `${generatedStyle} ${style}`;
  }
</script>

<style>
  .n-avatar {
    box-shadow: var(--box-shadow-tight);
    display: inline-flex;
    flex-grow: 0;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
    overflow: hidden;
  }

  .n-avatar.xs {
    --avatar-size: 16px;
  }

  .n-avatar.sm {
    --avatar-size: 26px;
  }

  .n-avatar.md {
    --avatar-size: 42px;
  }

  .n-avatar.lg {
    --avatar-size: 70px;
  }

  .n-avatar.xl {
    --avatar-size: 117px;
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
    font-size: calc(var(--avatar-size) * 0.7);
  }
</style>

<div class="n-avatar {size} {classList.join(' ')}" style={generatedStyle}>
  {#if emoji}{emoji}{/if}
  {#if label}{initials(label)}{/if}
</div>
