<script>
  // Svelte
  import { slide } from "svelte/transition";

  // Props
  export let message = "Done";
  export let show = false;
</script>

<style lang="scss" type="text/scss">
  @import "../../scss/utils/_utils";
  .n-toast {
    z-index: 10003;
    position: fixed;
    bottom: 0px;
    height: 140px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    pointer-events: none;
    padding-bottom: env(safe-area-inset-bottom);
    transition: all 0.2s ease-in-out;
    &.hidden {
      transform: translateY(100px) scale(0.8);
      opacity: 0;
    }
    &.visible {
      transform: none;
      opacity: 1;
    }
    .n-toast-panel {
      min-height: 36px;
      max-height: 36px;
      max-width: 600px;
      min-width: 300px;
      border-radius: 6px;
      background-color: $primaryBright;
      color: #fff;
      flex-grow: 0;
      border: solid 1px rgba(0, 0, 0, 0.1);
      box-shadow: 0px 26px 18px rgba(0, 0, 0, 0.2);
      padding: 0 20px;
      display: flex;
      align-items: center;
    }
  }
</style>

<div class="n-toast {show ? 'visible' : 'hidden'}">
  <div class="n-toast-panel">
    <div class="truncate">{message}</div>
  </div>
</div>
