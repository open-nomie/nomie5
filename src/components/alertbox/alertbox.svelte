<script>
  import { createEventDispatcher } from "svelte";
  import Button from "../button/button.svelte";
  import Text from "../text/text.svelte";
  const dispatch = createEventDispatcher();

  export let title = undefined;
  export let message = undefined;
  export let ok = "Ok";
  export let cancel = undefined;
  export let show = false;
  export let onInteract = null;

  let hasSlot = false;
  let escListener;

  let showDom = false;
  let showBase = false;

  $: if (show) {
    showBase = true;
    setTimeout(() => {
      showDom = true;
    }, 200);
    hasSlot = arguments[1].$$slots || {}.default;
    escListener = document.addEventListener("keyup", (evt) => {
      if (evt.key == "Escape") {
        methods.onCancel();
      }
    });
  } else {
    showDom = false;
    setTimeout(() => {
      showBase = false;
    }, 200);
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
    },
  };
</script>

<style global lang="postcss">
  .alert-dialog {
    min-height: 200px;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2200;
    background-color: var(--color-full-screen);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.5s ease-in-out;
  }
  .alert-dialog.visible {
    opacity: 1;
  }
  .alert-dialog.hidden {
      pointer-events: none;
      opacity: 0;
      
    }
  .alert-dialog.hidden .card {
      opacity: 0;
    }
  .alert-dialog .card {
      @apply rounded-2xl;
      @apply flex-col;
      @apply m-2;
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
      display: flex;
      justify-content: stretch;
      align-content: stretch;
      color: var(--color-inverse-2);
  }
  .alert-dialog .card  .card-title {
    line-height: 115%;
    color: var(--color-inverse);
    @apply font-bold;
    @apply text-xl;
    @apply p-3;
    @apply pb-0;
  }

  .alert-dialog .card-title.message-less {
    @apply pb-3;
  }

  .alert-dialog .card input {
    @apply w-full;
    @apply bg-gray-200;
    @apply p-2;
    @apply rounded-lg;
    @apply focus:bg-white;
    @apply mt-2;
  }
  .alert-dialog .card .message {
    @apply text-base;
    @apply leading-snug;
  }

  .alert-dialog .card .card-body {
    @apply p-3;
    @apply pb-4;
    @apply text-base;
    flex-grow: 1;
    flex-shrink: 1;
    overflow-y: auto;
  }

  .alert-dialog .footer { 
    border-top: solid 1px var(--color-faded-1);
      @apply flex;
      @apply items-center;
  }
  .alert-dialog .footer button {
    @apply rounded-2xl;
    min-width: 120px;
  }
  .alert-dialog .btn-toolbar .btn {
    min-width: 100px;
  }
</style>

{#if showBase}
  <div
    class="full-screen alert-dialog {showDom === true ? 'visible' : 'hidden'}"
    aria-modal
    aria-hidden={!showDom}
    aria-label="Alert Dialog">
    <div class="alert-dialog-window card">
      {#if title}
        <div
          class="card-title {!hasSlot && !message ? 'message-less' : 'has-message'}">
          {title}
        </div>
      {/if}

      {#if message && !hasSlot}
        <div class="card-body message">{message}</div>
      {:else if hasSlot && !message}
        <div class="slot-holder card-body pt-0">
          <slot />
        </div>
      {:else if hasSlot && message}
        <div class="slot-holder card-body pt-0">
          <Text size="sm">{message}</Text>
          <slot />
        </div>
      {/if}

      <div class="p-1 d-flex flex-row footer">
        {#if cancel}
          <Button
            color="transparent"
            ariaLabel={cancel}
            size="lg"
            block
            className="mr-1 flex-grow"
            on:click={methods.onCancel}>
            {cancel}
          </Button>
        {/if}
        <Button
          ariaLabel={ok}
          block
          size="lg"
          className="ml-1 flex-grow"
          on:click={methods.onOk}>
          {ok}
        </Button>
      </div>
    </div>
  </div>
{/if}
