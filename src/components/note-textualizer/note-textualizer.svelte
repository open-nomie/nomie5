<script>
  import { createEventDispatcher } from "svelte";
  // Components
  import NTagBadge from "../tag-badge/tag-badge.svelte";

  //Utils
  import extractTrackers from "../../utils/extract-trackers/extract-trackers";
  import extractPeople from "../../utils/extract-trackers/extract-people";
  import extractContext from "../../utils/extract-trackers/extract-context";
  import regexs from "../../utils/regex";

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
      let remainder = str.replace(regexs.tag, "").trim();
      let keys = Object.keys(extractedTrackers);
      if (keys.length) {
        return {
          type: "tracker",
          tracker: methods.tracker_get(extractedTrackers[keys[0]].tracker),
          value: extractedTrackers[keys[0]].value,
          remainder: remainder
        };
      } else {
        return {
          type: "tracker",
          tracker: new Tracker(),
          value: null,
          remainder: remainder
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
          let trackerMatch = methods.parse_tracker_str(word);
          noteArray.push(trackerMatch);
          if (trackerMatch.remainder.length) {
            noteArray.push({
              type: "remainder",
              value: trackerMatch.remainder
            });
          }
        } else if (first === "@") {
          let persons = extractPeople(word);
          let person = persons[0];
          if ((persons || []).length) {
            people.push(person);
            noteArray.push({ type: "person", value: "@" + person });
            let remainder = word
              .replace(person, "")
              .replace("@", "")
              .trim();
            if (remainder.length) {
              noteArray.push({ type: "remainder", value: remainder });
            }
          }
          actual++;
        } else if (first === "+") {
          let contexts = extractContext(word);
          let thisContext = contexts[0];
          if ((thisContext || []).length) {
            context.push(thisContext);
            noteArray.push({ type: "context", value: "+" + thisContext });
            let remainder = word
              .replace(thisContext, "")
              .replace("+", "")
              .trim();
            if (remainder.length) {
              noteArray.push({ type: "remainder", value: remainder });
            }
          }
          // context.push(word);
          // noteArray.push({ type: "context", value: word });
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
    .string,
    .tracker,
    .person,
    .context {
      padding-right: 5px;
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
  <div class="n-note-textualized {className}">
    {#each data.words as word}
      {#if word.type === 'tracker'}
        <span
          class="tracker font-weight-bold clickable text-primary-bright"
          on:click={() => {
            methods.textElementClick(word);
          }}>
          {` #${word.tracker.tag} `}
        </span>
      {:else if word.type == 'person'}
        <span
          class="person font-weight-bold clickable text-primary-bright"
          on:click={() => {
            methods.textElementClick(word);
          }}>
          {` ${word.value} `}
        </span>
      {:else if word.type == 'context'}
        <span
          class="context font-weight-bold clickable text-primary-bright"
          on:click={() => {
            methods.textElementClick(word);
          }}>
          {` ${word.value} `}
        </span>
      {:else if word.type == 'remainder'}
        <span class="remainder">{word.value.trim()}</span>
      {:else}{word.value + ' '}{/if}
    {/each}
  </div>
{/if}
