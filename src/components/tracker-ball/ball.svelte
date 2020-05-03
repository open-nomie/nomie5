<script>
  import Dymoji from "../dymoji/dymoji.svelte";

  export let avatar = null;
  export let emoji = null;
  export let username = null;
  export let size = 102;
  export let color = "#000";
  export let className = "";
  export let style = "";
  export let radius = 0;
</script>

<style lang="scss">
  @import "../../scss/utils/__utils.scss";

  $size: $trackerBallSize;

  .avatar {
    background-size: cover;
    background-position: center;
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
      white-space: pre;
      color: rgba(0, 0, 0, 1);
    }
  }
  .letter.just-letter {
    // font-size: $size * 0.4 !important;
    color: #fff !important;
    text-shadow: 0px 2px 3px rgba(0, 0, 0, 0.3);
  }

  .dymoji-wrapper {
    position: absolute !important;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
  }
  .n-ball {
    position: relative;
    display: inline-block;
    &.frame {
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.16);
      border-radius: 32%;
      overflow: hidden;
    }
  }
</style>

<div
  class="n-ball {className}"
  style="width:{size}px; height:{size}px; {radius ? `border-radius:${size * radius}px; overflow:hidden;` : ''}
  {style}">
  {#if avatar}
    <div
      class=" avatar"
      style="background-image:url({avatar}); width:{size}px; height:{size}px" />
  {:else if emoji}
    <div
      class=" letter emoji-letter"
      style="font-size: {size * 0.5}px; width:{size}px; height:{size}px; {color ? `color:${color}` : ''}
      ">
      {emoji}
    </div>
  {:else if username}
    <div class="dymoji-wrapper">
      <div
        class="letter just-letter"
        style="font-size: {size * 0.5}px; {color ? `color:${color}` : ''}">
        {username.substr(0, 2).toUpperCase()}
      </div>
      <Dymoji {username} {size} radius={0.32} />
    </div>
  {/if}
</div>
