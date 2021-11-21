<script lang="ts">
  import NToolbar from "../toolbar/toolbar.svelte";
  import NItem from "../list-item/list-item.svelte";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { Lang } from "../../store/lang";
  import Button from "../button/button.svelte";
  import Text from "../text/text.svelte";
  import Divider from "../divider/divider.svelte";
  import Icon from "../icon/icon.svelte";
  import List from "../list/list.svelte";
  import type { groupBy } from "lodash";
  import Avatar from "../avatar/avatar.svelte";
  const dispatch = createEventDispatcher();

  export let title = undefined;
  export let description = undefined;
  export let buttons: Array<PopMenuButton> = [];
  // export let cancel = undefined;
  export let show = true;

  interface PopMenuButton {
    title?: string;
    description?: string;
    emoji?: string;
    icon?: string;
    disabled?: boolean;
    click?: Function;
    divider?: boolean;
  }

  let buttonGroup: Array<Array<PopMenuButton>> = [];

  $: if (buttons) {
    buttonGroup = [[]];
    let current: number = buttonGroup.length - 1;
    buttons.forEach((button: PopMenuButton) => {
      if (button.divider) {
        buttonGroup.push([]);
        current = buttonGroup.length - 1;
      }
      buttonGroup[current].push(button);
    });
  }

  let showDom: boolean = false;
  let showBase: boolean = false;
  $: if (show) {
    showBase = true;
    setTimeout(() => {
      showDom = true;
    }, 200);
  } else {
    showDom = false;
    setTimeout(() => {
      showBase = false;
    }, 200);
  }

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

<style global lang="postcss">
  .pop-menu {
	 --pop-button-radius: 12px;
	 position: fixed;
	 top: 0;
	 bottom: 0;
	 left: 0;
	 right: 0;
	 z-index: 2002;
	 padding-bottom: env(safe-area-inset-bottom);
	 display: flex;
	 justify-content: center;
	 align-items: flex-end;
	 transition: all 0.5s ease-in-out;
}
 .pop-menu .list {
	 border-radius: 1em;
	 background-color: var(--color-solid);
	 max-height: 60vh;
	 overflow-y: scroll;
}
 .pop-menu:before {
	 content: "";
	 background-color: var(--color-full-screen);
	 opacity: 0.8;
	 position: absolute;
	 top: 0;
	 left: 0;
	 right: 0;
	 bottom: 0;
}
 .pop-menu.visible {
	 opacity: 1;
}
 .pop-menu.hidden {
	 pointer-events: none;
	 opacity: 0;
}
 .pop-menu.hidden .card {
	 opacity: 0;
	 transform: translateY(400px) scaleY(0.1) scaleX(0.1);
}
 .pop-menu .card {
	 transition: all 0.2s ease-in-out;
	 max-width: 400px;
	 max-height: 80vh;
	 min-height: 100px;
	 width: 200px;
	 min-width: 300px !important;
	 flex-grow: 1;
	 background-color: var(--color-darkest-translucent);
	 color: var(--color-inverse-1);
	 border-radius: 1.2em;
	 border: var(--modal-border);
	 box-shadow: var(--box-shadow-float);
	 padding: 10px;
	 margin: 10px;
	 display: flex;
	 justify-content: stretch;
	 align-content: stretch;
}
 .pop-menu .card .card-body {
   @apply flex-grow;
   @apply flex-shrink;
   @apply overflow-y-auto;
   @apply overflow-x-hidden;
}
 .pop-menu .btn-toolbar .nbtn {
	 @apply min-w-full;
}
 .pop-menu .pop-button {
	 box-shadow: none;
}
 .pop-menu .n-list {
	 @apply rounded-2xl;
   @apply overflow-y-auto;
}
 .pop-menu .n-list .nbtn main {
	 text-align: left !important;
	 justify-content: flex-start;
}
 .pop-menu .n-list .nbtn ~ .nbtn:after {
	 content: "";
	 border-top: solid 1px rgba(155, 155, 155, 0.25) !important;
	 position: absolute;
	 top: 0;
	 left: 0;
	 right: 0;
}
 .pop-menu .nbtn-danger:hover, .pop-menu.nbtn-danger:active {
	 background-color: var(--color-red) !important;
	 color: rgba(128, 2, 2, 0.9) !important;
}
 
</style>

{#if showBase}
  <div
    aria-modal
    aria-hidden={!showDom}
    aria-label={title || 'Pop Menu'}
    class="screen-block justify-end  pop-menu {showDom === true ? 'visible' : 'hidden'}"
    on:click={methods.backgroundClicked}>
    <div class="card bg-white z-50 flex flex-col">
      {#if title || description}
        <div class="p-2">
          {#if title}
            <h5
              class="p-0 m-0 text-lg text-bold text-inverse {!description ? 'pb-2' : ''}">
              {title}
            </h5>
          {/if}
          {#if description}
            <p class="p-0 m-0 mt-1 leading-tight">{description}</p>
          {/if}
        </div>
      {/if}

      {#each buttonGroup as group, gIndex}
        <List className="mb-2 rounded-xl">
          {#each group as button, index}
            {#if button.title}
              <Button
                block
                color="light"
                size="lg"
                ariaLabel={button.title}
                disabled={button.disabled}
                className="pop-button pop-button-{index}
                {button.description ? 'nbtn-desc' : ''}"
                on:click={(evt) => {
                  button.click();
                  close(evt);
                }}>
                {button.title}
                {#if button.description}
                  <Text size="sm" leading2 faded className="mt-1 leading-tight">
                    {button.description}
                  </Text>
                {/if}

                <div slot="right">
                  {#if button.icon}
                    <Icon name={button.icon} />
                  {:else if button.emoji}
                    <Avatar emoji={button.emoji} size={42} />
                  {/if}
                </div>

              </Button>
            {/if}
          {/each}
        </List>
      {/each}

      <div class="bg-transparent" />
      <Button
        block
        className="mt-2"
        style="flex-shrink:0"
        color="danger"
        ariaLabel="Cancel"
        size="lg"
        on:click={(evt) => {
          close(evt);
        }}>
        {Lang.t('general.cancel', 'Cancel')}
      </Button>
    </div>
  </div>
{/if}
