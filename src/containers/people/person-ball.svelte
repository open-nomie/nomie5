<script>
  import Dymoji from "../../components/dymoji/dymoji.svelte";
  import { createEventDispatcher } from "svelte";
  import dayjs from "dayjs";
  const dispatch = createEventDispatcher();
  export let username = "Unknown";
  export let score = 0;
  export let count = 0;
  export let last = null;
  export let emoji = null;
  export let note = null;
</script>

<style lang="scss">
  @import "../../scss/utils/__utils.scss";
  .player-ball {
    transition: all 0.2s ease-in-out;
    display: inline-flex;
    width: 100px;
    flex-grow: 0;
    flex-shrink: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 12px 8px;
    overflow: hidden;
    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 30px;
      border: solid 3px var(--color-solid);
      overflow: hidden;
      box-shadow: var(--box-shadow-float);
    }
    .score {
      position: absolute;
      top: 16px;
      left: 16px;
      height: 16px;
      min-width: 12px;
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
      margin-top: 6px;
      width: 100%;
      text-align: center;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    &:active {
      transform: scale(0.9);
      .avatar {
        box-shadow: var(--box-shadow-tight);
      }
    }
  }
</style>

<div
  class="player-ball"
  on:click={() => {
    dispatch('click', username);
  }}>
  {#if score}
    <div class={`score ${score < 0 ? 'negative' : 'positive'}`}>{score}</div>
  {/if}
  <div class="avatar">
    <Dymoji {username} size={66} {emoji} />
  </div>
  <div class="username text-inverse-2 text-sm truncate-1">{username}</div>
  {#if note}
    <div class="last text-xs text-faded-3">{note}</div>
  {:else if last}
    <div class="last text-xs text-faded-3">{dayjs(last).fromNow()}</div>
  {:else}
    <div class="last text-xs text-faded-3">Unknown</div>
  {/if}
</div>
