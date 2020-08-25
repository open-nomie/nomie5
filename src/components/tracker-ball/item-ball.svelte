<script>
  import Dymoji from "../dymoji/dymoji.svelte";
  import { createEventDispatcher } from "svelte";
  import dayjs from "dayjs";
  import NBall from "./ball.svelte";
  import Text from "../text/text.svelte";

  const dispatch = createEventDispatcher();

  // export let score = 0;
  // export let last = null;

  export let avatar = null;
  export let emoji = null;
  export let username = null;
  export let small = false;
  export let label = null;
  export let color = "#333";
  export let note = null;
  export let className = "";

  export let id = "";
</script>

<style lang="scss">
  // Moved to scss/components/item-ball
  // :global(.item-ball .n-ball) {
  //   position: absolute;
  //   top: 0;
  //   right: 0;
  //   left: 0;
  //   bottom: 0;
  //   overflow: hidden;
  // }
</style>

<button
  {id}
  class={`item-ball ${className} ${small ? 'item-ball-small' : ''}`}
  on:click={() => {
    dispatch('click', this);
  }}>
  <!-- -->
  <div class="avatar-ball">
    <slot />
    <NBall {username} {emoji} {avatar} {color} size={small ? 80 : 102} />
  </div>

  <Text className="ball-label truncate-2">{label}</Text>
  {#if note}
    <div class="last text-xs text-faded-3">{note}</div>
  {/if}
</button>
