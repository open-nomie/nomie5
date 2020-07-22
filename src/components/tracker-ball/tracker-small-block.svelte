<script>
  import { createEventDispatcher } from "svelte";
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  const dispatch = createEventDispatcher();

  export let element;
  export let style = "";
  export let truncate = false;
  export let solo = false;
  export let xs = false;
  export let novalue = false;

  let hasEmojiSlot = arguments[1].$$slots || {}.emoji;

  function shouldShowValue(trackerElement) {
    if (trackerElement.obj && trackerElement.obj.type == "picker") {
      return false;
    } else if (trackerElement.obj && trackerElement.obj.type == "tick") {
      return trackerElement.value !== 1;
    } else if (trackerElement.obj) {
      return true;
    } else {
      return false;
    }
  }
  // console.log("element", element);
</script>

{#if element}
  <button
    {style}
    class="btn n-tracker-value-grid-button {solo ? 'solo' : ''}
    {xs ? 'size-xs' : ''}
    {novalue ? 'novalue' : ''}
    "
    on:click={event => {
      event.preventDefault();
      event.stopPropagation();
      dispatch('click', element);
      return false;
    }}>
    {#if hasEmojiSlot}
      <slot name="emoji" />
    {:else}
      <span
        class="emoji"
        style={`color:${(element.obj || {}).color || '#CCC'}`}>
        {(element.obj || {}).emoji || '⚪️'}
      </span>
    {/if}
    <main class="{truncate ? 'truncate' : ''} w-100">
      <div class="label text-inverse">
        {(element.obj || {}).label || element.id}
      </div>

      {#if shouldShowValue(element)}
        <div class="value text-inverse">
          {NomieUOM.format(element.value, (element.obj || {}).uom)}
        </div>
      {/if}
    </main>
  </button>
{/if}
