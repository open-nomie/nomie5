<script>
  import Dymoji from "./dymoji";

  export let username = "?";
  export let size = 42;
  export let radius = 0.12;
  export let emoji = null;

  let svg = null;

  $: if (username) {
    svg = new Dymoji(username, {
      size,
      radius
    }).svg();
  } else {
    svg = new Dymoji("unknown", {
      size,
      radius
    }).svg();
  }
</script>

<style lang="scss">
  bc-dymoji {
    display: flex;
  }
  .dymoji-wrap {
    display: inline-block;
    vertical-align: middle;
    position: relative;
    .letter {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 10%;
      left: 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      // text-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
      color: rgba(0, 0, 0, 0.8);
      text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.5);
      &.emoji-letter {
        color: rgba(0, 0, 0, 1);
      }
    }
  }
</style>

<div class="dymoji-wrap">
  {@html svg}
  <div
    class={`letter ${emoji ? 'emoji-letter' : 'just-letter'}`}
    style={`font-size:${size * 0.6}px`}>
    {#if emoji}{emoji}{:else}{username.substr(0, 1).toUpperCase()}{/if}
  </div>
</div>
