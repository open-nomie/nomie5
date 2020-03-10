<script>
  import { TrackerStore } from "../../store/trackers";
  import { PeopleStore } from "../../store/people-store";
  import { ContextStore } from "../../store/context-store";
  import Dymoji from "../../components/dymoji/dymoji.svelte";
  import tick from "../../utils/tick/tick";
  import TrackerInputer from "../../modules/tracker/tracker-inputer";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let input = null;

  let state = {
    partialTag: null,
    results: []
  };

  $: if (input) {
    onInput(input);
  }

  const getTrackerInput = async tracker => {
    let inputer = new TrackerInputer(tracker);
    return await inputer.getNoteString();
  };

  /**
   * Auto Complete Search
   * Searches trackers, people and context
   *
   **/
  const autoCompleteSearch = (searchTag, type = "tracker") => {
    // Search for Trackers
    if (type == "tracker") {
      let tkrs = Object.keys($TrackerStore || {})
        .map(tag => {
          return $TrackerStore[tag];
        })
        .filter(trk => {
          return trk.tag.search(searchTag.replace("#", "")) > -1;
        });
      return tkrs.length ? tkrs : null;

      // Search for People
    } else if (type === "person") {
      let people = Object.keys($PeopleStore.people).filter(person => {
        return person.search(searchTag.toLowerCase()) > -1;
      });
      return people.length
        ? people.map(username => {
            return {
              tag: username,
              emoji: "👤",
              type: "person"
            };
          })
        : null;

      // Search for Context
    } else if (type === "context") {
      let context = $ContextStore.filter(term => {
        let text = searchTag.replace("+", "").toLowerCase();
        term = term.toLowerCase();
        return term.search(text.toLowerCase()) > -1;
      });
      return context.length
        ? context.map(c => {
            return { tag: c, emoji: "💡", type: "context", note: `+${c}` };
          })
        : null;
    }
  };

  const onSelect = async tracker => {
    let note = "";

    if (tracker.type === "person") {
      // the Type is a Person - add the @
      note = `@${tracker.tag} `;
    } else if (tracker.type === "context") {
      // The Type is Context - add a +
      note = `+${tracker.tag} `;
    } else {
      // The Type is something else - use the TrackerInputer
      note = await getTrackerInput(tracker);
    }
    // Split Input to in array
    const inputParts = input.split(" ");
    // Replace last part with NOTE
    // TODO - could we use cursor position to make this
    // smarter
    inputParts[inputParts.length - 1] = note;

    // Dispatch the Select
    dispatch("select", { tracker, note: inputParts.join(" ") });
    await tick(120);
    state.partialTag = null;
    state.results = null;
  };

  const onInput = str => {
    let value = str;
    let last = value.charAt(value.length - 1);
    if (last == " ") {
      state.results = null;
    } else if (value.length) {
      let arr = value.split(" ");
      let tag = arr[arr.length - 1];
      state.cursorIndex = arr.length - 1;
      // If its a tag
      if (tag.charAt(0) === "#" && tag.length > 1) {
        state.partialTag = tag;
        state.results = autoCompleteSearch(tag, "tracker");
        // If its a person
      } else if (tag.charAt(0) === "@" && tag.length > 1) {
        state.partialTag = tag.replace(/\@/gi, "");
        state.results = autoCompleteSearch(state.partialTag, "person");
        // If it's context
      } else if (tag.charAt(0) === "+" && tag.length > 1) {
        state.partialTag = tag;
        state.results = autoCompleteSearch(tag, "context");
      } else {
        state.partialTag = null;
        state.results = null;
      }
    } else {
      state.partialTag = null;
      state.results = null;
    }
  };
</script>

<style lang="scss">
  .autocomplete-results {
    margin: 0px;
    border-radius: 2px;
    padding: 2px;
    transition: all 0.2s ease-in-out;
    z-index: 100;
    &.animate {
      &.visible {
        transition: all 0.2s ease-in-out;
        opacity: 1;
      }
      &.hidden {
        max-height: 0px !important;
        padding: 0;
        overflow: hidden;
        margin: 0;
        transition: all 0.2s ease-in-out;
        opacity: 0;
        pointer-events: none;
        transform: translateY(60px);
      }
    }

    .tracker-list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
    .btn {
      flex-grow: 1;
      flex-shrink: 1;
      box-shadow: var(--box-shadow-tight);
      background-color: var(--color-bg);
      color: var(--color-inverse-2);
      margin: 3px;
      font-size: 0.82rem;
      padding: 5px 6px;
    }
  }
</style>

<!--  -->
<div
  class="autocomplete-results animate {(state.results || []).length ? 'visible' : 'hidden'}">
  <div class="container p-0 tracker-list">
    {#each state.results || [] as tracker (tracker.tag)}
      <button
        class="btn btn-tracker-inline"
        on:click={() => {
          onSelect(tracker);
        }}>
        {#if tracker.type == 'person'}
          <Dymoji
            username={tracker.tag}
            className="mr-2"
            size={20}
            radius={0.3} />
        {:else}{tracker.emoji}{/if}
        {tracker.tag}
      </button>
    {/each}
    <div class="filler" />
  </div>
</div>
