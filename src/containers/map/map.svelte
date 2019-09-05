<script>
  //svelte
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  // modules
  import locate from "../../modules/locate/locate";
  import distance from "../../modules/locate/distance";

  // props
  export let locations = [];

  export let small = undefined;
  export let picker = undefined;
  export let height = undefined;

  // consts
  const dispatch = createEventDispatcher();
  const id = `map-${Math.random()
    .toString()
    .replace(".", "")}`;

  // Setup GeoCode SErvice
  const geocodeService = L.esri.Geocoding.geocodeService();

  // Leaflet Map Holder
  let MAP = undefined;

  // Local State
  let data = {
    locationName: null,
    activeLocation: locations[locations.length - 1] || null,
    locating: false
  };

  $: if (locations) {
    setTimeout(() => {
      methods.init().then(() => {
        methods.renderMap();
      });
    });
  }

  if (!locations.length && picker) {
    locate().then(location => {
      locations = [
        {
          lat: location.latitude,
          lng: location.longitude
        }
      ];
      MAP.setView(L.latLng(location.latitude, location.longitude), 12);
    });
  }

  // methods
  let methods = {
    init() {
      /** Initialize map **/
      return new Promise((resolve, reject) => {
        if (!MAP) {
          MAP = new L.Map(id).fitWorld();
        }
        MAP.eachLayer(function(layer) {
          MAP.removeLayer(layer);
        });

        if (locations.length) {
          methods.getLocation(locations[0].lat, locations[0].lng).then(loc => {
            data.locationName = loc.Match_addr;
            data.locating = false;
          });
        }
        if (picker) {
          MAP.on("moveend", () => {
            let center = MAP.getCenter();
            let lat = center.lat;
            let lng = center.lng;
            // Stop this from being called multiple times.
            if (!data.locating) {
              data.locating = true;
              methods.getLocation(lat, lng).then(loc => {
                data.locationName = loc.Match_addr;
                data.locating = false;
              });
            }
            dispatch("change", {
              ...MAP.getCenter(),
              ...{ location: data.locationName }
            });
          });
        }

        resolve(MAP);
      });
    },
    renderMap() {
      let mapTheme = `https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png`;
      if (document.body.classList.contains("dark")) {
        mapTheme = `https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png`;
      }
      // Add Attribution
      L.tileLayer(mapTheme, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OSM</a> <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 18
      }).addTo(MAP);

      var myIcon = window.L.icon({
        iconUrl: "/images/map/map-marker.svg",
        iconRetinaUrl: "/images/map/map-marker.svg",
        iconSize: [32, 32],
        iconAnchor: [9, 21],
        popupAnchor: [0, -14]
      });

      let latLngArray = locations.map(loc => {
        return [loc.lat, loc.lng];
      });

      // Quick Add Marker Function
      let addMarker = (latLng, name, click) => {
        let mkr = new L.marker(latLng, {
          icon: myIcon
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
        locations.forEach(loc => {
          addMarker([loc.lat, loc.lng], loc.name, () => {
            data.activeLocation = loc;
          });
        });

        let connectTheDots = data => {
          // TODO: Look at making this curved dotted lines - and not just straight ones
          var c = [];
          data.forEach(location => {
            c.push([location.lat, location.lng]);
          });
          return c;
        };
        //let pathLine =
        window.L.polyline(connectTheDots(locations), {
          color: "rgba(2.7%, 52.5%, 100%, 0.378)"
        }).addTo(MAP);
      } else {
        // Max Distance is not enough to justify rendering a bunch of pins
        if (locations.length) {
          addMarker(
            [locations[0].lat, locations[0].lng],
            locations[0].name,
            () => {
              data.activeLocation = locations[0];
            }
          );
        }
      }

      // Make the map fit the bounds of all locations provided
      if (latLngArray.length) {
        MAP.fitBounds(latLngArray);
      }

      MAP.invalidateSize();
    },
    getLocation(lat, lng) {
      return new Promise((resolve, reject) => {
        geocodeService
          .reverse()
          .latlng([lat, lng])
          .run((error, result) => {
            resolve(result.address);
          });
      });
    }
  };

  // Reactive Location Lookup
  $: getLocation = () => {
    return new Promise(resolve => {
      // If activeLocation is not null
      if (data.activeLocation) {
        // Look up lat long
        methods
          .getLocation(data.activeLocation.lat, data.activeLocation.lng)
          .then(address => {
            resolve(address);
          });
      } else {
        resolve(null);
      }
    });
  };

  let check = 1;

  // On Mount
  onMount(() => {
    // methods.init().then(map => {
    //   // methods.renderMap();
    // });
  });
</script>

<style lang="scss">
  .n-map-container {
    background-color: var(--color-solid);
    position: relative;
    min-height: 100%;
    flex-grow: 1;
    .n-map-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    :global(.leaflet-control-attribution) {
      background: var(--color-solid-2) !important;
      color: var(--color-solid);
    }
  }

  .n-map-container .location-name {
    position: absolute;
    bottom: 6px;
    left: 6px;
    right: 6px;
    font-weight: bold;
    font-size: 1rem;
    line-height: 120%;
    z-index: 1000;
    padding: 12px 16px;
    border: 6px;
    background-color: var(--color-solid);
    border: solid 1px var(--color-faded);
    color: var(--color-inverse);
    border-bottom: none;
    text-align: center;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.12);
  }

  .picker-cover {
    pointer-events: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    svg {
      fill: red;
      opacity: 0.5;
    }
  }

  .n-map-container .n-map {
    width: 100%;
    height: 100%;
    // min-height: 260px;
    flex-grow: 1;
    flex-shrink: 1;
  }
</style>

<div
  class="n-map-container {small ? 'small ' : ''}"
  style="height:{height ? height + 'px' : ''}">
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
              d="M59,29h-2.025C56.458,14.907,45.093,3.542,31,3.025V1c0-0.553-0.447-1-1-1s-1,0.447-1,1v2.025
              C14.907,3.542,3.542,14.907,3.025,29H1c-0.553,0-1,0.447-1,1s0.447,1,1,1h2.025C3.542,45.093,14.907,56.458,29,56.975V59
              c0,0.553,0.447,1,1,1s1-0.447,1-1v-2.025C45.093,56.458,56.458,45.093,56.975,31H59c0.553,0,1-0.447,1-1S59.553,29,59,29z
              M31,54.975V53c0-0.553-0.447-1-1-1s-1,0.447-1,1v1.975C16.01,54.46,5.54,43.99,5.025,31H7c0.553,0,1-0.447,1-1s-0.447-1-1-1H5.025
              C5.54,16.01,16.01,5.54,29,5.025V7c0,0.553,0.447,1,1,1s1-0.447,1-1V5.025C43.99,5.54,54.46,16.01,54.975,29H53
              c-0.553,0-1,0.447-1,1s0.447,1,1,1h1.975C54.46,43.99,43.99,54.46,31,54.975z" />
            <path
              d="M42,29h-5.08c-0.441-3.059-2.861-5.479-5.92-5.92V18c0-0.553-0.447-1-1-1s-1,0.447-1,1v5.08
              c-3.059,0.441-5.479,2.862-5.92,5.92H18c-0.553,0-1,0.447-1,1s0.447,1,1,1h5.08c0.441,3.059,2.861,5.479,5.92,5.92V42
              c0,0.553,0.447,1,1,1s1-0.447,1-1v-5.08c3.059-0.441,5.479-2.862,5.92-5.92H42c0.553,0,1-0.447,1-1S42.553,29,42,29z
              M30,35
              c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S32.757,35,30,35z" />
          </g>
        </svg>
      </div>
    </div>
  {/if}
  <div class="n-map-wrapper">
    <div {id} class="n-map" />
  </div>

  {#if data.locationName}
    <div class="location-name truncate">{data.locationName}</div>
  {/if}

</div>
