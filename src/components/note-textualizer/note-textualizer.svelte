<script>
  import { createEventDispatcher } from "svelte";
  // Components
  import NTagBadge from "../tag-badge/tag-badge.svelte";

  //Utils
  import extractTrackers from "../../utils/extract-trackers/extract-trackers";

  // Modules
  import Tracker from "../../modules/tracker/tracker";

  // Props
  export let note = "";
  export let trackers = {};
  export let className = undefined;

  const dispatch = createEventDispatcher();

  const data = {
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
    parse_tracker_str(str) {
      let extractedTrackers = extractTrackers(str);
      let keys = Object.keys(extractedTrackers);
      if (keys.length) {
        return {
          type: "tracker",
          tracker: methods.tracker_get(extractedTrackers[keys[0]].tracker),
          value: extractedTrackers[keys[0]].value
        };
      } else {
        return {
          type: "tracker",
          tracker: new Tracker(),
          value: null
        };
      }
    },
    note_to_array(str) {
      let noteArray = [];
      let words = methods.split(str);
      let people = [];
      let context = [];

      words.forEach(word => {
        word = word.trim();
        const first = word.substr(0, 1);
        if (first === "#") {
          noteArray.push(methods.parse_tracker_str(word));
        } else if (first === "@") {
          people.push(word);
          noteArray.push({ type: "person", value: word });
          actual++;
        } else if (first === "+") {
          context.push(word);
          noteArray.push({ type: "context", value: word });
          actual++;
        } else if (word.length) {
          noteArray.push({ type: "string", value: word });
          actual++;
        }
      });
      return noteArray;
    }
  };

  data.words = methods.note_to_array(note);
</script>

<style lang="scss">
  .n-note-textualized {
    font-size: 1.1rem;
    line-height: 1.5rem;
    opacity: 0.8;
    margin-top: 6px;

    &.inherit {
      font-size: inherit;
      line-height: inherit;
    }

    .tracker {
      position: relative;
      padding-right: 2px;
      display: inline-block;
    }
    .value {
      max-height: 15px;
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
    span {
      display: inline;
    }
  }
</style>

{#if actual}
  <div class="n-note-textualized {className}">
    {#each data.words as word}
      {#if word.type === 'tracker'}
        <span class="tracker font-weight-bold">#{word.tracker.tag}</span>
      {:else if word.type == 'person'}
        <span
          class="person font-weight-bold clickable text-primary"
          on:click={() => {
            methods.textElementClick(word);
          }}>
          {word.value}
        </span>
      {:else if word.type == 'context'}
        <span
          class="context font-weight-bold clickable text-primary"
          on:click={() => {
            methods.textElementClick(word);
          }}>
          {word.value}
        </span>
      {:else}{word.value}{/if}
      {' '}
    {/each}
  </div>
{/if}
