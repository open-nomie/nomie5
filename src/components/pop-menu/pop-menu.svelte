<script lang="ts">
  import NToolbar from "../toolbar/toolbar.svelte";
  import NItem from "../list-item/list-item.svelte";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { Lang } from "../../store/lang";
  import Button from "../button/button.svelte";
  const dispatch = createEventDispatcher();

  export let title = undefined;
  export let description = undefined;
  export let buttons = [];
  // export let cancel = undefined;
  export let show = true;

  const methods = {
    backgroundClicked(event: any) {
      const ele: HTMLElement = event.toElement;
      if (ele.classList.contains("pop-menu")) {
        dispatch("close", event);
      }
    },
  };

  function close(evt) {
    dispatch("close", evt);
  }

  let escListener;
  $: if (show) {
    escListener = document.addEventListener("keyup", (evt) => {
      if (evt.key == "Escape") {
        dispatch("close");
      }
    });
  } else {
    escListener = document.removeEventListener("keyup", () => {});
  }
</script>

<style lang="scss" type="text/scss">
  $radius: 1rem;
  :global(.pop-menu) {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2002;
    padding-bottom: env(safe-area-inset-bottom);

    .list {
      border-radius: $radius;
      background-color: var(--color-solid);
      max-height: 60vh;
      overflow-y: scroll;
    }

    &:before {
      content: "";
      background-color: var(--color-full-screen);
      opacity: 0.8;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    display: flex;
    justify-content: center;
    align-items: flex-end;
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
        transform: translateY(400px) scaleY(0.1) scaleX(0.1);
      }
    }
    .card {
      transition: all 0.2s ease-in-out;
      max-width: 400px;
      max-height: 80vh;
      min-height: 100px;
      width: 200px;
      min-width: 300px !important;
      flex-grow: 1;
      background-color: var(--color-darkest-translucent);
      color: var(--color-inverse-1);
      border-radius: 1.2rem;
      border: var(--modal-border);
      box-shadow: var(--box-shadow-float);
      padding: 10px;
      margin: 10px;
      display: flex;
      justify-content: stretch;
      align-content: stretch;

      .card-body {
        flex-grow: 1;
        flex-shrink: 1;
        overflow-x: hidden;
      }
    }
    .btn-toolbar {
      .btn {
        min-width: 100px;
      }
    }
  }
  :global(.pop-menu .list .btn) {
    border-radius: 0;
    margin-bottom: 0;
    margin-top: 0;
    border: none;
    box-shadow: none !important;
    &:hover {
      transform: scale(1) !important;
      color: var(--color-inverse) !important;
      background-color: var(--color-solid) !important;
    }
    &:first-child {
      border-top-right-radius: $radius;
      border-top-left-radius: $radius;
    }
    &:last-child() {
      border-bottom-right-radius: $radius;
      border-bottom-left-radius: $radius;
    }
    &:active {
      // transform: scale(0.98);
    }
    &:hover {
      transform: none;
      color: inherit;
      // background-color: var(--color-faded) !important;
    }
  }
  :global(.pop-menu .btn-danger:hover, .pop-menu.btn-danger:active) {
    background-color: var(--color-red) !important;
    color: rgba(128, 2, 2, 0.9) !important;
  }
</style>

<div class="full-screen dark-glass pop-menu {show === true ? 'visible' : 'hidden'}" on:click={methods.backgroundClicked}>
  <div class="card">
    {#if title || description}
      <div class="pb-3 pt-2 text-center">
        {#if title}
          <h5 class="text-center m-0 p-0 text-md text-inverse-2">{title}</h5>
        {/if}
        {#if description}
          <p class="text-center m-0 p-0">{description}</p>
        {/if}
      </div>
    {/if}
    <div class="list">
      {#each buttons as button, index}
        <Button
          block
          color="light"
          size="lg"
          disabled={button.disabled}
          className={button.description ? 'btn-desc' : ''}
          on:click={(evt) => {
            button.click();
            close(evt);
          }}>
          <div class="title">{button.title}</div>
          {#if button.description}
            <div class="description">{button.description}</div>
          {/if}
        </Button>
        {#if index !== buttons.length - 1}
          <hr class="divider center" />
        {/if}
      {/each}

    </div>
    <Button
      block
      className="mt-2"
      style="flex-shrink:0"
      color="danger"
      size="lg"
      on:click={(evt) => {
        close(evt);
      }}>
      {Lang.t('general.cancel')}
    </Button>
  </div>
</div>
