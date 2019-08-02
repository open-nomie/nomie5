<script>
  import { onMount } from "svelte";
  import locate from "../../modules/locate/locate";

  let location = null;
  let locating = false;
  let lookingUpWeather = false;
  let weather = null;

  onMount(async () => {
    locating = true;
    location = await locate();
    locating = false;
    if (location) {
      let forecastAPI = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}`;
      let weatherData;
      fetch(forecastAPI)
        .then(res => {
          return res.json();
        })
        .then(json => {
          weather = json;
        });
    }
  });
</script>

<div class="plugin-page plugin-weather p-3">
  {#if locating === true}
    Locating...
  {:else if location}
    Got your location {location.latitude}, {location.longitude}
    {#if lookingUpWeather}
      Looking up Weather
    {:else if weather}
      Got weather {JSON.stringify(weather)}
    {:else}Could not get weather{/if}
  {:else}Unable to get your location{/if}
</div>
