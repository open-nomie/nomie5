<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import ListItem from '../list-item/list-item.svelte'
  import NInput from '../input/input.svelte'
  import NIcon from '../icon/icon.svelte'
  import LabelMeta from '../label-meta/label-meta.svelte'

  import { TrackerStore } from '../../store/tracker-store'
  import type { ITracker } from '../../modules/tracker/tracker'
  import SearchBar from '../search-bar/search-bar.svelte'
  import Empty from '../empty/empty.svelte'
  import Icon from '../icon/icon.svelte'
  import { Lang } from '../../store/lang'

  const dispatch = createEventDispatcher()

  export let tracker: ITracker

  export let active = []
  let activeValue
  let picks = []
  let searchFilter: string

  $: {
    picks = tracker && tracker.picks ? tracker.picks : []
    if (searchFilter) {
      picks = picks.filter((p) => {
        return p.toLowerCase().search(`${searchFilter}`.toLowerCase()) > -1
      })
    }
  }

  function toggle(pick) {
    if (active.indexOf(pick) > -1) {
      active = active.filter((p) => {
        return p !== pick
      })
    } else {
      active.push(pick)
    }
    active = active
    setTimeout(() => {
      try {
        const active: any = document.activeElement
        active.blur()
      } catch (e) {}
    }, 120)
    fireChange()
  }

  function add() {
    tracker.picks = tracker.picks || []
    tracker.picks.push(`${activeValue}`)
    activeValue = null
    TrackerStore.saveTracker(tracker)
    tracker.picks = tracker.picks
  }

  function fireChange() {
    dispatch('change', active)
  }

  function isHeader(pick) {
    let lastCharacter = pick.trim().substr(pick.trim().length - 1, 1)
    return lastCharacter === ':'
  }
</script>

<style lang="postcss">

</style>

<div class="w-full p-2">

  <div class="rounded-md shadow-lg n-list">
    {#if tracker.picks.length > 10}
      <SearchBar
        autocomplete
        compact
        showClose={true}
        className="p-0 mt-1"
        on:clear={() => {
          searchFilter = undefined
        }}
        on:change={(evt) => {
          if (evt.detail && evt.detail.length > 0) {
            searchFilter = evt.detail
          } else {
            searchFilter = undefined
          }
        }} />
    {/if}
    {#if picks.length == 0 && searchFilter}
      <Empty title={Lang.t('general.no-matches-found', 'No matches found')} />
    {/if}
    {#each picks || [] as pick, index (index)}
      {#if isHeader(pick)}
        <ListItem className="item-divider compact">
          {pick.replace(' :', '')}
        </ListItem>
      {:else}
        <ListItem
          style="min-height:40px;"
          compact
          clickable
          className="pl-3 pr-2 compact {active.indexOf(pick) > -1 ? 'bg-solid-1' : ''}"
          on:click={() => {
            toggle(pick)
          }}>
          <div class="flex items-center">
            {#if active.indexOf(pick) > -1}
              <NIcon
                name="checkmarkOutline"
                className="text-primary-500 mr-1"
                size={24} />
            {/if}
            <LabelMeta
              className="w-full justify-between"
              str={pick}
              titleClass={active.indexOf(pick) > -1 ? 'text-primary-bright' : 'text-inverse'} />
          </div>

        </ListItem>
        <hr class="divider center" />
      {/if}
    {/each}

    <div class="flex">
      <slot name="bottom" />
    </div>
  </div>
  <!-- <div class="value">{tempValue}</div>
  <input
    type="range"
    bind:value={tempValue}
    {min}
    {max}
    on:change={() => {
      dispatch('change', parseInt(tempValue));
    }} /> -->

</div>
