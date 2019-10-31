<script>
  export let pinTop = undefined;
  export let className = "";
</script>

<style lang="scss">
  :global(.n-toolbar) {
    min-height: 50px;
    background-color: var(--color-solid);
    display: flex;
    align-items: center;
    justify-content: stretch;

    padding: 0 16px;

    h1,
    h2,
    h3 {
      font-size: 1rem;
      margin: 0;
    }

    .btn-sm {
      max-height: 40px;
    }
    &.hidden {
      opacity: 0;
      pointer-events: none;
    }

    &.pin-top {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 300;
      background-color: var(--color-solid);
      color: var(--color-inverse);
      min-height: 50px;
      border-bottom: solid 1px rgba(0, 0, 0, 0.1);
      box-shadow: 0px 4px 4px -2px rgba(0, 0, 0, 0.1);
      padding-top: env(safe-area-inset-top);
      &.sub-header {
        top: 49px !important;
      }
    }
    .container {
      padding: 0px 10px;
    }
    [slot="sub-header"] {
      width: 100%;
    }
  }
  .n-toolbar.stretch {
    justify-content: stretch;
  }
  :global(.n-toolbar .btn-clear) {
    border-radius: 0 !important;
    outline: none !important;
    padding: 0 10px;
    font-size: 1rem;
  }
  :global(.n-toolbar .zmdi) {
    font-size: 1.6rem !important;
    &.text-xs {
      font-size: 18px !important;
    }
  }
</style>

<div class="n-toolbar {pinTop ? 'pin-top' : ''} {className}">
  <div class="container n-row px-0">
    <slot />
  </div>
</div>
