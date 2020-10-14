<script lang="ts">
  import { getEmojiFromScore } from "../../utils/positivity/positivity";
  import type { IPositivityEmoji } from "../../utils/positivity/positivity";

  import Button from "../button/button.svelte";
  import PositivitySelector from "./positivity-selector.svelte";
  export let score = 0;
  export let closeBackgroundTap: boolean = false;
  export let className = "";
  export let size = "lg";

  let selected: any;
  let showMenu: boolean = false;
  $: selected = getEmojiFromScore(score);

  let x: number;

  function toggle(evt?) {
    if (evt && !showMenu) {
      x = evt.detail.pageX - 240;
    }
    showMenu = !showMenu;
  }
</script>

<style>
  .positivity-menu-pop {
    position: absolute;
    width: 240px;
    bottom: calc(50px + env(safe-area-inset-bottom));
    z-index: 3000;
  }
  :global(.positivity-emoji-btn) {
    margin: 6px;
    text-align: center;
  }
</style>

<div class="positivity-menu-pop animate up" style="left:{x}px; z-index:2020" class:visible={showMenu} class:hidden={!showMenu}>
  <PositivitySelector
    {size}
    bind:score
    on:change={() => {
      toggle();
    }} />
</div>

{#if showMenu && closeBackgroundTap}
  <div class="full-screen opacity-0" on:click={toggle} />
{/if}

<Button size="sm" shape="circle" color="transparent" className="positivity-emoji-btn {className}" on:mouseover={toggle} on:click={toggle}>
  {#if selected && selected.emoji}{selected.emoji}{/if}
</Button>
