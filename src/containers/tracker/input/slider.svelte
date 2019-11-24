<script>
  import { createEventDispatcher } from "svelte";

  export let min = "0";
  export let max = "10";
  export let value = "5";

  let tempValue;

  $: tempValue = value;

  const dispatch = createEventDispatcher();
</script>

<style lang="scss">
  input[type="range"] {
    background-color: var(--color-solid);
  }
  .tracker-input {
    position: relative;
    display: flex;
    flex: 1;
    flex-grow: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    max-height: 100%;
    min-height: 200px;

    .value {
      text-align: center;
      font-weight: bold;
      font-size: 2rem;
      margin: 0 0 20px 0;
      line-height: 2rem;
      color: var(--color-inverse);
      position: absolute;
      bottom: 10px;
      z-index: 10;
    }

    input[type="range"] {
      padding: 0 5px;
      margin: 0 auto;
      -webkit-appearance: none;
      width: 46vh;
      margin: -5.5px 0;
    }
    input[type="range"]:focus {
      outline: none;
    }

    $size: 100px;
    input[type="range"]::-webkit-slider-runnable-track {
      width: 46vh;
      height: $size;
      cursor: pointer;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
      background: var(--color-faded);
      border-radius: $size * 0.5;
      padding: 0 6px;
      border: 1px solid var(--color-faded-2);
      position: relative;
      margin-left: 20px;
    }
    input[type="range"]::-webkit-slider-thumb {
      height: $size * 0.9;
      width: $size * 0.9;
      border: solid 1px var(--color-faded-2);
      border-radius: $size * 0.5;
      background: var(--color-solid);
      box-shadow: var(--box-shadow-float);
      transform: rotate(90deg);
      cursor: pointer;
      -webkit-appearance: none;
      margin-top: 4px;
    }
    input[type="range"]:focus::-webkit-slider-runnable-track {
      background: var(--color-faded);
    }
    input[type="range"]::-moz-range-track {
      width: 46vh;
      height: $size;
      cursor: pointer;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
      background: var(--color-faded);
      border-radius: $size * 0.5;
      border: 0px solid var(--color-solid-2);
    }
    input[type="range"]::-moz-range-thumb {
      $trackSize: $size * 0.9;
      box-shadow: 5.4px 5.4px 6.5px rgba(0, 0, 0, 0.18),
        0px 0px 5.4px rgba(13, 13, 13, 0.18);
      border: 1px solid var(--color-inverse);
      height: $size * 0.9;
      width: $size * 0.9;
      border-radius: $trackSize * 0.5;
      background: var(--color-solid-2);
      cursor: pointer;
    }

    input[type="range"] {
      transform: rotate(-90deg);
    }
  }
</style>

<div class="tracker-input slider">
  <div class="value">{tempValue}</div>
  <input
    type="range"
    bind:value={tempValue}
    {min}
    {max}
    on:change={() => {
      dispatch('change', parseInt(tempValue));
    }} />

</div>
