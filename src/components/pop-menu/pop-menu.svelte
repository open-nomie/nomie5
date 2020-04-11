<script>
  import NToolbar from "../toolbar/toolbar.svelte";
  import NItem from "../list-item/list-item.svelte";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { Lang } from "../../store/lang";
  const dispatch = createEventDispatcher();

  export let title = undefined;
  export let description = undefined;
  export let buttons = [];
  // export let cancel = undefined;
  export let show = true;

  const methods = {
    backgroundClicked(event) {
      dispatch("close");
    }
  };
  let escListener;
  $: if (show) {
    escListener = document.addEventListener("keyup", evt => {
      if (evt.key == "Escape") {
        dispatch("close");
      }
    });
  } else {
    escListener = document.removeEventListener("keyup", () => {});
  }
</script>

<style lang="scss" type="text/scss">
  :global(.pop-menu) {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2000;
    padding-bottom: env(safe-area-inset-bottom);
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
      background-color: var(--color-darkest);
      color: var(--color-inverse-1);
      border-radius: 1.2rem;
      border: var(--modal-border);
      box-shadow: var(--box-shadow-float);
      padding: 10px;
      margin: 10px;
      display: flex;
      justify-content: stretch;
      align-content: stretch;

      .btn {
        $radius: 1rem;
        border-radius: 0;
        margin-bottom: 0;
        margin-top: 0;
        &:first-child {
          border-top-right-radius: $radius;
          border-top-left-radius: $radius;
        }
        &:nth-last-child(2) {
          border-bottom-right-radius: $radius;
          border-bottom-left-radius: $radius;
        }
        &:last-child {
          border-radius: $radius;
          margin-top: 10px;
        }
        &:active {
          transform: scale(0.98);
        }
        &:hover {
          transform: none;
        }
      }

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
</style>

<div
  class="full-screen dark-glass pop-menu {show === true ? 'visible' : 'hidden'}"
  on:click={methods.backgroundClicked}>
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
      {#each buttons as button}
        <button
          class="btn btn-block btn-light btn-lg {button.description ? 'btn-desc' : ''}"
          on:click|stopPropagation={() => {
            button.click();
            dispatch('close');
          }}>
          <div class="title">{button.title}</div>
          {#if button.description}
            <div class="description">{button.description}</div>
          {/if}
        </button>
      {/each}
      <button
        class="btn btn-block btn-danger btn-lg"
        on:click|stopPropagation={() => {
          dispatch('close');
        }}>
        {Lang.t('general.cancel')}
      </button>
    </div>
  </div>
</div>
