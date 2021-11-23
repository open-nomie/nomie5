<script lang="ts">
  import { wait } from './../../utils/tick/tick'
  import { createEventDispatcher, onMount, onDestroy } from 'svelte'
  import { Lang } from '../../store/lang'
  import Button from '../button/button.svelte'
  import Text from '../text/text.svelte'
  import Icon from '../icon/icon.svelte'
  import List from '../list/list.svelte'

  import Avatar from '../avatar/avatar.svelte'
  import Backdrop from '../../components/backdrop/backdrop.svelte'
  const dispatch = createEventDispatcher()

  import './pop-menu.css'

  export let title = undefined
  export let description = undefined
  export let buttons: Array<PopMenuButton> = []
  // export let cancel = undefined;
  export let show = true

  interface PopMenuButton {
    title?: string
    description?: string
    emoji?: string
    icon?: string
    disabled?: boolean
    click?: Function
    divider?: boolean
  }

  let buttonGroup: Array<Array<PopMenuButton>> = []

  $: if (buttons) {
    buttonGroup = [[]]
    let current: number = buttonGroup.length - 1
    buttons.forEach((button: PopMenuButton) => {
      if (button.divider) {
        buttonGroup.push([])
        current = buttonGroup.length - 1
      }
      buttonGroup[current].push(button)
    })
  }

  let showDom: boolean = false
  let showBase: boolean = false
  $: if (show) {
    showBase = true
    setTimeout(() => {
      showDom = true
    }, 200)
  } else {
    showDom = false
    setTimeout(() => {
      showBase = false
    }, 200)
  }

  const methods = {
    backgroundClicked(event: any) {
      const ele: HTMLElement = event.toElement
      if (ele.classList.contains('pop-menu')) {
        dispatch('close', event)
      }
    },
  }

  function close(evt) {
    dispatch('close', evt)
  }

  let escListener
  $: if (show) {
    escListener = document.addEventListener('keyup', (evt) => {
      if (evt.key == 'Escape') {
        dispatch('close')
      }
    })

    wait(300).then(() => {
      const cancelButton = document.getElementById('cancel-button')
      if (cancelButton) cancelButton.focus()
    })
  } else {
    escListener = document.removeEventListener('keyup', () => {})
  }
</script>

<Backdrop id="popmenu" visible={showBase} position="bottom">
  <div class="flex flex-col pop-menu">
    {#if title || description}
      <header class="py-2 text-center">
        {#if title}
          <h5 class="font-bold text-lg {!description ? 'pb-2' : ''}">
            {title}
          </h5>
        {/if}
        {#if description}
          <p class="p-0 m-0 mb-2 text-xs leading-tight text-gray-500">
            {description}
          </p>
        {/if}
      </header>
    {/if}

    {#each buttonGroup as group, gIndex}
      <List className="rounded-xl overflow-y-auto">
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
                button.click()
                close(evt)
              }}>
              <span class="text-black dark:text-primary-50">
                {button.title}
              </span>
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
      id="cancel-button"
      block
      className="mt-2 hover:text-white text-white"
      style="flex-shrink:0"
      color="danger"
      ariaLabel="Cancel"
      size="lg"
      on:click={(evt) => {
        close(evt)
      }}>
      {Lang.t('general.cancel', 'Cancel')}
    </Button>
  </div>
</Backdrop>

<!-- {#if showBase}
  <div
    aria-modal
    aria-hidden={!showDom}
    aria-label={title || 'Pop Menu'}
    class="screen-block justify-end  pop-menu {showDom === true ? 'visible' : 'hidden'}"
    on:click={methods.backgroundClicked}>
    
  </div>
{/if} -->
