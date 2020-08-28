<script lang="ts">
  import { Locations } from "../../store/locations";
  import NIcon from "../icon/icon.svelte";
  import textUtils from "../../utils/text/text";
  import Text from "../text/text.svelte";
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
      if (nearest && nearest.name) {
        name = nearest.name;
      }
    }
  }
</script>

{#if location}
  {#if name}
    <Text size="sm" bold className="text-primary">{name}</Text>
  {:else}📍{/if}
{/if}
