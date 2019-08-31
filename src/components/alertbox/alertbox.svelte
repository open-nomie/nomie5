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
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1010;
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
      transition: all 0.2s ease-in-out;
      max-width: 400px;
      max-height: 80vh;
      min-height: 150px;
      width: 200px;
      min-width: 300px !important;
      flex-grow: 1;
      background-color: var(--color-solid);
      border: solid 1px var(--color-faded-1);
      box-shadow: 0px 10px 16px -6px rgba(0, 0, 0, 0.2);
      margin: 10px;
      display: flex;
      justify-content: stretch;
      align-content: stretch;
      color: var(--color-inverse-2);
      .card-body {
        flex-grow: 1;
        flex-shrink: 1;
        overflow-y: scroll;
      }
    }
    .footer {
      border-top: solid 1px var(--color-faded-1);
      button {
        min-width: 120px;
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

    <div class="card-body">
      {#if title}
        <NText size="lg" bold tag="div" className="mb-2">{title}</NText>
      {/if}
      {#if message}{message}{/if}
      <div class="slot-holder">
        <slot />
      </div>
    </div>

    <div class="p-2 d-flex flex-row footer">
      {#if cancel}
        <button
          class="btn btn-light mr-1 flex-grow"
          on:click={methods.onCancel}>
          {cancel}
        </button>
      {/if}

      <button class="btn btn-primary ml-1 flex-grow" on:click={methods.onOk}>
        {ok}
      </button>
    </div>
  </div>
</div>
