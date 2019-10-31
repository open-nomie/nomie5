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

    $size: 60px;
    input[type="range"]::-webkit-slider-runnable-track {
      width: 100%;
      height: $size;
      cursor: pointer;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
      background: var(--color-faded);
      border-radius: $size * 0.5;
      padding: 0 6px;
      border: 1px solid var(--color-faded-2);
      position: relative;
    }
    // input[type="range"] {
    //   &:after {
    //     content: "hi";
    //     background-color: var(--color-primary);
    //     position: absolute;
    //     left: 0;
    //     top: 0;
    //     bottom: 0;
    //     width: 50%;
    //   }
    // }
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
      margin-top: 2px;
    }
    input[type="range"]:focus::-webkit-slider-runnable-track {
      background: var(--color-faded);
    }
    input[type="range"]::-moz-range-track {
      width: 100%;
      height: 50px;
      cursor: pointer;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
      background: var(--color-faded);
      border-radius: 25px;
      border: 0px solid var(--color-solid-2);
    }
    input[type="range"]::-moz-range-thumb {
      box-shadow: 5.4px 5.4px 6.5px rgba(0, 0, 0, 0.18),
        0px 0px 5.4px rgba(13, 13, 13, 0.18);
      border: 1px solid var(--color-inverse);
      height: 39px;
      width: 40px;
      border-radius: 25px;
      background: var(--color-solid-2);
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
      border: 0px solid var(--color-solid-2);
      border-radius: 50px;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
    }
    input[type="range"]::-ms-fill-upper {
      background: rgba(48, 50, 52, 0.08);
      border: 0px solid var(--color-solid-2);
      border-radius: 50px;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
    }
    input[type="range"]::-ms-thumb {
      box-shadow: 5.4px 5.4px 6.5px rgba(0, 0, 0, 0.18),
        0px 0px 5.4px rgba(13, 13, 13, 0.18);
      border: 1px solid rgba(0, 0, 0, 0.05);
      width: 40px;
      border-radius: 25px;
      background: var(--color-solid);
      cursor: pointer;
      height: 39px;
    }
    input[type="range"]:focus::-ms-fill-lower {
      background: rgba(48, 50, 52, 0.08);
    }
    input[type="range"]:focus::-ms-fill-upper {
      background: rgba(60, 63, 65, 0.08);
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
