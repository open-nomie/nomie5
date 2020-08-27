<script lang="ts">
  import { getEmojiFromScore } from "../../utils/positivity/positivity";
  import type { IPositivityEmoji } from "../../utils/positivity/positivity";

  import Button from "../button/button.svelte";
  import PositivitySelector from "./positivity-selector.svelte";
  export let score = 0;

  let selected: IPositivityEmoji;
  let showMenu: boolean = false;
  $: selected = getEmojiFromScore(score);

  let x: number;

  function toggle(evt?) {
    if (evt && !showMenu) {
      console.log(evt);
      x = evt.detail.pageX - 240;
    }
    showMenu = !showMenu;
  }
</script>

<style>
  .positivity-menu-pop {
    position: fixed;
    width: 240px;
    bottom: calc(100px + env(safe-area-inset-bottom));
    z-index: 1000;
  }
</style>

<div class="positivity-menu-pop animate up" style="left:{x}px;" class:visible={showMenu} class:hidden={!showMenu}>
  <PositivitySelector
    bind:score
    on:change={() => {
      toggle();
    }} />
</div>

<Button
  size="sm"
  shape="circle"
  color="transparent"
  style="font-size:22px"
  className="positivity-emoji-btn"
  on:mouseover={toggle}
  on:click={toggle}>
  {#if selected}{selected.emoji}{/if}
</Button>
