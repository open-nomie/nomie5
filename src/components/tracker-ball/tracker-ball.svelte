<script>
  import Dymoji from "../dymoji/dymoji.svelte";
  import { createEventDispatcher } from "svelte";
  import dayjs from "dayjs";
  const dispatch = createEventDispatcher();
  export let username = "Unknown";
  export let score = 0;
  // export let count = 0;
  export let last = null;
  export let emoji = null;
  export let note = null;
  export let className = "";
  export let showCharacter = true;
  export let id = "";
  export let positivity = 0;
  export let color = null;

  let isToday = false;
  $: if (last) {
    if (new Date(last).toDateString() == new Date().toDateString()) {
      isToday = true;
    }
  }
</script>

<style lang="scss">
  @import "../../scss/utils/__utils.scss";

  $size: $trackerBallSize;

  .tracker-ball {
    margin: 0 4px;
    transition: all 0.2s ease-in-out;
    display: inline-flex;
    width: $size + 4px;
    min-width: $size + 4px;
    flex-grow: 0;
    flex-shrink: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 12px 8px;
    overflow: hidden;
    .avatar {
      position: relative;
      width: $size;
      height: $size;
      border-radius: $size * 0.34;
      border: solid 3px var(--color-solid);
      background-color: var(--color-solid);
      overflow: hidden;
      box-shadow: var(--box-shadow-float);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .score.negative {
      background-color: var(--color-red);
      box-shadow: 0px 10px 10px -5px rgba($red, 0.4) !important;
    }
    .score.positive {
      background-color: var(--color-green);
      box-shadow: 0px 10px 10px -5px rgba($green, 0.4) !important;
    }
    .score {
      $scoreSize: $size * 0.25;
      position: absolute;
      top: 8px;
      left: 4px;
      height: $scoreSize;
      min-width: $scoreSize;
      border-radius: $scoreSize * 0.5;
      padding: 0 6px;
      line-height: $scoreSize;
      text-align: center;
      font-size: $scoreSize * 0.5;
      background-color: var(--color-primary-bright);
      box-shadow: 0px 10px 10px -5px rgba($primaryBright, 0.4);
      font-weight: bold;
      color: #fff;
      z-index: 100;
      &.negative {
        background-color: var(--color-red);
      }
      &.up {
        &.hidden {
          opacity: 0;
          transform: translateY(20px) translateX(20px);
        }
      }
    }
    .username {
      font-weight: 500;
      width: 100%;
      text-align: center;
      text-overflow: ellipsis;
      overflow: hidden;
      color: var(--color-inverse);
      margin-top: 10px;
    }
    &:active {
      transform: scale(0.9);
      .avatar {
        box-shadow: var(--box-shadow-tight);
      }
    }
    .last.today {
      color: var(--color-green);
    }

    .letter {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      z-index: 102;
      font-size: $size * 0.5;
      // text-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
      color: rgba(0, 0, 0, 0.8);
      text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.5);
      &.emoji-letter {
        color: rgba(0, 0, 0, 1);
      }
    }
  }
  :global(.letter.just-letter) {
    font-size: $size * 0.4 !important;
  }
</style>

<div
  {id}
  class={`tracker-ball ${className}`}
  on:click={() => {
    dispatch('click', username);
  }}>
  <div
    class={`score animate up ${positivity < 0 ? 'negative' : ''} ${positivity > 0 ? 'positive' : ''} ${score ? 'visible' : 'hidden'}`}>
    {score}
  </div>
  <div class="avatar">
    <slot />
    <div
      class={`letter ${emoji ? 'emoji-letter' : 'just-letter'}`}
      style={color ? `color:${color}` : ''}>
      {#if emoji}{emoji}{:else}{username.substr(0, 2).toUpperCase()}{/if}
    </div>
    {#if showCharacter}
      <Dymoji {username} size={106} {emoji} />
    {/if}
  </div>
  <div class="username text-inverse-2 text-sm truncate-1">{username}</div>
  {#if note}
    <div class="last text-xs text-faded-3">{note}</div>
  {:else if last}
    <div class={`last text-xs text-faded-3 ${isToday ? 'today' : ''}`}>
      {dayjs(last).fromNow()}
    </div>
  {:else if note !== false}
    <div class="last text-xs text-faded-3" />
  {/if}
</div>
