<script>
  import { createEventDispatcher } from "svelte";
  // Components
  import NTagBadge from "../tag-badge/tag-badge.svelte";

  //Utils
  import extractor from "../../utils/extract/extract";

  // Modules
  import Tracker from "../../modules/tracker/tracker";

  // Props
  export let note = "";
  export let trackers = {};
  export let className = undefined;

  const dispatch = createEventDispatcher();

  const state = {
    words: []
  };

  let actual = 0;

  const methods = {
    split(str) {
      return str.split(" ");
    },
    tracker_get(tag) {
      return (trackers || {})[tag] || new Tracker({ tag: tag });
    },
    textElementClick(element) {
      dispatch("textClick", element);
    },
    linkClick(link) {
      window.open(link, "_system");
    },
    note_to_array(str) {
      let parsed = extractor.parse(str, { includeGeneric: true });
      let matches = parsed.filter(trackableElement => {
        return (
          ("person", "context", "generic").indexOf(trackableElement.type) > -1
        );
      });
      actual = matches.length;
      return parsed;
    }
  };

  state.words = methods.note_to_array(note);
</script>

<style lang="scss">
  .n-note-textualized {
    &.inherit {
      font-size: inherit;
      line-height: inherit;
      letter-spacing: inherit;
    }

    .value {
      max-height: 15px;
      flex-shrink: 0;
      font-size: 10px;
      font-weight: bold;
      height: 14px;
      min-width: 14px;
      padding: 0 4px;
      color: #fff;
      border-radius: 6px;
      text-align: center;
      display: inline-block;
    }
    .string,
    .tracker,
    .person,
    .context {
      padding-right: 3px;
      flex-shrink: 0;
    }
    .remainder {
      padding-right: 5px;
      margin-left: -6px;
    }

    span {
      display: inline;
    }
  }
</style>

{#if actual}
  <div
    class="n-note-textualized {className}
    {state.words.length > 20 ? 'long-note' : 'short-note'}">
    {#each state.words as word}
      {#if word.type === 'tracker'}
        <span
          class="tracker font-weight-bold clickable text-primary-bright"
          on:click={() => {
            methods.textElementClick(word);
          }}>
          {` #${word.id} `}
        </span>
      {:else if word.type == 'person'}
        <span
          class="person font-weight-bold clickable text-primary-bright"
          on:click={() => {
            methods.textElementClick(word);
          }}>
          {` ${word.raw} `}
        </span>
      {:else if word.type == 'context'}
        <span
          class="context font-weight-bold clickable text-primary-bright"
          on:click={() => {
            methods.textElementClick(word);
          }}>
          {` ${word.raw} `}
        </span>
      {:else if word.type == 'link'}
        <span
          class="context font-weight-bold clickable text-primary-bright"
          on:click={() => {
            methods.linkClick(word.raw);
          }}>
          {` ${word.id} `}
        </span>
      {:else if word.type == 'line-break'}
        <br />
      {:else if word.raw}{word.raw + ' '}{/if}
      {#if word.remainder}
        <span class="remainder">{word.remainder.trim()}</span>
      {/if}
    {/each}
  </div>
{/if}
