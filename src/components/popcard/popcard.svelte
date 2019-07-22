<script>
  export let level = 10;
  export let arrow = false;
</script>

<style type="text/scss" lang="scss">
  .n-popcard {
    margin: 10px;
    background-color: var(--color-solid);
    border-radius: 12px;
    color: var(--color-inverse);
    min-height: 70px;
    box-shadow: 0px 4px 13px -6px rgba(0, 0, 0, 0.09);
    border: solid 1px var(--color-faded-1);
    position: relative;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    .point {
      $size: 20px;
      $half: $size * 0.5;
      border-right: solid 1px var(--color-faded-1);
      border-bottom: solid 1px var(--color-faded-1);
      box-shadow: 0px 4px 13px -6px rgba(0, 0, 0, 0.09);
      transform: rotate(45deg);
      background-color: var(--color-solid);
      height: $size;
      width: $size;
      position: absolute;
      left: 50%;
      margin-left: -$half;
      bottom: -$half;
      z-index: 20;
    }
    .content {
      position: relative;
      background-color: var(--color-solid);
      z-index: 30;
      border-radius: 12px;
    }
  }
</style>

<div class="n-popcard" data-age="yes" style="z-index:{level + 20};">
  <div class="content">
    <slot />
  </div>
  {#if arrow}
    <div class="point" />
  {/if}
</div>
