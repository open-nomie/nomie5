<script>
  import { createEventDispatcher } from "svelte";

  export let min = "0";
  export let max = "10";
  export let value = "5";

  let tempValue = value;

  const dispatch = createEventDispatcher();
</script>

<style lang="scss">
  input[type="range"] {
  }
  .tracker-input {
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
      margin: 20px 0;
      line-height: 2rem;
    }

    input[type="range"] {
      padding: 0 5px;
      margin: 0 auto;
      -webkit-appearance: none;
      width: 100%;
      margin: -5.5px 0;
    }
    input[type="range"]:focus {
      outline: none;
    }
    input[type="range"]::-webkit-slider-runnable-track {
      width: 100%;
      height: 50px;
      cursor: pointer;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
      background: rgba(48, 50, 52, 0.08);
      border-radius: 25px;
      border: 0px solid #010100;
    }
    input[type="range"]::-webkit-slider-thumb {
      box-shadow: 5.4px 5.4px 6.5px rgba(0, 0, 0, 0.18),
        0px 0px 5.4px rgba(13, 13, 13, 0.18);
      border: 1px solid rgba(0, 0, 0, 0.05);
      height: 39px;
      width: 40px;
      border-radius: 25px;
      background: #ffffff;
      cursor: pointer;
      -webkit-appearance: none;
      margin-top: 5.5px;
    }
    input[type="range"]:focus::-webkit-slider-runnable-track {
      background: rgba(60, 63, 65, 0.08);
    }
    input[type="range"]::-moz-range-track {
      width: 100%;
      height: 50px;
      cursor: pointer;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
      background: rgba(48, 50, 52, 0.08);
      border-radius: 25px;
      border: 0px solid #010100;
    }
    input[type="range"]::-moz-range-thumb {
      box-shadow: 5.4px 5.4px 6.5px rgba(0, 0, 0, 0.18),
        0px 0px 5.4px rgba(13, 13, 13, 0.18);
      border: 1px solid rgba(0, 0, 0, 0.05);
      height: 39px;
      width: 40px;
      border-radius: 25px;
      background: #ffffff;
      cursor: pointer;
    }
    input[type="range"]::-ms-track {
      width: 100%;
      height: 50px;
      cursor: pointer;
      background: transparent;
      border-color: transparent;
      color: transparent;
    }
    input[type="range"]::-ms-fill-lower {
      background: rgba(36, 37, 39, 0.08);
      border: 0px solid #010100;
      border-radius: 50px;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
    }
    input[type="range"]::-ms-fill-upper {
      background: rgba(48, 50, 52, 0.08);
      border: 0px solid #010100;
      border-radius: 50px;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
    }
    input[type="range"]::-ms-thumb {
      box-shadow: 5.4px 5.4px 6.5px rgba(0, 0, 0, 0.18),
        0px 0px 5.4px rgba(13, 13, 13, 0.18);
      border: 1px solid rgba(0, 0, 0, 0.05);
      width: 40px;
      border-radius: 25px;
      background: #ffffff;
      cursor: pointer;
      height: 39px;
    }
    input[type="range"]:focus::-ms-fill-lower {
      background: rgba(48, 50, 52, 0.08);
    }
    input[type="range"]:focus::-ms-fill-upper {
      background: rgba(60, 63, 65, 0.08);
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
