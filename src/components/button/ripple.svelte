<script lang="ts">
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { backOut } from "svelte/easing";

  class Hit {
    x: number;
    y: number;
    id: number;
    constructor(hit: Array<number>) {
      this.x = hit[0];
      this.y = hit[1];
      this.id = Math.random();
    }
  }

  export let hit: Array<number> = undefined;

  let lastHit;
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
