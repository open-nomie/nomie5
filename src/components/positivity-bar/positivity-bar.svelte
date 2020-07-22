<script>
  import math from "../../utils/math/math";
  import { onMount } from "svelte";

  export let positive = 10;
  export let negative = 10;
  export let neutral = 30;
  export let className = "";
  export let style = "";
  export let height = "8pt";

  let positivity = [0, 0, 0];
  let negativeStyle = "";
  let neutralStyle = "";
  let positiveStyle = "";

  $: if (neutral | positive | negative) {
    main();
  }

  function main() {
    positivity = math.percentile([negative, neutral, positive]);
    negativeStyle = `width:${positivity[0]}%`;
    neutralStyle = `width:${positivity[1]}%`;
    positiveStyle = `width:${positivity[2]}%`;
  }
</script>

<style lang="scss">
  .positivity-bar {
    padding: 8pt 16px;
    .bar {
      display: flex;
      border-radius: 4pt;
      overflow: hidden;
      flex-direction: row;
    }
    .negative {
      background-color: var(--color-red);
      margin-right: 2px;
    }
    .positive {
      background-color: var(--color-green);
      margin-left: 2px;
    }
    .neutral {
      background-color: var(--color-primary-bright);
    }
    .unit {
      // border-radius: 4pt;
    }
  }
</style>

{#if negative || neutral || positive}
  <div class="positivity-bar {className}" {style}>
    <div class="bar" style="height:{height}">
      <div
        class="unit negative"
        data-score={negative}
        style={`height:${height}; ${negativeStyle}`} />
      <div
        class="unit neutral"
        data-score={neutral}
        style={`height:${height}; ${neutralStyle}`} />
      <div
        class="unit positive"
        data-score={positive}
        style={`height:${height}; ${positiveStyle}`} />
    </div>
  </div>
{/if}
