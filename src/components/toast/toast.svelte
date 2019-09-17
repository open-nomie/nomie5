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
    height: 150px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    .n-toast-panel {
      min-height: 36px;
      max-height: 36px;
      max-width: 300px;
      border-radius: 18px;
      background-color: $primaryBright;
      color: #fff;
      flex-grow: 0;
      border: solid 1px rgba(0, 0, 0, 0.1);
      box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.1);
      padding: 0 20px;
      display: flex;
      align-items: center;
    }
  }
</style>

{#if show}
  <div transition:slide class="n-toast">
    <div class="n-toast-panel">
      <div class="truncate">{message}</div>
    </div>
  </div>
{/if}
