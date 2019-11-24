<script>
  /**
   * Fuck - There are two keypads now.. This one for inputing a tracker value
   * and one for the pin-lock container - TODO: merge these some day
   */

  // Svelte
  import { tap } from "@sveltejs/gestures";
  import { createEventDispatcher, onMount } from "svelte";

  // utils
  import NomieUOM from "../../../utils/nomie-uom/nomie-uom";

  // Props
  export let value = undefined;
  export let tracker;

  // consts
  const dispatch = createEventDispatcher();

  const keys = [
    [1, 2, 3, "c"],
    [4, 5, 6, "±"],
    [7, 8, 9, null],
    [null, 0, ".", null]
  ];
  const data = {
    tempValue: (value || "") + "" || "",
    changed: false
  };

  // Methods
  const methods = {
    onPress(key) {
      // Confirm if the data has changed
      if (!data.changed) {
        data.tempValue = "";
        data.changed = true;
      }
      // Set a base holder
      let base;

      // Decimal Key
      if (key == "c") {
        data.tempValue = "";
      } else if (key == ".") {
        // Split it
        if (data.tempValue.split(".").length == 1) {
          data.tempValue = data.tempValue + ".";
        }

        // DElete Key
        // Lets handle Deletes
      } else if (key === "delete") {
        data.tempValue = (data.tempValue + "").substr(
          0,
          (data.tempValue + "").length - 1
        );

        //
        // Plus Minux Key
        // Lets positive negative
      } else if (key === "c") {
        data.tempValue = data.tempValue + "";

        //
        // Plus Minux Key
        // Lets positive negative
      } else if (key == "±") {
        base = parseFloat(data.tempValue);
        if (base > -1) {
          base = -base;
        } else {
          base = Math.abs(base);
        }

        base = isNaN(base) ? 0 : base;

        data.tempValue = base.toString();

        // * key = not currently used
      } else if (key === "*") {
        data.tempValue = data.tempValue + " * ";
        base = isNaN(base) ? 0 : base;
        base = data.tempValue;
        //
        // All Other Keys
        // This is for every other key press
      } else {
        data.tempValue = (data.tempValue || "").toString();
        // console.log("## KEYPAD ## GENERAL KEY ", key, data.tempValue, typeof data.tempValue);
        if (data.tempValue.substr(data.tempValue.length, 2) == ".0") {
          data.tempValue = data.tempValue.replace(".0", ".") + key;
        } else {
          data.tempValue = data.tempValue + "" + key;
        }
      }

      dispatch("change", parseFloat(data.tempValue));
    } // end keypress
  };
</script>

<style lang="scss">
  @import "../../../scss/utils/__utils.scss";
  @import "../../../scss/vendor/bootstrap/base";
  .keypad {
    width: 100%;
  }
  .dead-spot {
    opacity: 0;
    pointer-events: none;
  }
  .keypad-keys {
    margin: 20px 0;
  }
  button.button {
    touch-action: manipulation;
    min-width: 60px;
    min-height: 60px;
    transition: all 0.2s ease-in-out;
    &:active {
      transform: scale(0.9);
      transition: all 0.2s ease-in-out;
    }

    @include media-breakpoint-down(xs) {
      width: 60px;
      height: 60px;
      margin: 2px;
      border-radius: 30px;
    }
    @include media-breakpoint-up(sm) {
      width: 66px;
      height: 66px;
      margin: 5px;
      border-radius: 33px;
    }
    @include media-breakpoint-up(md) {
      width: 80px;
      height: 80px;
      margin: 6px;
      border-radius: 40px;
    }

    border: none;
    color: #fff;
    font-size: 26px;
    background-color: #666;
    text-align: cener;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2px;
  }
  .row {
    margin-bottom: 10px;
  }
  .row-0 .button-3 {
    background-color: $red;
  }
  .row-1 .button-3 {
    background-color: $orange;
  }
  .row-3 .button-2 {
    background-color: var(--color-faded-2);
    color: var(--color-inverse);
  }
  .screen {
    background-color: var(--color-faded-1);
    border-radius: 4px;
    padding: 4px 14px;
    h1 {
      color: var(--color-inverse);
      margin-top: 4px;
    }
    h6 {
      color: var(--color-faded-2);
    }
  }
</style>

<div class="tracker-input keypad">
  <div class="screen">
    <h1 class="mb-0">{data.tempValue || 0}</h1>
    {#if tracker.uom !== 'count' && tracker.uom}
      <h6 class="">
        {NomieUOM.format(parseFloat(data.tempValue) || 0, tracker.uom)}
      </h6>
    {/if}
  </div>
  <div class="keypad-keys">
    {#each keys as key, kindex}
      <div class="n-row row-{kindex} justify-content-center">
        {#each key as button, bindex}
          {#if button !== null}
            <button
              class="button button-{bindex}"
              on:click={() => {
                methods.onPress(button);
                return false;
              }}>
              {button}
            </button>
          {:else}
            <button class="dead-spot button button-{bindex}" />
          {/if}
        {/each}
      </div>
      <!-- end row-->
    {/each}

  </div>
</div>
