<script>
  import { Locations } from "../../store/locations";
  import NIcon from "../icon/icon.svelte";
  import textUtils from "../../utils/text/text";
  export let location;

  let name = null;
  let lat = null;
  let lng = null;

  $: if (location) {
    lat = location.lat;
    lng = location.lng;
    name = location.location;
    if (!name) {
      let nearest = Locations.findClosestTo({ lat, lng });
      if (nearest.name) {
        name = nearest.name;
      }
    }
  }
</script>

{#if location}
  {#if name}
    <div class="truncate">{name}</div>
  {:else}📍{/if}
{/if}
