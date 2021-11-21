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
  let triggerButton;

  let id: string = `ps-${Math.random()}`;

  let x: number;
  let y: string = `60%`;

  function toggle(evt?) {
    y = `${document.getElementById(id).offsetTop}px`;

    if (evt && !showMenu) {
      x = evt.detail.pageX - 240;
    }
    showMenu = !showMenu;
  }
</script>

<style global>
  .positivity-menu-pop {
    position: absolute;
    width: 240px;
    bottom: calc(50px + env(safe-area-inset-bottom));
    z-index: 4000;
  }
  .positivity-emoji-btn {
    margin: 6px;
    text-align: center;
  }
</style>

<div class="positivity-menu-pop animate up" style="left:{x}px; top:{y}; z-index:4000" class:visible={showMenu} class:hidden={!showMenu}>
  <PositivitySelector
    {size}
    {id}
    bind:score
    on:change={() => {
      toggle();
    }} />
</div>

{#if showMenu && closeBackgroundTap}
  <div class="full-screen opacity-0" on:click={toggle} />
{/if}

<Button
  {id}
  bind:this={triggerButton}
  size="sm"
  shape="circle"
  color="transparent"
  className="positivity-emoji-btn {className}"
  on:mouseover={toggle}
  on:click={toggle}>
  {#if selected && selected.emoji}{selected.emoji}{/if}
</Button>
