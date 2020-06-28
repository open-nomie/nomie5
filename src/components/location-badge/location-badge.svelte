<script>
  import { Locations } from "../../store/locations";
  import NIcon from "../icon/icon.svelte";

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
    {name}
  {:else}
    <NIcon name="pin" className="fill-white" style="margin:0 auto;" size="16" />
  {/if}
{/if}
