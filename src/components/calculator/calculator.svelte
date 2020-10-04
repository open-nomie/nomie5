<script>
  // Inspirated by https://codepen.io/ethanryan/details/MryqXv

  // Math will do the calculatng
  import math from "../../utils/math/math";
  import _ from "lodash";
  import { tick, createEventDispatcher, onMount, onDestroy } from "svelte";
  import Button from "../button/button.svelte";
  import is from "../../utils/is/is";

  const dispatch = createEventDispatcher();

  let globalAnswer = "0"; //declaring global variable here... this is bad practice
  let buffer = [];
  let fontSize = 40;

  export let value = 0;
  export let displayFormat = undefined;
  export let defaultEphemeral = true;

  let tapped = false;

  onMount(() => {
    if (is.truthy(value)) {
      buffer = [value];
      change();
    }
  });

  const buttons = [
    ["C", "+/-", "%", "/"],
    [7, 8, 9, "*"],
    [4, 5, 6, "-"],
    [1, 2, 3, "+"],
    ["⌫", 0, ".", null],
  ];

  function handleKeydown(evt) {
    const key = evt.key;
    const valid = buttons.find((row) => {
      return row.find((b) => `${b}` === `${key}`);
    });
    if (valid) {
      insertBuffer(key);
    } else if (key == "Backspace") {
      insertBuffer("⌫");
    }
  }

  function change() {
    // buffer = buffer.filter((b) => is.truthy(b));

    if (buffer.length == 1) {
      globalAnswer = buffer[0];
    } else if (buffer.length) {
      globalAnswer = calculateBuffer();
    } else {
      globalAnswer = 0;
    }
    dispatch("change", globalAnswer);
    // if (globalAnswer != value) {
    //   dispatch("change", globalAnswer);
    // }
    getFontSize();
  }

  function calculateBuffer() {
    return math.calculate(buffer);
  }

  function click(input) {
    // If we should clear a default and one exists
    if (!tapped && is.truthy(value) && defaultEphemeral) {
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

  function deleteLast() {
    // buffer = _.dropRight(buffer);
    if (buffer.length) {
      let value = `${buffer[buffer.length - 1]}`;
      buffer[buffer.length - 1] = _.dropRight(value.split("")).join("");
      change();
    }
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
        case "⌫":
          deleteLast();
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
      grid-template-columns: 25% 25% 25% 25%;
      grid-template-rows: 60px 60px;
      .btn {
        width: 100%;
        font-weight: 600;
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

  @keyframes numberUp {
    from {
      transform: translateY(8px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
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

      span {
      }
    }
  }
  :global(.numberUp) {
    display: inline-block;
    animation: numberUp 0.4s ease-in-out;
    -webkit-animation: numberUp 0.4s ease-in-out;
  }
  :global(.n-calculator .btn) {
    touch-action: manipulation;
    border: none;
    color: var(--color-inverse);
    margin: 4px;
    border-radius: 50%;
    line-height: 100%;
    width: 64px;
    height: 64px;
    font-size: 26px;
  }
  :global(.n-calculator .btn.r-0) {
    color: var(--color-inverse-1);
    background-color: transparent;
  }
  :global(.n-calculator .btn.b-3) {
    color: var(--color-inverse-1);
    background-color: transparent;
  }
  :global(.n-calculator .btn.b-0.r-0) {
    color: var(--color-red);
    background-color: transparent;
  }
</style>

<svelte:window on:keydown={handleKeydown} />
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
    <div class="value" style="font-size:{fontSize}px">
      {#each globalAnswer.toString().split('') as bit}
        <span class="numberUp">{bit}</span>
      {/each}
    </div>
  </div>
  <div class="buttons">
    {#each buttons as buttonRow, rIndex}
      {#each buttonRow as button, bIndex}
        {#if button !== null}
          <Button
            shape="circle"
            color="light"
            size="lg"
            delay={0}
            className="r-{rIndex} b-{bIndex}"
            on:click={() => {
              click(button);
            }}>
            {button}
          </Button>
        {:else}
          <span class="empty" />
        {/if}
      {/each}
    {/each}
  </div>
</div>
