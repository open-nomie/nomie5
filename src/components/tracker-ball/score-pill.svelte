<script>
  export let positivity = 0;
  export let score = 0;

  let changed = false;

  let lastScore;
  $: if (score !== lastScore) {
    lastScore = score;
    changed = true;
    setTimeout(() => {
      changed = false;
    }, 500);
  }
</script>

<style lang="scss">
  @import "../../scss/utils/__utils.scss";

  .score.negative {
    background-color: var(--color-red);
    box-shadow: 0px 10px 10px -5px rgba($red, 0.4) !important;
  }
  .score.positive {
    background-color: var(--color-green);
    box-shadow: 0px 10px 10px -5px rgba($green, 0.4) !important;
  }
  .score {
    transition: all 0.2s ease-in-out;
    $scoreSize: 26px;
    position: absolute;
    top: 8px;
    left: 8px;
    height: $scoreSize;
    min-width: $scoreSize;
    border-radius: $scoreSize * 0.5;
    padding: 0 6px;
    line-height: $scoreSize;
    text-align: center;
    font-size: $scoreSize * 0.5;
    background-color: var(--color-primary-bright);
    box-shadow: 0px 10px 10px -5px rgba($primaryBright, 0.4);
    font-weight: bold;
    color: #fff;
    z-index: 100;
    &.negative {
      background-color: var(--color-red);
    }
    &.changed {
      transform: translateX(10px) scale(1.3);
    }
    &.popin {
      &.hidden {
        opacity: 0;
        transform: scale(0);
      }
    }
  }
</style>

<div
  class={`${changed ? 'changed' : ''} score animate popin ${positivity < 0 ? 'negative' : ''} ${positivity > 0 ? 'positive' : ''} ${score ? 'visible' : 'hidden'}`}>
  {score}
</div>
