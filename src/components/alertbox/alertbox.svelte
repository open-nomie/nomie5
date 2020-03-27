<script>
  import NToolbar from "../toolbar/toolbar.svelte";
  import NText from "../text/text.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let title = undefined;
  export let message = undefined;
  export let ok = "Ok";
  export let cancel = undefined;
  export let show = false;
  export let onInteract = null;

  let hasSlot = false;
  let escListener;
  $: if (show) {
    hasSlot = arguments[1].$$slots || {}.default;
    escListener = document.addEventListener("keyup", evt => {
      if (evt.key == "Escape") {
        methods.onCancel();
      }
    });
  } else {
    escListener = document.removeEventListener("keyup", () => {});
  }

  const methods = {
    onOk() {
      show = false;
      if (onInteract) {
        onInteract(true);
        dispatch("close");
      }
    },
    onCancel() {
      show = false;
      if (onInteract) {
        onInteract(false);
        dispatch("close");
      }
    }
  };
</script>

<style lang="scss" type="text/scss">
  :global(.alert-dialog) {
    min-height: 200px;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2200;
    background-color: rgba(0, 0, 0, 0.88);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.5s ease-in-out;
    &.visible {
      opacity: 1;
      .card {
      }
    }
    &.hidden {
      pointer-events: none;
      opacity: 0;
      .card {
        opacity: 0;
        transform: scaleY(0.1) scaleX(0.1);
      }
    }
    .card {
      border-radius: 1.2rem;
      transition: all 0.2s ease-in-out;
      max-width: 400px;
      max-height: 80vh;
      min-height: 100px;
      width: 200px;
      min-width: 300px !important;
      flex-grow: 1;
      background-color: var(--color-solid);
      border: solid 1px var(--color-faded-1);
      box-shadow: var(--box-shadow);
      margin: 10px;
      display: flex;
      justify-content: stretch;
      align-content: stretch;
      color: var(--color-inverse-2);
      .card-title {
        line-height: 115%;
        color: var(--color-inverse);
        &.message {
          padding-bottom: 6px;
        }
      }
      .card-body {
        flex-grow: 1;
        flex-shrink: 1;
        overflow-y: auto;
      }
    }
    .footer {
      border-top: solid 1px var(--color-faded-1);
      button {
        min-width: 120px;
        border-radius: 0.9rem;
      }
    }
    .btn-toolbar {
      .btn {
        min-width: 100px;
      }
    }
  }
</style>

<div
  class="full-screen dark-glass alert-dialog {show === true ? 'visible' : 'hidden'}">
  <div class="alert-dialog-window card">
    {#if title}
      <div
        class="card-title {!hasSlot && !message ? 'message-less' : 'message'}">
        {title}
      </div>
    {/if}

    {#if message && !hasSlot}
      <div class="card-body align-items-center pt-0">{message}</div>
    {:else if hasSlot && !message}
      <div class="slot-holder card-body pt-0">
        <slot />
      </div>
    {:else if hasSlot && message}
      <div class="slot-holder card-body pt-0">
        <p>{message}</p>
        <slot />
      </div>
    {/if}

    <!-- -->

    <div class="p-1 d-flex flex-row footer">
      {#if cancel}
        <button
          class="btn btn-lg btn-light mr-1 flex-grow"
          on:click={methods.onCancel}>
          {cancel}
        </button>
      {/if}

      <button
        class="btn btn-lg btn-primary ml-1 flex-grow"
        on:click={methods.onOk}>
        {ok}
      </button>
    </div>
  </div>
</div>
