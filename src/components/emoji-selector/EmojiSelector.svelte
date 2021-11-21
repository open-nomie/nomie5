<style lang="postcss" global>
  .svelte-emoji-picker {
    background: var(--color-solid-0);
    @apply h-auto;
    @apply w-auto;
    @apply flex-grow;
    @apply flex-shrink;
    @apply max-w-full;
    @apply m-0;
    @apply shadow-md;
    @apply p-2;
    color: var(--color-solid-900);
  }

  .svelte-emoji-picker__emoji-tabs {
    padding: 0.25em;
    height: 15rem;
  }

  .svelte-emoji-picker__emoji-tabs
      .svelte-tabs
      ul.svelte-tabs__tab-list {
    display: flex;
  }

  .svelte-emoji-picker__emoji-tabs .svelte-tabs li.svelte-tabs__tab {
    flex-grow: 1;
  }

  .svelte-tabs__tab-list {
    border-bottom: solid 1px var(--color-solid-100) !important;
  }
</style>

<script>
  import { createEventDispatcher } from "svelte";

  import EmojiList from "./EmojiList.svelte";
  import EmojiSearch from "./EmojiSearch.svelte";
  import EmojiSearchResults from "./EmojiSearchResults.svelte";
  import VariantPopup from "./VariantPopup.svelte";

  import emojiData from "./data/emoji.ts";
  import ButtonGroup from "../button-group/button-group.svelte";


  export let maxRecents = 50;
  export let autoClose = true;

  let pickerEl;

  let variantsVisible = false;

  let variants;
  let currentEmoji;
  let selectedCategory;
  let searchText;
  let recentEmojis =
    JSON.parse(localStorage.getItem("recent-emojis")) || [];

  const dispatch = createEventDispatcher();

  const emojiCategories = {};
  emojiData.forEach((emoji) => {
    let categoryList = emojiCategories[emoji.category];
    if (!categoryList) {
      categoryList = emojiCategories[emoji.category] = [];
    }

    categoryList.push(emoji);
  });

  const categoryOrder = [
    "Smileys & People",
    "Animals & Nature",
    "Food & Drink",
    "Activities",
    "Travel & Places",
    "Objects",
    "Symbols",
    "Flags",
  ];

  const categoryIcons = {
    "Smileys & People": "😀",
    "Animals & Nature": "🐹",
    "Food & Drink": "🍟",
    Activities: "⚽️",
    "Travel & Places": "🏘",
    Objects: "💡",
    Symbols: "🎵",
    Flags: "🏴‍☠️",
  };

  function onKeyDown(event) {
    if (event.key === "Escape") {
      hidePicker();
    }
  }

  function showEmojiDetails(event) {
    currentEmoji = event.detail;
  }

  function onEmojiClick(event) {
    if (event.detail.variants) {
      variants = event.detail.variants;
      variantsVisible = true;
    } else {
      dispatch("emoji", event.detail.emoji);
      saveRecent(event.detail);
    }
  }

  function onVariantClick(event) {
    dispatch("emoji", event.detail.emoji);
    saveRecent(event.detail);
    hideVariants();

    if (autoClose) {
      hidePicker();
    }
  }

  function saveRecent(emoji) {
    recentEmojis = [
      emoji,
      ...recentEmojis.filter((recent) => recent.key !== emoji.key),
    ].slice(0, maxRecents);
    localStorage.setItem(
      "recent-emojis",
      JSON.stringify(recentEmojis)
    );
  }

  function hideVariants() {
    // We have to defer the removal of the variants popup.
    // Otherwise, it gets removed before the click event on the body
    // happens, and the target will have a `null` parent, which
    // means it will not be excluded and the clickoutside event will fire.
    setTimeout(() => {
      variantsVisible = false;
    });
  }

  let selectedIndex = 0;
</script>

<svelte:body on:keydown="{onKeyDown}" />

<!-- <button class="svelte-emoji-picker__trigger" bind:this={triggerButtonEl} on:click={togglePicker}>
  <Icon icon={smileIcon} />
</button> -->

<div
  class="relative svelte-emoji-picker"
  bind:this="{pickerEl}"
  on:keydown="{onKeyDown}"
>
  <EmojiSearch bind:searchText />
  {#if searchText}
    <EmojiSearchResults
      searchText="{searchText}"
      on:emojihover="{showEmojiDetails}"
      on:emojiclick="{onEmojiClick}"
    />
  {:else}
    <div class="svelte-emoji-picker__emoji-tabs">
      <ButtonGroup
        buttons="{[...[{ label: '⏰', active: selectedIndex == 0, click() {
                console.log('Recent');
                selectedIndex = 0;
                selectedCategory = undefined;
              } }], ...categoryOrder.map((category, index) => {
            return { active: selectedIndex == index + 1, label: categoryIcons[category], click() {
                selectedIndex = index + 1;
                selectedCategory = category;
              } };
          })]}"
      />

      {#if !selectedCategory}
        <EmojiList
          name="Recently Used"
          emojis="{recentEmojis}"
          on:emojihover="{showEmojiDetails}"
          on:emojiclick="{onEmojiClick}"
        />
      {:else}
        <EmojiList
          name="{selectedCategory}"
          emojis="{emojiCategories[selectedCategory]}"
          on:emojihover="{showEmojiDetails}"
          on:emojiclick="{onEmojiClick}"
        />
      {/if}
    </div>
  {/if}

  {#if variantsVisible}
    <VariantPopup
      variants="{variants}"
      on:emojiclick="{onVariantClick}"
      on:close="{hideVariants}"
    />
  {/if}
</div>
