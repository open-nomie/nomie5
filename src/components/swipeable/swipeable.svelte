<script>
  import { pan } from "svelte-hammer";
  import _ from "lodash";
  import { createEventDispatcher } from "svelte";

  export let className = "";
  export let fireDistance = window.innerWidth * 0.2;

  const dispatch = createEventDispatcher();

  let timeout;
  let swipeable;
  let x = 0;
  let dir = undefined;

  function setDirection(direction) {
    dir = direction;
  }

  function swipe(direction, evt) {
    let hammerDetails = evt.detail;
    if (Math.abs(hammerDetails.deltaX) >= Math.abs(hammerDetails.deltaY)) {
      if (direction == "left") {
        x = hammerDetails.deltaX < -fireDistance ? -fireDistance : hammerDetails.deltaX > fireDistance ? 0 : hammerDetails.deltaX;
      } else {
        x = hammerDetails.deltaX > fireDistance ? fireDistance : hammerDetails.deltaX < 0 ? 0 : hammerDetails.deltaX;
      }
      setDirection(direction);
    }
  }

  $: {
    if (swipeable) {
      swipeable.style.transform = `translate3d(${x}px,0,0)`;
      // clearTimeout(timeout);
      // timeout = setTimeout(() => {
      //   if (x !== 0) {
      //     x = 0;

      //   }
      // }, 100);
    }
  }
</script>

<style>
  .swipeable-wrapper {
    flex-grow: 1;
    overflow-x: hidden;
  }
  .swipeable {
    transition: transform 0.1s ease-in-out;
  }
</style>

<div class="swipeable-wrapper">
  <div
    bind:this={swipeable}
    class="swipeable {className}"
    use:pan
    on:panleft={(evt) => {
      swipe('left', evt);
    }}
    on:paneup={(evt) => {
      evt.preventDefault();
    }}
    on:pandown={(evt) => {
      evt.preventDefault();
    }}
    on:panright={(evt) => {
      swipe('right', evt);
    }}
    on:panend={(evt) => {
      if (Math.abs(evt.detail.deltaX) >= fireDistance) {
        if (dir == 'right') {
          dispatch('right');
        } else if (dir == 'left') {
          dispatch('left');
        }
      }
      x = 0;
    }}>
    <slot />
  </div>
</div>
