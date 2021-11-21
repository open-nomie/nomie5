<script>
  import { createEventDispatcher } from "svelte";
  import EmojiList from "./EmojiList.svelte";
  import emojiData from "./data/emoji.js";

  export let searchText = "";

  const dispatch = createEventDispatcher();

  $: searchResults = emojiData.filter((emoji) =>
    emoji.names.find(
      (name) => name.indexOf((searchText || "").toLowerCase()) >= 0
    )
  );

  function onMouseOver() {
    dispatch("emojihover", null);
  }
</script>

<style lang="postcss" global>
  .svelte-emoji-picker__search-results {
    padding: 0.25em;
    height: 15rem;
  }

  .svelte-emoji-picker__search-results h3 {
    margin: 0;
    font-size: 0.9em;
    margin: 0 auto;
    color: #999999;
  }

  .svelte-emoji-picker__no-results {
    height: 15rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .svelte-emoji-picker__no-results .icon {
    margin: 0 auto;
    font-size: 3em;
    color: #999999;
  }
</style>

<div class="svelte-emoji-picker__search-results">
  {#if searchResults.length}
    <EmojiList
      emojis={searchResults}
      withTabs={false}
      on:emojihover
      on:emojiclick />
  {:else}
    <div class="svelte-emoji-picker__no-results" on:mouseover={onMouseOver}>
      <div class="icon">😭</div>
      <h3>No emojis found.</h3>
    </div>
  {/if}
</div>
