<script>
  import { onMount, onDestroy } from "svelte";

  import NMap from "../../containers/map/map.svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NSearchBar from "../../components/search-bar/search-bar.svelte";

  import { Interact } from "../../store/interact";
  import { Locations } from "../../store/locations";

  import math from "../../utils/math/math";

  const state = {
    locations: [],
    active: null,
    mode: "view"
  };
  let unsub; // holder of the unsbuscribe object
  let map; // holder of the map object

  function goto(location) {
    state.active = location;
    console.log("map", map);
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

  function search(searchTerm) {
    console.log("Search", searchTerm.detail);
  }

  async function save() {
    let name = await Interact.prompt("📍 Location Name", null, {
      value: state.active.name
    });
    state.active.name = name;
    Locations.save(state.active);
  }

  onMount(() => {
    console.log("Location Modal Mounted");
    unsub = Locations.subscribe(locations => {
      state.locations = locations;
    });
  });

  onDestroy(() => {
    unsub();
  });
</script>

<NModal fullscreen flexBody>
  <header slot="header" class="n-toolbar-grid">
    <div class="left">
      {#if state.mode == 'edit'}
        <button
          class="btn btn-clear text-red"
          on:click={() => {
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
        {state.active ? state.active.name : 'Pick a location'}
      </div>
    </main>
    <div class="right n-row">
      {#if state.active && !state.locations.find(loc => {
          console.log(`${loc.lat} ${state.active.lat}`);
          return loc.lat == state.active.lat && loc.lng == state.active.lng;
        })}
        <button class="btn btn-clear text-primary-bright" on:click={save}>
          Favorite
        </button>
      {/if}
    </div>
  </header>
  <section class="n-panel vertical">
    <div className="n-panel" style="height:225px">
      <!-- <NSearchBar
        className="top transparent"
        on:change={e => {
          search(e);
        }} /> -->
      <NMap
        on:change={event => {}}
        on:location={event => {
          state.active = event.detail;
        }}
        locations={state.active ? [state.active] : []}
        picker={true}
        bind:this={map} />
    </div>

    <div class="n-panel vertical n-list bg-solid scroll-y">
      {#if state.locations.length == 0}
        <NItem>No Favorited Locations</NItem>
      {/if}
      {#each state.locations as location}
        <NItem
          className="clickable"
          on:click={() => {
            goto(location);
          }}>
          <div slot="left" style="font-size:30px">📍</div>
          <h1 class="title truncate-2">{location.name}</h1>
          <div class="note">
            {math.round(location.lat)},{math.round(location.lng)}
          </div>
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
        </NItem>
      {/each}
    </div>
  </section>

  <button
    slot="footer"
    class="btn btn-lg btn-block btn-clear"
    on:click={Interact.dismissPickLocation}>
    Close
  </button>
  <!-- <button
    slot="footer"
    class="btn btn-lg btn-block btn-primary"
    on:click={() => {
      if ($Interact.locationFinder.onInteract) {
        $Interact.locationFinder.onInteract($Interact.locationFinder.location);
      }
      Interact.dismissPickLocation();
    }}>
    Select
  </button> -->
</NModal>
