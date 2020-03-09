<script>
  import Dymoji from "../dymoji/dymoji.svelte";
  import { createEventDispatcher } from "svelte";
  import dayjs from "dayjs";
  const dispatch = createEventDispatcher();
  export let username = "Unknown";
  export let score = 0;
  export let count = 0;
  export let last = null;
  export let emoji = null;
  export let note = null;
  export let className = "";
  export let showCharacter = true;
  export let id = "";

  let isToday = false;
  $: if (last) {
    if (new Date(last).toDateString() == new Date().toDateString()) {
      isToday = true;
    }
  }
</script>

<style lang="scss">
  @import "../../scss/utils/__utils.scss";

  $size: 90px;

  .tracker-ball {
    transition: all 0.2s ease-in-out;
    display: inline-flex;
    width: 100px;
    min-width: 100px;
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
    &.negative {
      .score {
        background-color: var(--color-red);
      }
    }
    .score {
      position: absolute;
      top: 9px;
      left: 9px;
      height: 16px;
      min-width: 16px;
      border-radius: 8px;
      padding: 0 4px;
      line-height: 16px;
      text-align: center;
      font-size: 12px;
      background-color: var(--color-green);
      font-weight: bold;
      color: #fff;
      z-index: 100;
      &.negative {
        background-color: var(--color-red);
      }
    }
    .username {
      font-weight: 500;
      //   white-space: nowrap;
      margin-top: 6px;
      width: 100%;
      text-align: center;
      text-overflow: ellipsis;
      overflow: hidden;
      color: var(--color-inverse);
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
      // text-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
      color: rgba(0, 0, 0, 0.8);
      text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.5);
      &.emoji-letter {
        color: rgba(0, 0, 0, 1);
      }
    }
  }
</style>

<div
  {id}
  class={`tracker-ball ${className}`}
  on:click={() => {
    dispatch('click', username);
  }}>
  {#if score}
    <div class={`score ${score < 0 ? 'negative' : 'positive'}`}>{score}</div>
  {/if}
  <div class="avatar">
    <slot />
    <div
      class={`letter ${emoji ? 'emoji-letter' : 'just-letter'}`}
      style={`font-size:${66 * 0.6}px`}>
      {#if emoji}{emoji}{:else}{username.substr(0, 1).toUpperCase()}{/if}
    </div>
    {#if showCharacter}
      <Dymoji {username} size={86} {emoji} />
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
    <div class="last text-xs text-faded-3">Unknown</div>
  {/if}
</div>
