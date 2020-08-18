<script lang="ts">
  import type { Widget } from "../../../modules/dashboard/widget";
  import Map from "../../map/map.svelte";
  export let widget: Widget;
</script>

{#if widget}
  <div class="map-value" style="width:100%;">
    <Map height={190} records={widget.stats.rows} />
  </div>
{/if}
