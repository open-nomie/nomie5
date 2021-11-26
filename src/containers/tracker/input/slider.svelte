<script lang="ts">
  import LetterTicker from './../../../components/letter-ticker/letter-ticker.svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import Text from '../../../components/text/text.svelte'

  export let min = '0'
  export let max = '10'
  export let value = '5'
  export let tracker: any = undefined
  export let step = tracker ? tracker.step : '1'

  let tempValue
  $: tempValue = value

  const dispatch = createEventDispatcher()

  async function main() {
    // Trigger the change so the parent catches it.
    if (tempValue) {
      dispatch('change', parseInt(tempValue))
    }
  }

  onMount(main)
</script>

<style lang="postcss">
  .tracker-input-slider {
    position: relative;
    display: flex;
    flex: 1;
    flex-grow: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    @apply h-full;
  }
  .tracker-input-slider input[type='range'] {
    @apply bg-transparent;
  }
  .tracker-input-slider .value {
    text-align: center;
    margin: 0 0 20px 0;
    color: var(--color-inverse);
    position: absolute;
    bottom: 10px;
    z-index: 10;
  }
  .tracker-input-slider input[type='range'] {
    padding: 0 5px;
    margin: 0 auto;
    -webkit-appearance: none;
    width: 46vh;
    margin: -5.5px 0;
  }
  .tracker-input-slider input[type='range']:focus {
    outline: none;
  }
  .tracker-input-slider input[type='range']::-webkit-slider-runnable-track {
    width: 46vh;
    height: 100px;
    cursor: pointer;

    @apply bg-gray-500 dark:bg-black;
    border-radius: 50px;
    padding: 0 6px;
    @apply border border-gray-500;
    position: relative;
    margin-left: 20px;
  }
  .tracker-input-slider input[type='range']::-webkit-slider-thumb {
    height: 90px;
    width: 90px;
    border: solid 1px var(--color-faded-2);
    border-radius: 50px;
    background: var(--color-solid);
    box-shadow: var(--box-shadow-float);
    transform: rotate(90deg);
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: 4px;
  }
  .tracker-input-slider
    input[type='range']:focus::-webkit-slider-runnable-track {
    @apply ring-2 ring-primary-500;
  }
  .tracker-input-slider input[type='range']::-moz-range-track {
    width: 46vh;
    height: 100px;
    cursor: pointer;
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
    @apply bg-gray-200 dark:bg-gray-700;
    border-radius: 50px;
    border: 0px solid var(--color-solid-2);
  }
  .tracker-input-slider input[type='range']::-moz-range-thumb {
    box-shadow: 5.4px 5.4px 6.5px rgba(0, 0, 0, 0.18),
      0px 0px 5.4px rgba(13, 13, 13, 0.18);
    border: 1px solid var(--color-inverse);
    height: 90px;
    width: 90px;
    border-radius: 45px;
    @apply bg-white dark:bg-black;
    cursor: pointer;
  }
  .tracker-input-slider input[type='range'] {
    transform: rotate(-90deg);
  }
</style>

<div class="h-full tracker-input-slider">
  <div class="value">
    {#if tracker && tracker.uom !== 'num'}
      <LetterTicker
        text={`${tracker.displayValue(tempValue)}`}
        className="text-5xl font-bold text-gray-800 dark:text-white" />
      <!-- <h3 class="text-base text-gray-800 dark:text-white">{tempValue}</h3> -->
    {:else if tracker}
      <LetterTicker
        text={`${tempValue}`}
        className="text-5xl font-bold text-gray-800 dark:text-white" />
    {/if}
  </div>
  <input
    type="range"
    {step}
    bind:value={tempValue}
    {min}
    {max}
    on:change={() => {
      dispatch('change', parseInt(tempValue))
    }} />
  <div class="board-container" />
</div>
