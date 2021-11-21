<script>
  import { TrackerStore } from "../../store/tracker-store";
  import { PeopleStore } from "../../store/people-store";
  import { ContextStore } from "../../store/context-store";
  
  import tick from "../../utils/tick/tick";
  import NIcon from "../../components/icon/icon.svelte";
  import TrackerInputer from "../../modules/tracker/tracker-inputer";

  import { createEventDispatcher } from "svelte";
  import Button from "../button/button.svelte";
  import Avatar from "../avatar/avatar.svelte";
  const dispatch = createEventDispatcher();

  export let input = null;
  export let scroller = false;

  let state = {
    partialTag: null,
    results: [],
  };

  async function getTrackerInput(tracker) {
    let inputer = new TrackerInputer(tracker, $TrackerStore.trackers);
    return await inputer.getNoteString();
  }

  function close() {
    state.results = [];
  }

  /**
   * Auto Complete Search
   * Searches trackers, people and context
   * THIS IS A MESS
   *
   **/
  const autoCompleteSearch = (searchTag, type = "tracker") => {
    // Search for Trackers
    try {
      if (type == "tracker") {
        let tkrs = Object.keys($TrackerStore.trackers || {})
          .map((tag) => {
            return $TrackerStore.trackers[tag];
          })
          .filter((trk) => {
            return trk.tag.search(searchTag.replace("#", "")) > -1;
          });
        return tkrs.length ? tkrs : null;

        // Search for People
      } else if (type === "person") {
        let people = Object.keys($PeopleStore.people).filter((person) => {
          return person.search(searchTag.toLowerCase()) > -1;
        });
        return people.length
          ? people.map((username) => {
              return {
                tag: username,
                emoji: "👤",
                type: "person",
              };
            })
          : null;

        // Search for Context
      } else if (type === "context") {
        let context = $ContextStore.filter((term) => {
          let text = searchTag.replace("+", "").toLowerCase();
          term = term.toLowerCase();
          return term.search(text.toLowerCase()) > -1;
        });
        return context.length
          ? context.map((c) => {
              return { tag: c, emoji: "💡", type: "context", note: `+${c}` };
            })
          : null;
      }
    } catch (e) {}
  };

  const onSelect = async (tracker) => {
    let note = "";
    let partialTag = "";
    if (tracker.type === "person") {
      note = `@${tracker.tag} `;
      partialTag = `@${state.partialTag}`;
    } else if (tracker.type === "context") {
      note = `+${tracker.tag} `;
      partialTag = `${state.partialTag}`;
    } else {
      note = await getTrackerInput(tracker);
      partialTag = `#${state.partialTag.replace("#", "")}`;
    }
    // Split Input to in array
    const inputParts = input.split(" ").filter((word) => {
      return word != partialTag;
    });
    inputParts.push(note + " ");
    // Dispatch the Select
    dispatch("select", { tracker, note: inputParts.join(" ") });
    await tick(120);
    state.partialTag = null;
    state.results = null;
  };

  const onInput = (str) => {
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

  /**
   * Main Mount
   */

  let lastInput;
  $: if (lastInput != input) {
    lastInput = input;
    onInput(input);
  }
</script>

<style global lang="scss">
  .autocomplete-results.scroller {
    max-height: 48px;
    overflow: scroll;
    .tracker-list {
      margin-top: 0px;
      margin-bottom: 2px;
      max-height: 40px;
      display: flex;
      flex-wrap: nowrap !important;
      width: fit-content;
    }
  }
  .autocomplete-results.scroller .trackable-element {
    flex-shrink: 0;
    flex-grow: 0;
  }
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
      flex-grow: 0;
      flex-shrink: 0;
      max-width: 120px;
      white-space: pre;
    }
  }
</style>

<!--  -->
<div
  class="{scroller ? 'scroller' : 'no-scroller'} autocomplete-results animate {(state.results || []).length ? 'visible' : 'hidden'}">
  <div class="container p-0 tracker-list">
    <Button size="xs" icon on:click={close}>
      <NIcon name="close" className="fill-inverse-2" />
    </Button>
    {#each state.results || [] as tracker (tracker.tag)}
      <Button
        size="xs"
        className="m-1 trackable-element"
        color="light"
        shape="rounded"
        on:click={() => {
          onSelect(tracker);
        }}>

        {#if tracker.type == 'person'}
          <Avatar
            label={$PeopleStore.people[tracker.tag].username}
            src={$PeopleStore.people[tracker.tag].avatar}
            className="mr-2"
            size={16} />
        {:else}
          <Avatar emoji={tracker.emoji} className="mr-2" size={16} />
        {/if}
        <div style="max-width:120px;" class="ml-1 truncate">
          {#if tracker.type == 'person'}
            {$PeopleStore.people[tracker.tag].displayName}
          {:else if tracker.type == 'context'}
            {tracker.tag}
          {:else}{tracker.label}{/if}
        </div>
      </Button>
    {/each}
    <div class="filler" />
  </div>
</div>
