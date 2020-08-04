<script>
  // Inspirated by https://codepen.io/ethanryan/details/MryqXv

  // Math will do the calculatng
  import math from "../../utils/math/math";

  import { tick, createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  let globalAnswer = "0"; //declaring global variable here... this is bad practice
  let buffer = [];
  let fontSize = 40;

  export let value = 0;
  export let displayFormat = undefined;
  export let defaultEphemeral = true;

  let tapped = false;

  onMount(() => {
    if (value) {
      buffer = [value];
      change();
    }
  });

  function change() {
    if (buffer.length == 1) {
      globalAnswer = buffer[0];
    } else if (buffer.length) {
      globalAnswer = calculateBuffer();
    } else {
      globalAnswer = 0;
    }
    if (globalAnswer != value) {
      dispatch("change", globalAnswer);
    }
    getFontSize();
  }

  const buttons = [
    ["C", "+/-", "%", "/"],
    [7, 8, 9, "*"],
    [4, 5, 6, "-"],
    [1, 2, 3, "+"],
    [null, 0, ".", null],
  ];

  function calculateBuffer() {
    return math.calculate(buffer);
  }

  function click(input) {
    // If we should clear a default and one exists
    if (!tapped && value && defaultEphemeral) {
      value = 0;
      clearBuffer();
      tapped = true;
    }
    insertBuffer(input);
  }

  function clearBuffer() {
    buffer = [];
  }

  function isNumber(input) {
    return !isNaN(input) && input !== null;
  }

  // Insert a key or operator into the buffer
  function insertBuffer(insert) {
    // Set last buffer
    let lastBuffer = buffer.length ? buffer[buffer.length - 1] : null;
    // if its a number and so is the last buffer - merge the nubmers
    if (isNumber(insert) && isNumber(lastBuffer)) {
      buffer[buffer.length - 1] = parseFloat(`${lastBuffer}${insert}`);
      change();
      // If the insert is a number and the last buffer - set the decimal
    } else if (isNumber(insert) && lastBuffer == ".") {
      let preDecimal = buffer[buffer.length - 2];
      let postDecimal = insert;
      if (!math.isFloat(preDecimal)) {
        buffer[buffer.length - 2] = `${preDecimal}.${postDecimal}`;
        buffer.pop();
      }
      change();
      // If the insert is a decimal - store it, but don't change anything
    } else if (isNumber(insert)) {
      buffer.push(insert);
      change();
    } else {
      switch (insert) {
        case "C":
          buffer = [];
          change();
          break;
        case "+/-":
          if (globalAnswer > 0) {
            buffer = [-Math.abs(globalAnswer)];
          } else {
            buffer = [Math.abs(globalAnswer)];
          }
          change();
          break;
        case "%":
          buffer = [globalAnswer / 100];
          change();
          break;
        default:
          if (["+", "*", "/", "-", "."].indexOf(insert) > -1) {
            buffer.push(insert);
            change();
          }
          break;
      }
    }
    buffer = buffer;
  }

  async function getFontSize() {
    await tick(10);
    let len = globalAnswer.toString().length;
    if (len < 10) {
      fontSize = 40;
    } else if (len >= 10 && len < 18) {
      fontSize = 30;
    } else {
      fontSize = 20;
    }
  }
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  .buttons {
    display: grid;
    justify-content: center;
    grid-template-areas:
      "main main main main"
      "main main main main"
      "main main main main"
      "main main main main"
      "main main main main";
    grid-template-columns: 70px 70px 70px 70px;
    grid-template-rows: 70px 70px;
  }
  @include media-breakpoint-down(xs) {
    .buttons {
      grid-template-columns: 50px 50px 50px 50px;
      grid-template-rows: 50px 50px;
      .btn {
        width: 45px;
        height: 45px;
      }
    }
  }
  @include media-breakpoint-up(sm) {
    .buttons {
      grid-template-columns: 80px 80px 80px 80px;
      grid-template-rows: 80px 80px;
      .btn {
        width: 75px;
        height: 75px;
      }
    }
  }
  .calc-screen {
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: black;
    border: solid 1px rgba(255, 255, 255, 0.1);
    color: white;
    text-align: right;
    border-radius: 4pt;
    padding: 4pt 8pt;
    padding-bottom: 4pt;
    width: 100%;
    margin: 0 auto 8pt;
    .value {
      line-height: 100%;
      height: 50px;
      text-align: right;
    }
    .preview {
      position: absolute;
      top: 4pt;
      left: 8pt;
      opacity: 0.8;
      color: #999;
      font-size: 0.8rem;
    }
    .buffer {
      height: 20px;
      min-height: 22px;
      font-size: 0.8rem;
      color: #999;
    }
  }
  .btn {
    touch-action: manipulation;
    background-color: dimgray;
    border: none;
    color: white;
    margin: 4px;
    border-radius: 50%;
    line-height: 100%;
    width: 64px;
    height: 64px;
    font-size: 26px;
  }
  .btn.r-0 {
    background-color: silver;
    color: black;
  }
  .btn.b-3 {
    background-color: var(--color-orange);
    color: #fff;
  }
  .btn.b-0.r-0 {
    background-color: var(--color-red);
    color: #fff;
  }
</style>

<div class="n-calculator">
  <div class="calc-screen">
    {#if displayFormat}
      <div class="preview">{displayFormat(globalAnswer)}</div>
    {/if}
    <div class="buffer">
      {#if buffer.length > 1}
        {#each buffer as bit}
          <span>{bit}</span>
        {/each}
      {/if}
    </div>
    <div class="value" style="font-size:{fontSize}px">{globalAnswer}</div>
  </div>
  <div class="buttons">
    {#each buttons as buttonRow, rIndex}
      {#each buttonRow as button, bIndex}
        {#if button !== null}
          <button
            class="btn r-{rIndex} b-{bIndex}"
            on:click={() => {
              click(button);
            }}>
            {button}
          </button>
        {:else}
          <span class="empty" />
        {/if}
      {/each}
    {/each}
  </div>
</div>
