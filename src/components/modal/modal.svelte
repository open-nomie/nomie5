<script>
  import NText from "../text/text.svelte";
  import { fly } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  // Props
  export let padding = false;
  export let title;
  export let allowClose = undefined;
  export let fullscreen = false;
  export let flexBody = undefined;
  export let show = true; // Defaulted to true so it can be controlled by a parent component
  export let className = undefined;
  export let type = "normal"; // cover, fullscreen, bottom, bottom-slide-up

  const has_header = (arguments[1].$$slots || {}).hasOwnProperty("header");
  const has_footer = (arguments[1].$$slots || {}).hasOwnProperty("footer");

  let domVisible = false;
  let showModal = false;

  // Stagger showing and dom showing for CSS effects
  $: if (show) {
    showModal = true;
    setTimeout(() => {
      domVisible = true;
    }, 100);
  } else {
    domVisible = false;
    setTimeout(() => {
      showModal = false;
    }, 400);
  }
</script>

<style lang="scss">
  @import "../../scss/vendor/bootstrap/base";
  .n-modal-frame {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-full-screen);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.6s ease-in-out;
    &.hidden {
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
    }
    &.type-bottom {
      justify-content: flex-end;
    }
    &.type-bottom-slideup {
      justify-content: flex-end;
      margin-bottom: -20px;
      padding-bottom: 20px;

      &.hidden {
        .n-modal {
          transform: translateY(700px);
        }
      }
      .n-modal {
        transition: all 0.4s ease-in-out;
        max-height: 70vh;
        margin-bottom: 0px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        padding-bottom: env(safe-area-inset-bottom);
        box-shadow: var(--box-shadow);
        border: solid 1px var(--color-inverse-3);
      }
    }
    &.type-fullscreen {
      background-color: rgba(0, 0, 0, 0.95);
      .n-modal {
        height: 100vh;
        width: 100vw;
        max-height: 100vh;
        max-width: 100vw;
        border-radius: 0px;
        margin: 0;
        @include media-breakpoint-up(md) {
          max-width: 500px;
          max-height: 700px;
          border-radius: 0.7rem;
        }
      }
      .n-modal-footer {
        padding-bottom: calc(env(safe-area-inset-bottom) + 10px);
      }
    }
    &.type-cover {
      .n-modal {
        padding-top: env(safe-area-inset-top) !important;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        max-width: 100vw;
        bottom: 0;
        border-radius: 0px;
        margin: 0;
        margin-left: 0;
        margin-right: 0;
        max-height: 100vh;
      }
    }
  }
  .n-modal {
    border: var(--modal-border);
    min-width: 320px;
    background-color: var(--color-solid);
    min-height: 200px;
    max-height: 90vh;
    max-width: 400px;
    margin: 10px;
    border-radius: 1.2rem;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    border: var(--modal-border);
    box-shadow: var(--box-shadow-float);
    transition: all 0.2s ease-in-out;
    .n-modal-body {
      flex-grow: 1;
      @include media-breakpoint-up(md) {
        padding: 20px;
      }
      overflow-y: auto;
      overflow-x: hidden;
      // border-radius: 1.2rem;
      z-index: 1;
    }

    &.full-screen-modal {
      height: 96vh;
      width: 96vw;
      max-width: 700px;
      max-height: 700px;

      .n-modal-body {
        &.flex-body {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: stretch;
          align-items: stretch;
        }
      }
    }
  }
  .n-modal-header {
    padding: 10px 16px;
    min-height: 40px;
    border-bottom: solid 1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-grow: 0;
    flex-shrink: 0;
    color: var(--color-inverse);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.09);
    z-index: 2;
  }
  .n-modal-footer {
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 10px;
    border-top: solid 1px rgba(0, 0, 0, 0.05);
    box-shadow: 0px -6px 12px rgba(0, 0, 0, 0.09);
    z-index: 2;
  }

  :global(.n-modal-footer .btn) {
    padding-left: 26px;
    padding-right: 26px;
  }
  .n-modal-body {
    // display: flex;
    // flex-grow: 1;
    // flex-shrink: 1;
    // flex-direction: column;
    overflow-y: scroll;
    &.padding {
      padding: 20px;
    }
    &.no-padding {
      padding: 0px !important;
      overflow: scroll;
    }
    overflow-y: scroll;
  }
</style>

<div
  class="n-modal-frame {className} type-{type}
  {domVisible ? 'visible' : 'hidden'}">
  <div
    class="n-modal animate up {fullscreen ? 'full-screen-modal' : ''}
    {domVisible ? 'visible' : 'hidden'}">
    {#if has_header || title}
      <div class="n-modal-header">
        {#if has_header}
          <slot name="header" />
        {:else}
          {#if allowClose}
            <button
              class="btn btn-clear btn-icon zmdi zmdi-close"
              on:click={() => {
                dispatch('close');
              }} />
          {/if}
          <NText tag="div" bold size="lg" className="text-center w-100 py-1">
            {title}
          </NText>
          {#if allowClose}
            <button class="btn btn-clear btn-icon zmdi" on:click={() => {}} />
          {/if}
        {/if}

      </div>
    {/if}
    <div
      class="n-modal-body {padding ? 'padding' : 'no-padding'}
      {flexBody ? 'flex-body' : 'no-flex-body'}">
      <slot />
    </div>
    {#if has_footer}
      <div class="n-modal-footer">
        <slot name="footer" />
      </div>
    {/if}
  </div>
</div>
