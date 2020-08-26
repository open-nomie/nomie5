<script lang="ts">
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { backOut } from "svelte/easing";

  export let hit: Array<number>;

  let lastHit;
  let hideTimeout;
  let show = false;

  let x;
  let y;

  $: if (hit && hit.join(",") !== lastHit) {
    show = false;
    console.log("Ripple FIre!");
    lastHit = hit.join(",");
    x = hit[0];
    y = hit[1];
    setTimeout(() => {
      show = true;
    }, 1);
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      show = false;
      setTimeout(() => {
        hit = undefined;
      }, 10);
    }, 1000);
  }
</script>

<style lang="scss">
  .ripple {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
  }
  .ball {
    transition: all 0.5s ease-in-out;
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.4);
    top: 5px;
    left: 20px;
    opacity: 0.7;
  }
  .ball.grow {
    animation: ripple 1s;
  }

  @keyframes ripple {
    0% {
      width: 2px;
      height: 2px;
      opacity: 1;
    }
    100% {
      transform: scale(50);
      opacity: 0;
    }
  }
</style>

<div class="ripple">
  {#if hit}
    <div class="ball" class:grow={show} style="top:{y}px;left:{x}px;" />
  {/if}
</div>

<!-- style="top:{y}px;left:{x}px;" -->
