<script lang="ts">
  //svelte
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  // components
  import Item from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  // modules
  import locate from "../../modules/locate/locate";
  import distance from "../../modules/locate/distance";
  import Location from "../../modules/locate/Location";
  // stores
  import { Locations } from "../../store/locations";
  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";

  import tick from "../../utils/tick/tick";
  import Page from "../layout/page.svelte";
  import Button from "../../components/button/button.svelte";
  import Icon from "../../components/icon/icon.svelte";

  // props
  export let locations = [];

  export let records = [];

  export let small = undefined;
  export let picker = undefined;
  export let height = undefined;
  export let className = "";
  export let style = "";
  export let lock: boolean = false;
  export let hideFavorite: boolean = false;

  declare var L: any;

  // consts
  const dispatch = createEventDispatcher();
  const id = `map-${Math.random().toString().replace(".", "")}`;

  // Setup GeoCode SErvice
  const geocodeService = L.esri.Geocoding.geocodeService();

  // Leaflet Map Holder
  let MAP = undefined;
  let _el;
  let mapReady: boolean = false;

  // Local State
  let data = {
    locationName: null,
    activeLocation: locations[locations.length - 1] || null,
    locating: false,
    lat: null,
    lng: null,
    showLocations: false,
    height: `100px`,
  };

  let lastLocations;

  $: if (locations && JSON.stringify(locations) !== lastLocations) {
    try {
      lastLocations = JSON.stringify(locations);
      initAndRender();
    } catch (e) {
      console.error(`Location change error`, e.message);
    }
  }

  async function initAndRender() {
    try {
      await methods.init();
      methods.renderMap();
      mapReady = true;
    } catch (e) {
      mapReady = false;
      console.error(`init and render error`, e.message);
    }
  }

  $: if (!locations.length && records.length) {
    try {
      let locs = records
        .filter((r) => r.lat)
        .map((record) => {
          return {
            lat: record.lat,
            lng: record.lng,
            name: record.location,
            log: record,
          };
        });
      locations = locs;
    } catch (e) {
      console.error(`Location || record length reaction error`, e.mesasge);
    }
  }

  $: if (picker && MAP && locations.length == 0) {
    try {
      locate()
        .then((location: { latitude: number; longitude: number }) => {
          locations.push({
            lat: location.latitude,
            lng: location.longitude,
          });
          MAP.setView(L.latLng(location.latitude, location.longitude), 12);
        })
        .catch((e) => {});
    } catch (e) {
      console.error("Picker reaction error", e.message);
    }
  }

  async function selectSavedLocation() {
    let buttons = $Locations.map((loc: Location) => {
      return {
        title: loc.name,
        click: () => {
          methods.setLocation(loc);

          dispatch("change", loc);
        },
      };
    });

    Interact.popmenu({
      title: `${Lang.t("location.saved-locations", "Saved Locations")}`,
      buttons,
    });
  }

  // methods
  export let methods = {
    init() {
      if (_el) {
        data.height = _el.parentElement.clientHeight;
      }

      /** Initialize map **/
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          MAP = new L.Map(id).fitWorld();
          var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();

          let searchController = L.esri.Geocoding.geosearch({
            zoomToResult: true,
            placeholder: "Search",
            useMapBounds: 25,
            providers: [
              arcgisOnline,
              L.esri.Geocoding.mapServiceProvider({
                label: "States and Counties",
                url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer",
                layers: [2, 3],
                searchFields: ["NAME", "STATE_NAME"],
              }),
            ],
          });

          searchController.on("results", (data) => {
            if (data.latlng) {
              let location = new Location({
                lat: data.latlng.lat,
                lng: data.latlng.lng,
                name: data.text,
              });
              methods.setLocation(location);
            }
          });

          let moveTimeout;
          const onMove = () => {
            let center = MAP.getCenter();
            let lat = center.lat;
            let lng = center.lng;
            data.lat = lat;
            data.lng = lng;
            // Stop this from being called multiple times.

            /**
             * Fire the Move action -
             * encased so we can only do it so often
             **** */
            const fireMove = async () => {
              // let loc = await methods.getLocation(lat, lng);
              // data.locationName = loc.Match_addr;
              dispatch(
                "change",
                new Location({
                  ...MAP.getCenter(),
                  ...{ location: data.locationName },
                  ...{ name: data.locationName },
                })
              );
            };
            // Clear Timeout
            clearTimeout(moveTimeout);
            // Set 1s timeout
            moveTimeout = setTimeout(() => {
              // Fire Move
              fireMove();
            }, 1000);
          };

          // Clear any moveend listeners
          MAP.off("moveend", onMove);
          // If we're picking an address do the following
          if (picker) {
            // Add the Search Controller
            searchController.addTo(MAP);
            MAP.on("moveend", onMove);
          }

          // Clean up the layers
          MAP.eachLayer(function (layer) {
            MAP.removeLayer(layer);
          });

          // return map
          mapReady = true;
          resolve(MAP);
        } else {
          mapReady = false;
        } // end no map
      });
    },
    deleteLocation(location) {
      Interact.confirm(`${Lang.t("general.delete")} ${location.name}?`).then((res) => {
        if (res) {
          Locations.deleteByID(location.id);
        }
      });
    },
    editName(location) {
      Interact.prompt("Location Name", null, { value: location.name }).then((res) => {
        location.name = res;
        Locations.save(location);
      });
    },
    setLocation(location) {
      data.locationName = location.name;
      data.lat = location.lat;
      data.lng = location.lng;
      locations = [location];
      data.showLocations = false;
      MAP.setView(L.latLng(location.lat, location.lng), 12);
      dispatch("location", location);
    },
    /**
     * Save the current Location
     */
    saveLocation() {
      Locations.save(
        new Location({
          name: data.locationName,
          lat: data.lat,
          lng: data.lng,
        })
      ).then((loc) => {
        Interact.toast(`${Lang.t("general.saved", "Saved")}`);
      });
      // Locations.save({
      //   name: data.locationName,
      //   lat:
      // })
    },

    renderMap() {
      if (_el) {
        let mapTheme = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`;
        if (document.body.classList.contains("theme-dark")) {
          mapTheme = `https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png`;
        }
        // Add Attribution
        L.tileLayer(mapTheme, {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/">OSM</a> <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
          maxZoom: 18,
        }).addTo(MAP);

        var myIcon = L.icon({
          iconUrl: "/images/map/map-marker.svg",
          iconRetinaUrl: "/images/map/map-marker.svg",
          iconSize: [32, 32],
          iconAnchor: [9, 21],
          popupAnchor: [0, -14],
        });

        let latLngArray = locations.map((loc) => {
          return [loc.lat, loc.lng];
        });

        // Quick Add Marker Function
        let addMarker = (latLng, name, click) => {
          let mkr = new L.marker(latLng, {
            icon: myIcon,
          });
          // If location name is present (TODO) show it in a popup
          if (name) {
            mkr.bindPopup(name);
          }
          mkr.on("click", click);
          mkr.addTo(MAP);
        };

        /**
         * PIN RENDERING
         * If maxDistance between them is greater than 0.1 km
         */
        let maxDistance = distance.furthest(latLngArray);
        if (maxDistance > 0.4) {
          // Loop over locaitons provided in props
          locations.forEach((loc) => {
            addMarker([loc.lat, loc.lng], loc.name, () => {
              // On Marker Click
              data.activeLocation = loc;
              // If a log exists - show the Share Log popup
              if (loc.log) {
                Interact.shareLog(loc.log);
              }
            });
          });

          let connectTheDots = (data) => {
            // TODO: Look at making this curved dotted lines - and not just straight ones
            var c = [];
            data.forEach((location) => {
              c.push([location.lat, location.lng]);
            });
            return c;
          };
          //let pathLine =
          L.polyline(connectTheDots(locations), {
            color: "rgba(2.7%, 52.5%, 100%, 0.378)",
          }).addTo(MAP);
        } else {
          // Max Distance is not enough to justify rendering a bunch of pins
          if (locations.length) {
            addMarker([locations[0].lat, locations[0].lng], locations[0].name, () => {
              data.activeLocation = locations[0];
              if (data.activeLocation.log) {
                Interact.shareLog(data.activeLocation.log);
              }
            });
          }
        }

        // Make the map fit the bounds of all locations provided
        if (latLngArray.length) {
          MAP.fitBounds(latLngArray);
        }

        MAP.invalidateSize();
      }
    },
    getLocation(lat, lng) {
      return new Promise((resolve, reject) => {
        geocodeService
          .reverse()
          .latlng([lat, lng])
          .run((error, result) => {
            resolve((result || {}).address || "Unknown");
          });
      });
    },
  };

  // Reactive Location Lookup
  // $: getLocation = () => {
  //   return new Promise(resolve => {
  //     // If activeLocation is not null
  //     if (data.activeLocation) {
  //       // Look up lat long
  //       methods
  //         .getLocation(data.activeLocation.lat, data.activeLocation.lng)
  //         .then(address => {
  //           resolve(address);
  //         });
  //     } else {
  //       resolve(null);
  //     }
  //   });
  // };

  let check = 1;

  // On Mount
  onMount(async () => {
    initAndRender();
  });
</script>

<style lang="scss">
  $locationHeight: 40px;

  .n-map-container {
    background-color: var(--color-solid);
    position: relative;
    min-height: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    .n-map-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1;
    }
  }

  .n-map-container .location-name {
    position: absolute;
    bottom: 0px;
    left: 0px;
    right: 0px;
    font-weight: bold;
    font-size: 0.9em;
    height: $locationHeight;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;

    transition: height 0.2s ease-in-out;

    .row {
      margin: 0;
      flex-wrap: nowrap;
    }

    .locations {
      width: 100%;
    }

    &.expanded {
      .row {
        min-height: 50px;
      }
      z-index: 2001;
      max-height: 300px;
      flex-grow: 1;
      height: auto;
      max-height: 300px;
      overflow: scroll;
      padding: 0;
      .locations.list {
        border-top: solid 1px var(--color-faded);
        overflow-y: scroll;

        display: flex;
        flex-direction: column;
        align-content: stretch;

        .right {
          margin-left: 0px;
        }
      }
    }

    z-index: 1000;
    padding: 0px 5px;
    background-color: var(--color-solid);
    border-top: solid 1px var(--color-faded);
    color: var(--color-inverse);
    text-align: center;
    z-index: 2;
    box-shadow: 0px -6px 10px rgba(0, 0, 0, 0.1);
    .row {
      flex-grow: 1;
      flex-shrink: 1;
      align-items: center;
      justify-content: stretch;
      .name {
        text-align: left;
        width: calc(100% - 90px);
        margin: 0 auto;
        font-size: 0.7em;
        line-height: 0.8em;
        align-self: center;
        flex-grow: 1;
        flex-shrink: 1;
        padding: 0 4px;
      }
    }
  }

  .picker-cover {
    pointer-events: none;
    position: absolute;
    top: -27px;
    bottom: 0;
    left: 12px;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    svg {
      fill: red;
      opacity: 0.5;
    }
  }

  .map-lock-cover {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0);
    z-index: 2000;
  }

  .n-map-container .n-map {
    width: 100%;
    height: 100%;
    // min-height: 260px;
    flex-grow: 1;
    flex-shrink: 1;
    z-index: 100;
  }
  :global(.n-map-wrapper .favorites-button) {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 200;
    background-color: rgba(255, 255, 255, 0.7);
  }
</style>

<div
  bind:this={_el}
  class="{className} n-map-container {small ? 'small ' : ''}"
  style="{height ? `height: ${height}px;` : `min-height: ${data.height}px;`}
  {style}">
  {#if lock}
    <div class="map-lock-cover" />
  {/if}
  {#if picker}
    <div class="picker-cover">
      <div class="picker-target">
        <svg
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 60 60"
          height="120"
          style="enable-background:new 0 0 60 60;"
          xml:space="preserve">
          <g>
            <path
              d="M42,29h-5.08c-0.441-3.059-2.861-5.479-5.92-5.92V18c0-0.553-0.447-1-1-1s-1,0.447-1,1v5.08
              c-3.059,0.441-5.479,2.862-5.92,5.92H18c-0.553,0-1,0.447-1,1s0.447,1,1,1h5.08c0.441,3.059,2.861,5.479,5.92,5.92V42
              c0,0.553,0.447,1,1,1s1-0.447,1-1v-5.08c3.059-0.441,5.479-2.862,5.92-5.92H42c0.553,0,1-0.447,1-1S42.553,29,42,29z M30,35
              c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S32.757,35,30,35z" />
          </g>
        </svg>
      </div>
    </div>
  {/if}
  <div class="n-map-wrapper" style="bottom:{picker ? '1px' : '0'}">
    <div {id} class="n-map" />
    {#if picker && $Locations.length && !hideFavorite}
      <Button className="favorites-button tap-icon" shape="rounded" icon on:click={selectSavedLocation}>
        <Icon name="star" size="18" />
      </Button>
    {/if}
  </div>

</div>
