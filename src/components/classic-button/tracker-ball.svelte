<script>
  import { createEventDispatcher } from "svelte";
  import ScorePill from "./score-pill.svelte";
  import { UserStore } from "../../store/user-store";
  import dayjs from "dayjs";
  import Ball from "./ball.svelte";
  import Text from "../text/text.svelte";
  const dispatch = createEventDispatcher();

  export let id = undefined;
  export let score = undefined;
  export let positivity = undefined;
  export let note = undefined;
  export let className = "";
  export let tracker = null;
  // export let small = true;
</script>

{#if tracker}

  <button
    {id}
    class={`item-ball ${className} ${$UserStore.localSettings.compactButtons == true ? 'item-ball-small' : ''}`}
    on:click={() => {
      dispatch('click', tracker);
    }}>
    <!-- -->
    <div class="avatar-ball">
      <slot />
      <ScorePill {positivity} {score} />
      <Ball
        username={tracker.label}
        emoji={tracker.emoji}
        color={tracker.color}
        size={$UserStore.localSettings.compactButtons ? 80 : 102} />
    </div>

    <Text className="ball-label truncate-2">{tracker.label}</Text>
    {#if note}
      <div class="last text-xs text-faded-3">{note}</div>
    {/if}
  </button>

  <!-- <ItemBall
    {id}
    {className}
    label={tracker.label}
    emoji={tracker.emoji}
    small={$UserStore.localSettings.compactButtons == true}
    {note}
    color={tracker.color}
    on:click={() => {
      dispatch('click', tracker);
    }}>
    <ScorePill {positivity} {score} />
    <slot />
  </ItemBall> -->
{/if}
