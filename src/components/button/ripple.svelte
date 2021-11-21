<script lang="ts">
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { backOut } from "svelte/easing";
  import Hit from "./ripple-hit";

  export let hit: Array<number> = undefined;

  let lastHit: Hit;
  let hideTimeout;
  let show = false;

  let x;
  let y;

  let hits: Array<Hit> = [];

  $: if (hit && hit.length == 2) {
    hits.unshift(new Hit(hit));
    if (hits.length > 3) {
      hits = hits.slice(0, 2);
    }
    hits = hits;
  }
</script>

<style lang="postcss">
  .ripple {
    pointer-events: none;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    overflow: hidden;
    z-index: 1000;
    border-radius: inherit;
  }
  .ball {
    transition: all 0.5s ease-in-out;
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    top: 5px;
    left: 20px;
    opacity: 0;
  }
  .ball.grow {
    animation: ripple 1.5s;
    background-color: var(--color-translucent-inverse);
  }

  @keyframes ripple {
    0% {
      width: 0px;
      height: 0px;
      opacity: 0;
    }
    1% {
      width: 4px;
      height: 4px;
      opacity: 0.2;
    }
    100% {
      width: 150px;
      height: 150px;
      transform: scale(20);
      opacity: 0;
    }
  }
</style>

<div class="ripple">
  {#each hits as _hit (`${_hit.id}`)}
    <div class="ball grow" style="top:{_hit.y}px;left:{_hit.x}px;" />
  {/each}
</div>
