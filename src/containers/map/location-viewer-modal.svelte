<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import Button from "../../components/button/button.svelte";

  import Modal from "../../components/modal/modal.svelte";
  import type { ILocation } from "../../modules/locate/Location";
  import Location from "../../modules/locate/Location";
  import type NLog from "../../modules/nomie-log/nomie-log";
  import { Interact } from "../../store/interact";
  import { Locations } from "../../store/locations";
  import WhatsNewModal from "../whats-new/whats-new-modal.svelte";
  import Map from "./map.svelte";

  const dispatch = createEventDispatcher();

  export let show: boolean = false;
  export let locations: Array<ILocation>;
  export let logs: Array<NLog> = undefined;

  let match: Location;
  let loc: Location;

  async function saveUnknown() {
    if (loc) {
      let name: any = await Interact.prompt("Location Name", null);
      if (name) {
        loc.name = name;
        try {
          Locations.save(loc);
          match = loc;
        } catch (e) {
          Interact.error(e.message);
        }
      }
    }
  }

  async function main() {
    if (locations.length || logs.length) {
      let rows = locations.length ? locations : logs;
      loc = new Location({ lat: rows[0].lat, lng: rows[0].lng });
      match = Locations.findClosestTo(loc);
    }
  }

  onMount(main);
</script>

<Modal
  {show}
  fullscreen
  flexBody
  allowClose={true}
  title={match ? match.name : 'Unknown'}
  on:close={(evt) => {
    dispatch('close', evt);
  }}>
  <Map {locations} />
  <div class="mt-2" slot="footer" />
  <div slot="headerRight">
    {#if !match}
      <Button
        color="transparent"
        className="text-primary-bright mr-1"
        delay={0}
        on:click={() => {
          saveUnknown();
        }}>
        Save...
      </Button>
    {/if}
  </div>
</Modal>
