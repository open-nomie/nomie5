<script>
  import { onMount, onDestroy } from "svelte";

  import NMap from "../../containers/map/map.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NSortableList from "../../components/sortable-list/sortable-list.svelte";

  import { Interact } from "../../store/interact";
  import { Locations } from "../../store/locations";
  import Location from "../../modules/locate/Location";
  import locate from "../../modules/locate/locate";
  import math from "../../utils/math/math";
  import Text from "../../components/text/text.svelte";
  import { Lang } from "../../store/lang";
  import Button from "../../components/button/button.svelte";
  import Interactions from "../interactions/interactions.svelte";
  import Spinner from "../../components/spinner/spinner.svelte";

  const state = {
    locations: [],
    active: null,
    mode: "view",
    mapLocation: null,
    locating: false,
  };

  let unsub; // holder of the unsbuscribe object
  let map; // holder of the map object
  let changeTimeout;
  let lastLocation = null;
  let mapLocation = null;
  let showModal = false;

  function goto(location) {
    state.active = location;
    state.mapLocation = null;
  }

  let showFavoriteButton = false;

  $: if ($Interact.locationFinder.show) {
    showModal = true;
  } else {
    showModal = false;
  }

  /**
   * If Location changes
   */
  $: if (mapLocation || state.active) {
    let loc = !mapLocation ? new Location(state.active) : new Location(mapLocation);
    let exists = state.locations.find((l) => l.hash == loc.hash) ? true : false;
    showFavoriteButton = !exists;
  }

  async function sorted(evt) {
    let locations = evt.detail;
    if (locations.length > 0) {
      await Locations.write(locations);
    }
    return locations;
  }

  function mapChange(evt) {
    let location = evt.detail;
    if (lastLocation !== location.hash) {
      lastLocation = location.hash;
      mapLocation = location;
    }
  }

  async function unfavorite(location) {
    let confirmed = await Interact.confirm("Remove Location?", "You can add it later");
    if (confirmed) {
      return await Locations.deleteByID(location.id);
    } else {
      return null;
    }
  }

  async function currentLocation() {
    state.locating = true;
    try {
      let rawLoc = await locate();
      if (rawLoc) {
        let location = new Location({
          lat: rawLoc.latitude,
          lng: rawLoc.longitude,
          name: rawLoc.location,
        });
        select(location);
      }
    } catch (e) {
      Interact.error(`${Lang.t("location.unable-to-get-your-location", "Unable to get your location")}`);
    }
    state.locating = false;
  }

  async function rename(location) {
    let name = await Interact.prompt("New Name", null, {
      value: location.name,
    });
    if (name) {
      location.name = name;
      Locations.save(location);
    }
  }

  function select(location) {
    if ($Interact.locationFinder.onInteract) {
      $Interact.locationFinder.onInteract(location);
    }
    Interact.dismissPickLocation();
  }

  async function favorite() {
    let loc;
    if (mapLocation) {
      loc = mapLocation;
    } else if (state.active) {
      loc = state.active;
    }

    if (loc) {
      let name = await Interact.prompt("📍 Name this location", null, {
        value: loc.name,
      });
      loc.name = name;
      let saved = await Locations.save(loc);
    }
  }

  onMount(() => {
    unsub = Locations.subscribe((locations) => {
      state.locations = locations;
    });
  });

  onDestroy(() => {
    unsub();
  });
</script>

<NModal
  fullscreen
  flexBody
  show={showModal}
  closeOnBackgroundTap={true}
  on:close={() => {
    Interact.dismissPickLocation();
  }}>

  <header slot="header" class="n-toolbar-grid">
    <div class="left">
      {#if state.mode == 'edit'}
        <Button
          color="danger"
          type="clear"
          on:click={() => {
            state.mode = 'view';
          }}>
          Done
        </Button>
      {:else if state.locations.length}
        <Button
          color="primary-bright"
          type="clear"
          on:click={() => {
            state.mode = 'edit';
          }}>
          {Lang.t('general.edit', 'Edit')}
        </Button>
      {/if}
    </div>
    <main class="main truncate">
      <div class="truncate w-100">
        {#if state.active}
          {state.active.name}
        {:else if state.mapLocation}
          {state.mapLocation.lat},{state.mapLocation.lng}
        {:else}{Lang.t('location.pick-a-location', 'Pick a Location')}{/if}
      </div>
    </main>
    <div class="right flex">
      <Button type="clear" color="primary-bright" on:click={favorite}>{Lang.t('general.save', 'Save')}</Button>
    </div>
  </header>
  {#if showModal}
    <section class="n-panel vertical">
      <div className="n-panel" style="height:225px; border-bottom:var(--color-solid-2);">
        <!-- MAP -->
        <div style="height: 200px;">
          <NMap hideFavorite on:change={mapChange} locations={state.active ? [state.active] : []} picker={true} bind:this={map} />
        </div>
      </div>
      <!-- List Panel -->
      <div class="n-panel vertical bg-solid scroll-y h-100">
        {#if state.locations.length == 0}
          <NItem>
            <Text faded>{Lang.t('general.no-favorites-found', 'No Favorites Found')}</Text>
          </NItem>
        {/if}

        <NItem
          clickable
          disabled={state.locating}
          className="clickable text-primary"
          on:click={() => {
            currentLocation();
          }}>
          {#if !state.locating}
            {Lang.t('location.use-current-location', 'Use Current Location')}
          {:else}{Lang.t('location.locating', 'Locating...')}{/if}
          <div slot="right">
            {#if state.locating}
              <Spinner size="24" />
            {/if}
          </div>
        </NItem>
        {#if mapLocation && mapLocation.lat}
          <NItem
            clickable
            className="clickable text-primary"
            on:click={() => {
              select(mapLocation);
            }}>
            Select {math.round(mapLocation.lat, 10000)},{math.round(mapLocation.lng, 10000)}
          </NItem>
        {/if}

        <div class="list-wrapper">
          <NSortableList key="id" bind:items={state.locations} handle=".menu" on:update={sorted} let:item>

            <NItem
              clickable={state.mode != 'edit'}
              className="py-1"
              on:click={() => {
                if (state.mode == 'view') {
                  select(item);
                }
              }}>

              <div slot="left">
                {#if state.mode == 'edit'}
                  <div class="menu">
                    <NIcon name="menu" />
                  </div>
                {:else}
                  <div style="font-size:30px">📍</div>
                {/if}
              </div>

              <Text truncate2 className="title {state.active && item.hash == state.active.hash ? 'text-primary' : ''}">
                {item.name}
                {#if state.active && item.hash == state.active.hash}
                  <NIcon name="checkmark" className="fill-primary" />
                {/if}
              </Text>

              <div slot="right" class="flex">
                {#if state.mode == 'edit'}
                  <Button
                    icon
                    className="tap-icon"
                    on:click={() => {
                      rename(item);
                    }}>
                    <NIcon name="edit" />
                  </Button>
                  <Button
                    icon
                    on:click={(evt) => {
                      unfavorite(item);
                    }}>
                    <NIcon name="remove" className="fill-red" />
                  </Button>
                {/if}
              </div>

            </NItem>

          </NSortableList>
        </div>

      </div>
    </section>
  {/if}
  <div slot="footer">
    <Button block on:click={Interact.dismissPickLocation}>{Lang.t('general.close', 'Close')}</Button>
  </div>
</NModal>
