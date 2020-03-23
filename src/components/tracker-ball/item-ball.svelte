<script>
  import Dymoji from "../dymoji/dymoji.svelte";
  import { createEventDispatcher } from "svelte";
  import dayjs from "dayjs";

  const dispatch = createEventDispatcher();

  export let score = 0;
  export let last = null;

  export let avatar = null;
  export let emoji = null;
  export let username = null;

  export let label = null;
  export let color = "#333";
  export let note = null;
  export let className = "";

  export let id = "";
</script>

<style lang="scss">
  // Moved to scss/components/item-ball
</style>

<div
  {id}
  class={`item-ball ${className}`}
  on:click={() => {
    dispatch('click', this);
  }}>
  <!-- -->
  <div class="avatar-ball">
    <slot />
    {#if emoji}
      <div class="letter emoji-letter" style={color ? `color:${color}` : ''}>
        {emoji}
      </div>
    {:else if avatar}
      <div class="avatar" style="background-image:url({avatar});" />
    {:else if username}
      <div class="letter just-letter" style={color ? `color:${color}` : ''}>
        {username.substr(0, 2).toUpperCase()}
      </div>
      <Dymoji {username} size={106} />
    {/if}
  </div>

  <div class="username text-inverse-2 text-sm truncate-1">{label}</div>
  {#if note}
    <div class="last text-xs text-faded-3">{note}</div>
  {/if}
</div>
