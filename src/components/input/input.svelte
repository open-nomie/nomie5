<script>
  import NIcon from "../icon/icon.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();

  export let label = null;
  export let placeholder = null;
  export let inputmode = undefined;
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
  export let accept = "png,jpeg,jpg,csv";

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

  export function getValue() {
    return _elInput.value;
  }

  let blur = () => {
    focused = false;
  };
  let focus = (event) => {
    focused = true;
    dispatch("focus", event);
  };
  let change = (evt) => {
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
    background-color: var(--color-solid);
    border-radius: 6px;
    border: solid 1px var(--color-faded-1);

    .helper {
      font-size: 0.65rem;
      opacity: 0.5;
      padding: 6px;
    }

    .select-arrow {
      margin-left: -50px;
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

    //   .n-input-container.with-label.compact .n-input-wrapper.has-input .n-input label {
    //   transform: translateY(-6px) !important;
    // }

    &.compact {
      .has-input {
        label {
          transform: translateY(-6px) !important;
          font-size: 0.7rem;
        }
      }
      // background-color: blue !important;
      .n-input-wrapper {
        min-height: 40px;
        height: 40px;
        .n-input {
          height: 40px;
          input,
          select,
          textarea {
            min-height: 40px;
            height: 40px;
            font-size: 0.8rem !important;
            background-color: var(--color-solid) !important;
          }
        }
      }
    }

    .n-input-wrapper {
      transition: all 0.2s ease-in-out;
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
      border-radius: 12px;
      &:before {
        transition: all 0.2s ease-in-out;
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
        pointer-events: none;
      }

      &.has-focus {
        &:before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          box-shadow: 0px 0px 1px 2px var(--color-primary);
          opacity: 0.3;
          border-radius: 6px;
        }
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
          padding-left: 8px;
          padding-right: 8px;
          background-color: transparent !important;
          outline: none;
          &:disabled {
            background-color: transparent !important;
            // color: var(--color-inverse-2);
            opacity: 0.7;
          }
          // border: none;
        }
        textarea {
          min-height: 90px;
          padding-top: 8px;
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
  <div class="n-input-wrapper {hasInput ? 'has-input' : 'no-input'} {focused ? 'has-focus' : 'no-focus'}">
    <slot name="left" />
    <div class="n-input">
      <label>{label || placeholder}</label>
      {#if type == 'email'}
        <input
          bind:this={_elInput}
          {disabled}
          {inputmode}
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
      {:else if type == 'file'}
        <input
          bind:this={_elInput}
          {disabled}
          {inputmode}
          type="file"
          style={inputStyle}
          class={inputClass}
          {pattern}
          {accept}
          bind:value
          {placeholder}
          on:keyup={change}
          on:focus={focus}
          on:blur={blur} />
      {:else if type == 'password'}
        <input
          bind:this={_elInput}
          {disabled}
          {inputmode}
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
          {inputmode}
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
          {inputmode}
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
    <slot name="right">
      {#if type == 'select'}
        <button class="btn btn-clear select-arrow">
          <NIcon name="chevronDown" />
        </button>
      {/if}
    </slot>

  </div>
  {#if help}
    <div class="helper">{help}</div>
  {/if}
</div>
