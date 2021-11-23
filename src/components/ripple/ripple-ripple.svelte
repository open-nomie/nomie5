<script lang="ts">
  import Hit from "./ripple-hit";

  export let hit: Array<number> = [];
  export let className: string = "";
  // let lastHit: Hit;
  // let hideTimeout: any;
  // let show:boolean = false;

  // let x:number;
  // let y:number;

  let hits: Array<Hit> = [];

  $: if (hit && hit.length == 2) {
    hits.unshift(new Hit(hit));
    if (hits.length > 3) {
      hits = hits.slice(0, 2);
    }
    hits = hits;
  }
</script>

<style global lang="postcss">
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

  .ball.grow {
    transition: all 0.5s ease-in-out;
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    top: 5px;
    left: 20px;
    opacity: 0;
    animation: ripple 1.5s;
    background-color: rgb(155, 155, 155);
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
      opacity: 0.4;
    }
    100% {
      width: 150px;
      height: 150px;
      transform: scale(20);
      opacity: 0;
    }
  }
</style>

<div class="ripple {className}">
  {#each hits as _hit (`${_hit.id}`)}
    <div class="ball grow" style="top:{_hit.y}px;left:{_hit.x}px;" />
  {/each}
</div>
