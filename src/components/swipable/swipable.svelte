<script>
  import { pan } from "svelte-hammer";
  import _ from "lodash";
  import { createEventDispatcher } from "svelte";

  export let className = "";

  const dispatch = createEventDispatcher();
  let x = 0;
  let dir = undefined;
  let leftTimeout;
  let rightTimeout;
</script>

<style>
  .swipable-wrapper {
    flex-grow: 1;
    overflow-x: hidden;
  }
  .swipable {
    transform: translateX(calc(var(--pan-x) * 1px));
  }
</style>

<div class="swipable-wrapper">
  <div
    class="swipable {className}"
    style="--pan-x:{x};"
    use:pan
    on:panleft={(evt) => {
      let detail = evt.detail;
      if (Math.abs(evt.detail.deltaX) > Math.abs(evt.detail.deltaY)) {
        x = evt.detail.deltaX < -80 ? -80 : evt.detail.deltaX;
        dir = 'left';
      } else {
        x = 0;
      }
    }}
    on:paneup={(evt) => {
      evt.preventDefault();
    }}
    on:pandown={(evt) => {
      evt.preventDefault();
    }}
    on:panright={(evt) => {
      if (Math.abs(evt.detail.deltaX) > Math.abs(evt.detail.deltaY)) {
        x = evt.detail.deltaX > 80 ? 80 : evt.detail.deltaX;
        dir = 'right';
      } else {
        x = 0;
      }
    }}
    on:panend={(evt) => {
      if (Math.abs(evt.detail.deltaX) > 70) {
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
