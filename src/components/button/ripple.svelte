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

  $: if (hits.length > 2) {
    hits = hits.splice(3);
  }

  $: if (hit && hit.length == 2) {
    hits.unshift(new Hit(hit));
    if (hits.length > 5) {
      hits.slice(0, 5);
    }
    hits = hits;
  }
</script>

<style lang="scss">
  .ripple {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    overflow: hidden;
  }
  .ball {
    transition: all 0.5s ease-in-out;
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background-color: var(--color-translucent-inverse);
    top: 5px;
    left: 20px;
    opacity: 0.3;
  }
  .ball.grow {
    animation: ripple 1s;
  }

  @keyframes ripple {
    0% {
      width: 2px;
      height: 2px;
      opacity: 0.4;
    }
    100% {
      transform: scale(100);
      opacity: 0;
    }
  }
</style>

<div class="ripple">
  {#each hits as _hit (`${_hit.id}`)}
    <div class="ball grow" style="top:{_hit.y}px;left:{_hit.x}px;" />
  {/each}
</div>
