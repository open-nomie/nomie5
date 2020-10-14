<script>
  import Avatar from "../avatar/avatar.svelte";

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
  .n-ball {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
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
    <Avatar {size} src={avatar} />
  {:else if emoji}
    <Avatar {emoji} size={size * 0.5} />
  {:else if username}
    <Avatar label={username} size={size * 0.5} />
  {/if}
</div>
