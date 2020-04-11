<script>
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();

  export let label = null;
  export let placeholder = null;
  export let value = null;
  export let type = "text";
  export let help = null;
  export let className = "";
  export let style = "";
  export let inputStyle = "";
  export let inputClass = "";
  export let pattern = "";
  export let width = "";
  export let disabled = false;
  export let solo = false;
  export let compact = false;
  export let rows = 2;

  export let autocomplete = undefined;
  export let autocorrect = undefined;
  export let autocapitalize = undefined;

  let focused = false;
  let hit = false;
  let hasInput = false;

  let _elInput;

  export function doFocus() {
    _elInput.focus();
  }

  let blur = () => {
    focused = false;
  };
  let focus = () => {
    focused = true;
    dispatch("focus");
  };
  let change = evt => {
    if (evt.key == "Enter") {
      dispatch("enter", value);
    }
    dispatch("change", value);
  };

  $: if (value !== null && (value || "").length > 0) {
    hasInput = true;
  } else {
    hasInput = false;
  }

  onMount(() => {
    if (type == "select") {
      hasInput = true;
    }
    // console.log("Input mounted", hasInput, value);
  });
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  $height: 54px;

  .n-input-container {
    position: relative;
    width: auto;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
    margin-bottom: 4pt;
    margin-top: 4pt;

    .helper {
      font-size: 0.65rem;
      opacity: 0.5;
      padding: 6px;
    }

    &.with-label {
      // background-color: pink !important;
      .n-input-wrapper {
        input,
        select {
          min-height: $height - 1;
        }
        &.has-input {
          .n-input {
            label {
              transition: all 0.2s ease-in-out;
              opacity: 0.4;
              transform: translateY(0);
            }
            input,
            select {
              padding-top: 14px;
              padding-bottom: 0px;
              font-size: 1.05rem;
            }
            textarea {
              padding-top: 22px;
              padding-bottom: 0px;
              font-size: 1.05rem;
            }
          }
        }
      }
    } // end with-label

    &.solo {
      // background-color: blue !important;
      .n-input-wrapper {
        height: $height;
        .n-input {
          height: $height;
          input,
          select,
          textarea {
            height: $height - 1;
          }
        }
      }
    }

    &.solo.compact {
      // background-color: blue !important;
      .n-input-wrapper {
        height: 36px;
        .n-input {
          height: 36px;
          input,
          select,
          textarea {
            height: 35px;
            font-size: 1rem;
          }
        }
      }
    }

    .n-input-wrapper {
      // position: relative;
      min-height: $height;
      display: flex;
      width: 100%;
      min-width: 50px;
      max-width: 100%;
      flex-direction: row;
      align-items: center;
      flex-grow: 1;
      flex-shrink: 1;
      transition: all 0.2s ease-in-out;
      background-color: var(--color-solid-half);
      border-radius: 12px;
      border: solid 1px var(--color-faded-1);

      &.has-focus {
        box-shadow: 0px 3px 7px -2px rgba($primaryBright, 0.1);
        background-color: var(--input-focus-background);
      }

      textarea {
        border: none;
      }

      .n-input {
        // width: 100%;
        // min-width: 50px;
        // max-width: 100%;
        transition: all 0.2s ease-in-out;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        flex-shrink: 1;

        color: var(--color-inverse);

        label {
          transition: all 0.2s ease-in-out;
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
          font-size: 0.7rem;
          position: absolute;
          top: 8px;
          left: 10px;
          margin: 0;
          padding: 0;
        }
        input,
        select,
        textarea {
          width: 100%;
          transition: all 0.2s ease-in-out;
          margin: 0;
          padding-left: 8pt;
          padding-right: 8pt;
          background-color: transparent !important;
          outline: none;
          &:disabled {
            background-color: transparent !important;
            color: var(--color-inverse-2);
          }
          // border: none;
        }
        textarea {
          min-height: 90px;
          padding-top: 8pt;
          color: var(--color-inverse);
        }
      }
    }
  }
</style>

<div
  class="n-input-container {className}
  {compact ? 'compact' : ''}
  {solo ? 'solo' : 'with-label'}"
  style="{width ? `max-width:${width}; width:${width}; ` : ``}
  {style}">
  <div
    class="n-input-wrapper {hasInput ? 'has-input' : 'no-input'}
    {focused ? 'has-focus' : 'no-focus'}">
    <slot name="left" />
    <div class="n-input">
      <label>{label || placeholder}</label>
      {#if type == 'email'}
        <input
          bind:this={_elInput}
          {disabled}
          type="email"
          style={inputStyle}
          class={inputClass}
          {pattern}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:keyup={change}
          on:focus={focus}
          on:blur={blur} />
      {:else if type == 'password'}
        <input
          bind:this={_elInput}
          {disabled}
          type="password"
          style={inputStyle}
          class={inputClass}
          {pattern}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:keyup={change}
          on:focus={focus}
          on:blur={blur} />
      {:else if type == 'number'}
        <input
          bind:this={_elInput}
          {disabled}
          type="number"
          style={inputStyle}
          class={inputClass}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:keyup={change}
          on:focus={focus}
          on:blur={blur} />
      {:else if type == 'select'}
        <select bind:this={_elInput} {disabled} on:change={change} bind:value>
          <slot />
        </select>
      {:else if type == 'textarea'}
        <textarea
          bind:this={_elInput}
          {disabled}
          {rows}
          style={inputStyle}
          class={inputClass}
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:keyup={change}
          on:focus={focus}
          on:blur={blur}
          bind:value />
        <slot />
      {:else}
        <input
          bind:this={_elInput}
          {disabled}
          type="text"
          style={inputStyle}
          class={inputClass}
          {pattern}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:keyup={change}
          on:focus={focus}
          on:blur={blur} />
      {/if}
    </div>
    <slot name="right" />

  </div>
  {#if help}
    <div class="helper">{help}</div>
  {/if}
</div>
