<script lang="ts">
  import { Locations } from "../../store/locations";
  import NIcon from "../icon/icon.svelte";
  import textUtils from "../../utils/text/text";
  import Text from "../text/text.svelte";
  import { createEventDispatcher } from "svelte";
  export let location;
  export let style = "";
  export let className = "";

  const dispatch = createEventDispatcher();

  let name = null;
  let lat = null;
  let lng = null;

  $: if (location) {
    lat = location.lat;
    lng = location.lng;
    name = location.location;
    if (!name) {
      let nearest = Locations.findClosestTo({ lat, lng });
      if (nearest && nearest.name) {
        name = nearest.name;
      }
    }
  }
</script>

{#if location}
  <span
    class="location-badge"
    on:click={(evt) => {
      dispatch('click', evt);
    }}>
    {#if name}
      <Text size="sm" bold className="text-primary {className}" {style} truncate>{name}</Text>
    {:else}📍{/if}
  </span>
{/if}
