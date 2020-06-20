<script>
  import { onMount, onDestroy } from "svelte";

  import NMap from "../../containers/map/map.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NSearchBar from "../../components/search-bar/search-bar.svelte";
  import NSortableList from "../../components/sortable-list/sortable-list.svelte";

  import { Interact } from "../../store/interact";
  import { Locations } from "../../store/locations";
  import Location from "../../modules/locate/Location";
  import locate from "../../modules/locate/locate";
  import math from "../../utils/math/math";

  const state = {
    locations: [],
    active: null,
    mode: "view",
    mapLocation: null
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
    let loc = !mapLocation
      ? new Location(state.active)
      : new Location(mapLocation);
    let exists = state.locations.find(l => l.hash == loc.hash) ? true : false;
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
    let confirmed = await Interact.confirm(
      "Remove Location?",
      "You can add it later"
    );
    if (confirmed) {
      return await Locations.deleteByID(location.id);
    } else {
      return null;
    }
  }

  async function currentLocation() {
    let rawLoc = await locate();
    if (rawLoc) {
      let location = new Location({
        lat: rawLoc.latitude,
        lng: rawLoc.longitude,
        name: rawLoc.location
      });

      select(location);
    }
  }

  async function rename(location) {
    let name = await Interact.prompt("New Name", null, {
      value: location.name
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
        value: loc.name
      });
      loc.name = name;
      let saved = await Locations.save(loc);
    }
  }

  onMount(() => {
    unsub = Locations.subscribe(locations => {
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
        <button
          class="btn btn-clear text-red"
          on:click|preventDefault={() => {
            state.mode = 'view';
          }}>
          Done
        </button>
      {:else}
        <button
          class="btn btn-clear text-primary-bright"
          on:click={() => {
            state.mode = 'edit';
          }}>
          Edit
        </button>
      {/if}
    </div>
    <main class="main truncate">
      <div class="truncate w-100">
        {#if state.active}
          {state.active.name}
        {:else if state.mapLocation}
          {state.mapLocation.lat},{state.mapLocation.lng}
        {:else}Pick a Location{/if}
      </div>
    </main>
    <div class="right n-row">
      <button class="btn btn-clear text-primary-bright" on:click={favorite}>
        Save
      </button>
    </div>
  </header>
  {#if showModal}
    <section class="n-panel vertical">
      <div
        className="n-panel"
        style="height:225px; border-bottom:var(--color-solid-2);">
        <!-- MAP -->
        <NMap
          on:change={mapChange}
          locations={state.active ? [state.active] : []}
          picker={true}
          bind:this={map} />
      </div>
      <!-- List Panel -->
      <div class="n-panel vertical bg-solid scroll-y h-100">
        {#if state.locations.length == 0}
          <NItem class="text-faded-2">No Favorites Found</NItem>
        {/if}

        <div class="list-wrapper">
          <NSortableList
            bind:items={state.locations}
            handle=".menu"
            on:update={sorted}
            let:item>

            <NItem
              className="clickable"
              on:click={() => {
                if (state.mode == 'view') {
                  select(item);
                }
              }}>
              <div slot="right" class="n-row">
                {#if state.mode == 'view'}
                  <div style="font-size:30px">📍</div>
                {:else}
                  <button
                    class="btn btn-clear text-primary-bright btn-sm"
                    on:click|stopPropagation={() => {
                      rename(item);
                    }}>
                    <NIcon name="edit" />
                  </button>
                  <button
                    class="btn btn-clear text-primary-bright btn-sm"
                    on:click|stopPropagation={evt => {
                      unfavorite(item);
                    }}>
                    <NIcon name="remove" className="fill-red" />
                  </button>
                {/if}
              </div>

              <h1
                class="title truncate-2 {state.active && item.hash == state.active.hash ? 'text-primary' : ''}
                my-2">
                {item.name}
                {#if state.active && item.hash == state.active.hash}
                  <NIcon name="checkmark" className="fill-primary" />
                {/if}
              </h1>

              <div slot="left" class="pr-2 n-row">
                {#if state.mode == 'edit'}
                  <div class="menu">
                    <NIcon name="menu" />
                  </div>
                {/if}
              </div>
            </NItem>

          </NSortableList>
        </div>

        <!-- {#each state.locations as location}
        <NItem
          className="clickable"
          on:click={() => {
            goto(location);
          }}>
          <div slot="left" class="n-row">
            {#if state.mode == 'view'}
              <div style="font-size:30px">📍</div>
            {:else}
              <button
                class="btn btn-clear text-primary-bright btn-sm"
                on:click={() => {
                  rename(location);
                }}>
                <NIcon name="edit" />
              </button>
              <button
                class="btn btn-clear text-primary-bright btn-sm"
                on:click={evt => {
                  unfavorite(location);
                  evt.preventDefault();
                  evt.stopPropagation();
                }}>
                <NIcon name="delete" className="fill-red" />
              </button>
            {/if}
          </div>

          <h1 class="title truncate-2">{location.name}</h1>
          <div class="note">{location.hash}</div>
          <div slot="right" class="pr-2 n-row">
            {#if state.mode == 'view'}
              <button
                class="btn btn-clear text-primary-bright btn-sm"
                on:click={() => {
                  select(location);
                }}>
                Select
              </button>
            {:else}
              <div class="menu"><NIcon name="menu"></NIcon></div>
            {/if}
          </div>
        </NItem>
      {/each} -->
        <NItem
          className="clickable text-primary"
          on:click={() => {
            currentLocation();
          }}>
          Go to Current Location
        </NItem>
      </div>
    </section>

    <!-- <button
    slot="footer"
    class="btn btn-block btn-primary"
    disabled={!state.active}
    on:click={() => {
      if ($Interact.locationFinder.onInteract) {
        $Interact.locationFinder.onInteract(state.active);
      }
      Interact.dismissPickLocation();
    }}>
    Select
  </button> -->
  {/if}
  <button
    slot="footer"
    class="btn btn-block btn-primary"
    on:click={Interact.dismissPickLocation}>
    Close
  </button>
</NModal>
