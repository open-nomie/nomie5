<script>
  import { createEventDispatcher } from "svelte";
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  const dispatch = createEventDispatcher();

  export let element;

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
</script>

{#if element}
  <button
    class="btn n-tracker-value-grid-button"
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
    <main class="truncate w-100">
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
