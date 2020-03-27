<script>
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();

  export let label = null;
  export let placeholder = null;
  export let value = null;
  export let type = "text";
  export let help = null;
  export let className = "";
  export let inputStyle = "";
  export let inputClass = "";
  export let pattern = "";
  export let width = "";
  export let disabled = false;

  let focused = false;
  let hit = false;
  let hasInput = false;

  let blur = () => {
    focused = false;
  };
  let focus = () => {
    focused = true;
    dispatch("focus");
  };
  let change = () => {
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
    .helper {
      font-size: 0.65rem;
      opacity: 0.5;
      padding: 6px;
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
      background-color: var(--color-faded-1);
      border-radius: 12px;
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
        }
      }

      &.has-focus {
        .n-input {
          border: solid 1px rgba($primaryBright, 0.6);
          box-shadow: var(--box-shadow-float);
          background-color: var(--color-solid);
        }
      }

      .n-input {
        // position: absolute;
        // top: 0;
        // right: 0;
        // left: 0;
        // bottom: 0;
        min-height: $height;
        width: 100%;
        min-width: 50px;
        max-width: 100%;
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
        select {
          transition: all 0.2s ease-in-out;
          min-height: $height - 1;
          margin: 0;
          padding: 10px 10px;
          background-color: transparent !important;
          outline: none;
          // border: none;
        }
      }
    }
  }
</style>

<div
  class="n-input-container {className}"
  style={width ? `max-width:${width}; width:${width}; ` : ``}>
  <div
    class="n-input-wrapper {hasInput ? 'has-input' : 'no-input'}
    {focused ? 'has-focus' : 'no-focus'}">
    <slot name="left" />
    <div class="n-input">
      <label>{label || placeholder}</label>
      {#if type == 'email'}
        <input
          {disabled}
          type="email"
          style={inputStyle}
          class={inputClass}
          bind:value
          {placeholder}
          on:change={change}
          on:focus={focus}
          on:blur={blur} />
      {:else if type == 'number'}
        <input
          {disabled}
          type="number"
          style={inputStyle}
          class={inputClass}
          bind:value
          {placeholder}
          on:change={change}
          on:focus={focus}
          on:blur={blur} />
      {:else if type == 'select'}
        <select {disabled} on:change={change} bind:value>
          <slot />
        </select>
      {:else}
        <input
          {disabled}
          type="text"
          style={inputStyle}
          class={inputClass}
          {pattern}
          bind:value
          {placeholder}
          on:change={change}
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
