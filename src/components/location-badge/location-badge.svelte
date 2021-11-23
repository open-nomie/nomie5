<script lang="ts">
  import { Locations } from '../../store/locations'
  import NIcon from '../icon/icon.svelte'
  import textUtils from '../../utils/text/text'
  import Text from '../text/text.svelte'
  import { createEventDispatcher } from 'svelte'
  import Icon from '../icon/icon.svelte'
  import { LocationMarker } from 'svelte-hero-icons'
  export let location

  export let className = ''

  const dispatch = createEventDispatcher()

  let name = null
  let lat = null
  let lng = null

  $: if (location) {
    lat = location.lat
    lng = location.lng
    name = location.location
    if (!name) {
      let nearest = Locations.findClosestTo({ lat, lng })
      if (nearest && nearest.name) {
        name = nearest.name
      }
    }
  }
</script>

{#if location}
  <span
    class="flex items-center text-xs location-badge"
    on:click={(evt) => {
      dispatch('click', evt)
    }}>
    <Icon icon={LocationMarker} size={16} className="text-blue-600 mr-1" />
    {#if name}
      <span class="font-medium line-clamp-1">{name}</span>
    {/if}
  </span>
{/if}
