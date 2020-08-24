<script>
  // Based on https://svelte.dev/repl/dbf681d6ba014f1d9cfc919f1bc59481?version=3.19.2

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import Ripple from "./Ripple.svelte";
  import { writable } from "svelte/store";

  export let rippleBlur = 2,
    speed = 500,
    fontSize = "1rem",
    bgColor = "93, 120, 255",
    bgHover = bgColor,
    bgActive = bgColor,
    rippleColor = "#264169",
    round = "0.5rem",
    height = 60,
    width = 250,
    sizeIn = 20,
    opacityIn = 0.2;

  export let size = "md";
  export let type = "solid";
  export let shape = "rounded";
  export let color = "primary";
  export let className = "";
  export let block = false;
  export let style = "";
  export let disabled = false;

  let shadows = {
      none: "none",
      1: "0 0 0 1px rgba(0, 0, 0, 0.05)",
      2: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      3: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      4: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      5: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      6: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      7: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },
    mouseX,
    mouseY;

  function handleRipple() {
    const ripples = writable([]);

    return {
      subscribe: ripples.subscribe,

      add: (item) => {
        ripples.update((items) => {
          return [...items, item];
        });
      },
      clear: () => {
        ripples.update((items) => {
          return [];
        });
      },
    };
  }

  export const ripples = handleRipple();
  let rect, rippleBtn, w, h, x, y, offsetX, offsetY, deltaX, deltaY, locationY, locationX, scale_ratio, timer;
  let coords = { x: 50, y: 50 };

  $: (offsetX = Math.abs(w / 2 - coords.x)),
    (offsetY = Math.abs(h / 2 - coords.y)),
    (deltaX = w / 2 + offsetX),
    (deltaY = h / 2 + offsetY),
    (scale_ratio = Math.sqrt(Math.pow(deltaX, 2.2) + Math.pow(deltaY, 2.2)));

  const debounce = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      ripples.clear();
    }, speed + speed * 2);
  };

  let touch;

  function handleClick(e, type) {
    if (type == "touch") {
      touch = true;
      ripples.add({ x: e.pageX - locationX, y: e.pageY - locationY, size: scale_ratio });
    } else {
      if (!touch) {
        ripples.add({ x: e.clientX - locationX, y: e.clientY - locationY, size: scale_ratio });
      }
      touch = false;
    }
    debounce();
  }

  onMount(() => {
    w = rippleBtn.offsetWidth;
    h = rippleBtn.offsetHeight;
    rect = rippleBtn.getBoundingClientRect();
    locationY = rect.y;
    locationX = rect.x;
  });
</script>

<style>
  svg {
    height: 100%;
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
  }
</style>

<button
  {disabled}
  class={`btn ${block ? 'btn-block' : ''} btn-${type} btn-${shape} btn-${color} btn-${size} ${className}`}
  on:click={() => {
    dispatch('click');
  }}
  style="{bgActive};--radius: {round};--ripple:{rippleColor};"
  bind:this={rippleBtn}
  on:touchstart={(e) => handleClick(e.touches[0], 'touch')}
  on:mousedown={(e) => handleClick(e, 'click')}>
  <slot />
  <svg>
    {#each $ripples as ripple, index}
      <Ripple x={ripple.x} y={ripple.y} size={ripple.size} {speed} {sizeIn} {opacityIn} {rippleBlur} />
    {/each}
  </svg>
</button>

<!-- <button
  {style}
  {disabled}
  class={`btn ${block ? 'btn-block' : ''} btn-${type} btn-${shape} btn-${color} btn-${size} ${className} clickable`}
  on:click={() => {
    dispatch('click');
  }}>
  <slot />
</button> -->
