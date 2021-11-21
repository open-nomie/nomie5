<script>
  import { onMount } from "svelte";
  import Icon from "../icon/icon.svelte";

  export let searchText = "";

  let searchField;

  onMount(() => {
    // searchField.focus();
  });

  function clearSearchText() {
    searchText = "";
    searchField.focus();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape" && searchText) {
      clearSearchText();
      event.stopPropagation();
    }
  }
</script>

<style lang="postcss" global>
  .svelte-emoji-picker__search {
    padding: 0.25em;
    position: relative;
  }

  .svelte-emoji-picker__search input {
    @apply w-full;
    @apply text-sm;
    @apply px-2;
    @apply py-2;
    background-color: var(--color-solid-50);
    color: var(--color-solid-900);
    @apply rounded-lg;
  }

  .svelte-emoji-picker__search input:focus {
    outline: none;
    border-color: #4f81e5;
  }

  .icon {
    color: var(--color-solid-200);
    @apply absolute;
    
    right: 0.85rem;
    top: 0.85rem;
    
  }

  .icon.clear-button {
    cursor: pointer;
  }
</style>

<div class="svelte-emoji-picker__search">
  <input
    type="text"
    class="border-gray-500 border border-opacity-20"
    autocapitalize="false"
    autocomplete="false"
    placeholder="Search emojis..."
    bind:value={searchText}
    bind:this={searchField}
    on:keydown={handleKeyDown} />

  {#if searchText}
    <span
      class="icon clear-button"
      role="button"
      on:click|stopPropagation={clearSearchText}><Icon name="close" /></span>
  {:else}
    <span class="icon"><Icon name="search" size={18} /></span>
  {/if}
</div>
