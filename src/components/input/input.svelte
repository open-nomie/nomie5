<script>
  import NIcon from '../icon/icon.svelte'
  import { createEventDispatcher, onMount } from 'svelte'

  const dispatch = createEventDispatcher()

  export let label = null
  export let placeholder = null
  export let inputmode = undefined
  export let value = null
  export let type = 'text'
  export let help = null
  export let className = ''
  export let style = ''
  export let inputStyle = ''
  export let inputClass = ''
  export let pattern = ''
  export let width = ''
  export let disabled = undefined
  export let solo = undefined
  export let listItem = undefined
  export let compact = undefined
  export let rows = 2
  export let accept = 'png,jpeg,jpg,csv'
  export let name = undefined

  export let autocomplete = undefined
  export let autocorrect = undefined
  export let autocapitalize = undefined
  export let autofocus = undefined

  let focused = false
  let hit = false
  let hasInput = false

  let _elInput

  export function doFocus() {
    _elInput.focus()
  }

  export function getValue() {
    return _elInput.value
  }

  let blur = () => {
    focused = false
  }
  let focus = (event) => {
    focused = true
    dispatch('focus', event)
  }
  let change = (evt) => {
    if (evt.key == 'Enter') {
      dispatch('enter', value)
    }
    dispatch('change', value)
  }

  $: if (value && `${value}`.length > 0) {
    hasInput = true
  } else {
    hasInput = false
  }

  onMount(() => {
    if (type == 'select') {
      hasInput = true
    }
    if (value && `${value}`.length) {
      hasInput = true
    }
    if (autofocus) {
      setTimeout(() => {
        _elInput.focus()
      }, 300)
    }
  })
</script>

<style global lang="postcss">
  .n-input-container.list-item div.n-input label {
    left: 20px !important;
    top: 10px !important;
  }
  .n-input-container.list-item .n-input-wrapper {
    border-radius: 0px !important;
  }
  .n-input-container {
    position: relative;
    width: auto;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
    margin-bottom: 4pt;
    margin-top: 4pt;
    @apply bg-white dark:bg-gray-800;
    border-radius: 6px;
    border: solid 1px var(--color-faded-1);
  }
  .n-input-container .helper {
    font-size: 0.65em;
    color: var(--color-grey-5);
    padding: 3px 6px;
    background-color: var(--color-grey-9);
  }
  .n-input-container.list-item {
    @apply bg-white dark:bg-gray-900;
    padding: 4px 12px;
    border-radius: 0;
    border: none;
  }
  .n-input-container .select-arrow {
    margin-left: -50px;
  }
  .n-input-container .select-wrap {
    position: relative;
  }
  .n-input-container.with-label .n-input-wrapper input,
  .n-input-container.with-label .n-input-wrapper select {
    min-height: 47px;
  }
  .n-input-container.with-label .n-input-wrapper.has-input .n-input label {
    transition: all 0.2s ease-in-out;
    opacity: 0.7;
    transform: translateY(0);
  }
  .n-input-container.with-label .n-input-wrapper.has-input .n-input input,
  .n-input-container.with-label .n-input-wrapper.has-input .n-input select {
    padding-top: 14px;
    padding-bottom: 0px;
    font-size: 1.05em;
  }
  .n-input-container.with-label .n-input-wrapper.has-input .n-input textarea {
    padding-top: 22px;
    padding-bottom: 0px;
    font-size: 1.05em;
  }
  .n-input-container.solo .n-input-wrapper {
    min-height: 48px;
  }
  .n-input-container.solo .n-input-wrapper .n-input {
    min-height: 48px;
  }
  .n-input-container.solo .n-input-wrapper .n-input input,
  .n-input-container.solo .n-input-wrapper .n-input select,
  .n-input-container.solo .n-input-wrapper .n-input textarea {
    min-height: 47px;
  }
  .n-input-container.solo.compact .n-input-wrapper {
    min-height: auto;
  }
  .n-input-container.solo.compact .n-input-wrapper .n-input {
    min-height: auto;
  }
  .n-input-container.compact .has-input label {
    transform: translateY(-3px) !important;
    font-size: 0.7em;
  }
  .n-input-container.compact .n-input-wrapper {
    min-height: 40px;
  }
  .n-input-container.compact .n-input-wrapper .n-input input,
  .n-input-container.compact .n-input-wrapper .n-input select,
  .n-input-container.compact .n-input-wrapper .n-input textarea {
    min-height: 40px;
    font-size: 0.8em !important;
    @apply bg-white dark:bg-gray-800;
  }
  .n-input-container .n-input-wrapper {
    transition: all 0.2s ease-in-out;
    min-height: 48px;
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
  }
  .n-input-container .n-input-wrapper:before {
    transition: all 0.2s ease-in-out;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    pointer-events: none;
  }
  .n-input-container .n-input-wrapper.has-focus:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: 0px 0px 1px 2px var(--color-primary);
    opacity: 0.3;
    border-radius: 6px;
  }
  .n-input-container .n-input-wrapper textarea,
  .n-input-container .n-input-wrapper input {
    border: none;
  }
  .n-input-container .n-input-wrapper .n-input {
    transition: all 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
    @apply text-black dark:text-white;
  }
  .n-input-container .n-input-wrapper .n-input label {
    transition: all 0.2s ease-in-out;
    line-height: 105%;
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
    font-size: 0.7em;
    position: absolute;
    top: 5px;
    left: 10px;
    margin: 0;
    padding: 0;
  }
  .n-input-container .n-input-wrapper .n-input input,
  .n-input-container .n-input-wrapper .n-input select,
  .n-input-container .n-input-wrapper .n-input textarea {
    width: 100%;
    transition: all 0.2s ease-in-out;
    margin: 0;
    padding-left: 8px;
    padding-right: 8px;
    background-color: transparent !important;
    outline: none;
  }
  .n-input-container .n-input-wrapper .n-input input:disabled,
  .n-input-container .n-input-wrapper .n-input select:disabled,
  .n-input-container .n-input-wrapper .n-input textarea:disabled {
    background-color: transparent !important;
    opacity: 0.7;
  }
  .n-input-container .n-input-wrapper .n-input textarea {
    min-height: 90px;
    padding-top: 8px;
    color: var(--color-inverse);
  }
</style>

<div
  class="n-input-container n-input-type-{type}
  {className}
  {compact ? 'compact' : ''}
  {listItem ? 'list-item' : ''}
  {solo ? 'solo' : 'with-label'}"
  style="{width ? `max-width:${width}; width:${width}; ` : ``}
  {style}">
  <div
    class="n-input-wrapper {hasInput ? 'has-input' : 'no-input'}
    {focused ? 'has-focus' : 'no-focus'}">
    <slot name="left" />
    <div class="n-input">
      {#if label || placeholder}
        <label for={name}>{label || placeholder}</label>
      {/if}
      {#if type == 'email'}
        <input
          bind:this={_elInput}
          {disabled}
          {inputmode}
          {name}
          type="email"
          style={inputStyle}
          class={inputClass}
          {pattern}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:input={change}
          on:change={(evt) => {
            dispatch('change', evt)
          }}
          on:focus={focus}
          on:blur={blur} />
      {:else if type == 'file'}
        <input
          bind:this={_elInput}
          {disabled}
          {inputmode}
          {name}
          type="file"
          style={inputStyle}
          class={inputClass}
          {pattern}
          {accept}
          bind:value
          {placeholder}
          on:change={(evt) => {
            dispatch('change', evt)
          }}
          on:input={change}
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
          on:input={change}
          on:focus={focus}
          on:blur={blur} />
      {:else if type == 'datetime-local'}
        <input
          bind:this={_elInput}
          {disabled}
          {inputmode}
          type="datetime-local"
          style={inputStyle}
          class={inputClass}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:input={change}
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
          on:input={change}
          on:focus={focus}
          on:blur={blur} />
      {:else if type == 'select'}
        <div class="select-wrap">
          <select bind:this={_elInput} {disabled} on:change={change} bind:value>
            <slot />
          </select>
          <NIcon
            name="chevronDown"
            className="fill-inverse-2 mr-3"
            size="16"
            style="position:absolute; right:4px; top:50%; transform:
            translateY(-50%); pointer-events:none" />
        </div>
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
          on:input={change}
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
          on:keyup={(evt) => {
            if (evt.key === 'Enter') {
              dispatch('enter', value)
            }
            dispatch('keyup', evt)
          }}
          on:input={change}
          on:focus={focus}
          on:blur={blur} />
      {/if}
    </div>
    <slot name="right" />
  </div>
  <slot name="bottom" />
  {#if help}
    <div class="helper">{help}</div>
  {/if}
</div>
