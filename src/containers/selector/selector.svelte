<script>
  import Modal2 from '@/components/modal/modal2.svelte'
  // components
  import NText from '@/components/text/text.svelte'
  import NItem from '@/components/list-item/list-item.svelte'
  import NIcon from '@/components/icon/icon.svelte'

  import Dymoji from '@/components/dymoji/dymoji.svelte'

  //Utils
  import { createEventDispatcher } from 'svelte'

  // Stores
  import { TrackerStore } from '../../store/tracker-store'
  import { PeopleStore } from '../../store/people-store'
  import { Interact } from '../../store/interact'
  import { ContextStore } from '../../store/context-store'
  import { Lang } from '../../store/lang'
  import Button from '@/components/button/button.svelte'
  import Panel from '@/components/panel/panel.svelte'
  import ToolbarGrid from '@/components/toolbar/toolbar-grid.svelte'

  // Props
  export let show = false
  export let multiple = false
  // export let multiple = false;

  // Consts
  const dispatch = createEventDispatcher()

  // State
  let state = {
    selected: [],
    items: [],
    multiple,
  }

  function onDoubleTap(item) {
    state.selected = [item]
    dispatch('select', state.selected)
  }

  // Holder of the alphabet for the list
  let alphaGroup = {}

  // When tracker store loads. Turn trackers into array sorted by label
  $: type = $Interact.selector.type

  let isShown = false

  $: if ($Interact.selector.show && !isShown) {
    isShown = true

    switch ($Interact.selector.type) {
      case 'tracker':
        state.title = multiple ? 'Select Trackers' : 'Select a Tracker'
        state.items = Object.keys($TrackerStore.trackers || {})
          .map((tag) => {
            return $TrackerStore.trackers[tag]
          })
          .sort((a, b) => {
            return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
          })
        break

      case 'person':
        state.title = multiple ? 'Select People' : 'Select a Person'

        state.items = Object.keys($PeopleStore.people || {})
          .map((username) => {
            return $PeopleStore.people[username]
          })
          .sort((a, b) => {
            return a.username.toLowerCase() > b.username.toLowerCase() ? 1 : -1
          })
        break

      case 'context':
        state.title = 'Select Context'

        state.items = Object.keys($ContextStore || {})
          .map((tag) => {
            return $ContextStore[tag]
          })
          .sort((a, b) => {
            return a > b ? 1 : -1
          })
        break
    }
  } else if ($Interact.selector.show == false && isShown) {
    isShown = false
    state.selected = []
  }

  // When selected, auto create an array of selected trackers
  // $: state.selectedArray = Object.keys(state.selected).map(tag => {
  //   alphaGroup = {};
  //   return state.selected[tag];
  // });

  $: if (state.selected) {
    alphaGroup = {}
  }

  // If show changes, set selected to notihng

  // Methods
  const methods = {
    toggle(item) {
      if (multiple) {
        let index = state.selected.indexOf(item)
        if (index > -1) {
          // unselect
          state.selected.splice(index, 1)
        } else {
          state.selected.push(item)
        }
      } else {
        state.selected = [item]
      }
      state.selected = state.selected
    },
    close() {
      dispatch('cancel')
    },
    // Check if a letter has been shown
    alphaGroupExists(item) {
      if (state.items.length > 10) {
        // get first letter
        let alpha = item.substr(0, 1).toLowerCase()
        // If it has value - return true...
        if (alphaGroup.hasOwnProperty(alpha)) {
          return true
        } else {
          // Else - populate the alphaGroup, then return false
          alphaGroup[alpha] = true
          return false
        }
      } else {
        // if it's less than 10 trackers - just show them without the letters
        return true
      }
    },
  }
</script>

<style lang="postcss" global>

</style>

<Modal2
  id="element-selector"
  visible={isShown}
  className="tracker-selector-modal"
  allowClose={true}
  on:close={methods.close}>
  <Panel>

    <header slot="header">
      <ToolbarGrid>
        <div slot="left">
          <Button color="primary" type="clear" on:click={() => methods.close()}>
            Close
          </Button>
        </div>
        <div class="ntitle">
          {Lang.t('general.select-a-tracker', 'Select a Tracker')}
        </div>
        <div slot="right">
          {#if state.selected.length > 0}
            <Button
              type="clear"
              className="flex-grow "
              color="primary"
              on:click={() => {
                dispatch('select', state.selected)
              }}>
              <span class="whitespace-nowrap">
                {Lang.t('general.select', 'Select')}
                {multiple ? `(${state.selected.length})` : ''}
              </span>
            </Button>
          {/if}
        </div>
      </ToolbarGrid>
    </header>

    {#if state.items.length == 0}
      <NItem className="text-inverse-2">Nothing found</NItem>
    {/if}

    {#if type == 'tracker'}
      <div class="list trackers">
        {#each state.items as item}
          {#if !methods.alphaGroupExists(item.label)}
            <NItem
              className="bg-light text-faded sticky-top"
              title={item.label.substr(0, 1).toUpperCase()} />
          {/if}
          <NItem
            clickable
            className="bottom-line select-item"
            title={item.label}
            on:dbltap={() => {
              onDoubleTap(item)
            }}
            on:click={() => {
              methods.toggle(item)
            }}>
            <span slot="left">
              <NText size="lg">{item.emoji}</NText>
            </span>

            <div slot="right" class="flex items-center ml-2">
              {#if state.selected.indexOf(item) > -1}
                <NIcon
                  name="checkmarkOutline"
                  className="fill-primary-bright"
                  size={24} />
              {/if}
            </div>

          </NItem>
        {/each}
      </div>
    {:else if type == 'person'}
      <!-- It's a person list -->
      <div class="list people">
        {#each state.items as person}
          {#if !methods.alphaGroupExists(person.displayName)}
            <NItem
              className="bg-light text-faded sticky-top"
              title={person.displayName.substr(0, 1).toUpperCase()} />
          {/if}
          <NItem
            clickable
            className="select-item bottom-line {state.selected.indexOf(person) > -1 ? 'bg-selected' : ''}"
            title={person.displayName}
            on:click={() => {
              methods.toggle(person)
            }}>
            <span slot="left">
              <Dymoji username={person.username} size={24} />
            </span>
            <span slot="right">
              {#if state.selected.indexOf(person) > -1}
                <div class="badge badge-primary">
                  <NIcon name="checkmark" className="fill-white" size={16} />
                </div>
              {/if}
            </span>
          </NItem>
        {/each}
      </div>
    {:else if type == 'context'}
      <div class="list context">
        {#each state.items as context}
          {#if !methods.alphaGroupExists(context)}
            <NItem
              className="bg-light text-faded sticky-top"
              title={context.substr(0, 1).toUpperCase()} />
          {/if}
          <NItem
            clickable
            className="select-item bottom-line {state.selected.indexOf(context) > -1 ? 'bg-selected' : ''}"
            title={'+' + context}
            on:click={() => {
              methods.toggle(context)
            }}>
            <span slot="right">
              {#if state.selected.indexOf(context) > -1}
                <div class="badge badge-primary">
                  <NIcon name="checkmark" className="fill-white" size={16} />
                </div>
              {/if}
            </span>
          </NItem>
        {/each}
      </div>
    {/if}

  </Panel>
</Modal2>
