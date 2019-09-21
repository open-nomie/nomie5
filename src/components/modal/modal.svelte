<script>
  import NText from "../text/text.svelte";
  import { fly } from "svelte/transition";

  // Props
  export let padding = false;
  export let title;
  export let allowClose = undefined;
  export let fullscreen = false;
  export let flexBody = undefined;
  export let show = true;
  export let className = undefined;
  export let type = "normal";

  const has_header = (arguments[1].$$slots || {}).hasOwnProperty("header");
  const has_footer = (arguments[1].$$slots || {}).hasOwnProperty("footer");
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
    &.type-bottom {
      justify-content: flex-end;
    }
    &.type-fullscreen {
      .n-modal {
        height: 100vh;
        width: 100vw;
        max-height: 100vh;
        max-width: 100vw;
        border-radius: 0px;
        margin: 0;
        @include media-breakpoint-up(sm) {
          max-width: 500px;
          max-height: 700px;
          border-radius: 0.7rem;
        }
      }
    }
    &.type-cover {
      .n-modal {
        padding-top: env(safe-area-inset-top) !important;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 0px;
        margin: 0;
        margin-left: 0;
        margin-right: 0;
        padding-bottom: env(safe-area-inset-bottom) !important;
      }
    }
  }
  .n-modal {
    min-width: 320px;
    background-color: var(--color-solid);
    min-height: 200px;
    max-height: 95vh;
    max-width: 400px;
    margin: 10px;
    border-radius: 0.7rem;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    border: solid 1px var(--color-solid);
    box-shadow: var(--box-shadow);

    .n-modal-body {
      flex-grow: 1;
      @include media-breakpoint-up(md) {
        padding: 20px;
      }
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
    padding: 10px 10px;
    min-height: 40px;
    border-bottom: solid 1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-grow: 0;
    flex-shrink: 0;
    color: var(--color-inverse);
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
    overflow-y: scroll;
  }
</style>

{#if show}
  <div class="n-modal-frame {className} type-{type}" transition:fly>
    <div class="n-modal {fullscreen ? 'full-screen-modal' : ''}">
      {#if has_header || title}
        <div class="n-modal-header">
          {#if has_header}
            <slot name="header" />
          {:else}
            <NText tag="div" bold size="lg" className="text-center w-100 py-1">
              {title}
            </NText>
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
{/if}
